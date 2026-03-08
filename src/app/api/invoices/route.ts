import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ---------------------------------------------------------------------------
// GET /api/invoices
// List invoices with filters, pagination, and included relations.
// Scoped by organizationId from the authenticated user session.
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as any).organizationId;
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "25", 10))
    );
    const skip = (page - 1) * limit;

    // Filters
    const status = searchParams.get("status") ?? "";
    const matterId = searchParams.get("matterId") ?? "";
    const contactId = searchParams.get("contactId") ?? "";
    const startDate = searchParams.get("startDate") ?? "";
    const endDate = searchParams.get("endDate") ?? "";

    // Build where clause
    const where: any = { organizationId };

    if (status) {
      where.status = status;
    }

    if (matterId) {
      where.matterId = matterId;
    }

    if (contactId) {
      where.contactId = contactId;
    }

    if (startDate || endDate) {
      where.issueDate = {};
      if (startDate) {
        where.issueDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.issueDate.lte = new Date(endDate);
      }
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          matter: {
            select: { id: true, title: true, matterNumber: true },
          },
          contact: {
            select: { id: true, firstName: true, lastName: true, companyName: true },
          },
          payments: {
            select: { amount: true },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    const transformed = invoices.map((inv) => {
      const paymentTotal = inv.payments.reduce((sum, p) => sum + p.amount, 0);
      return {
        ...inv,
        matterTitle: inv.matter.title,
        contactName: inv.contact.companyName
          ? inv.contact.companyName
          : `${inv.contact.firstName ?? ""} ${inv.contact.lastName ?? ""}`.trim(),
        paymentTotal,
        balanceDue: inv.total - paymentTotal,
        payments: undefined,
      };
    });

    return NextResponse.json({
      invoices: transformed,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/invoices error:", error);
    return NextResponse.json(
      { error: "Failed to list invoices" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/invoices
// Create a new invoice. Auto-generates invoiceNumber (INV-YYYY-NNNNN).
// Calculates subtotal from linked timeEntries and expenses.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as any).organizationId;
    const body = await request.json();

    const {
      matterId,
      contactId,
      dueDate,
      timeEntryIds = [],
      expenseIds = [],
      tax = 0,
      notes,
      paymentTerms,
    } = body;

    // Validation
    if (!matterId) {
      return NextResponse.json(
        { error: "matterId is required" },
        { status: 400 }
      );
    }
    if (!contactId) {
      return NextResponse.json(
        { error: "contactId is required" },
        { status: 400 }
      );
    }
    if (!dueDate) {
      return NextResponse.json(
        { error: "dueDate is required" },
        { status: 400 }
      );
    }

    // Verify matter belongs to org
    const matter = await prisma.matter.findFirst({
      where: { id: matterId, organizationId },
    });
    if (!matter) {
      return NextResponse.json(
        { error: "Matter not found" },
        { status: 404 }
      );
    }

    // Generate invoice number: INV-YYYY-NNNNN
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;

    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        organizationId,
        invoiceNumber: { startsWith: prefix },
      },
      orderBy: { invoiceNumber: "desc" },
      select: { invoiceNumber: true },
    });

    let seq = 1;
    if (lastInvoice) {
      const parts = lastInvoice.invoiceNumber.split("-");
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1;
      }
    }

    const invoiceNumber = `${prefix}${String(seq).padStart(5, "0")}`;

    // Calculate subtotal from time entries and expenses
    let subtotal = 0;

    if (timeEntryIds.length > 0) {
      const timeEntries = await prisma.timeEntry.findMany({
        where: {
          id: { in: timeEntryIds },
          organizationId,
          matterId,
        },
      });

      for (const entry of timeEntries) {
        if (entry.billable && entry.rate) {
          subtotal += (entry.durationMinutes / 60) * entry.rate;
        }
      }
    }

    if (expenseIds.length > 0) {
      const expenses = await prisma.expense.findMany({
        where: {
          id: { in: expenseIds },
          matterId,
          billable: true,
        },
      });

      for (const expense of expenses) {
        subtotal += expense.amount;
      }
    }

    const taxAmount = parseFloat(String(tax)) || 0;
    const total = subtotal + taxAmount;

    // Create invoice and link time entries/expenses in a transaction
    const invoice = await prisma.$transaction(async (tx) => {
      const newInvoice = await tx.invoice.create({
        data: {
          organizationId,
          matterId,
          contactId,
          invoiceNumber,
          status: "DRAFT",
          dueDate: new Date(dueDate),
          subtotal: Math.round(subtotal * 100) / 100,
          tax: Math.round(taxAmount * 100) / 100,
          total: Math.round(total * 100) / 100,
          amountPaid: 0,
          notes: notes ?? null,
          paymentTerms: paymentTerms ?? null,
        },
      });

      // Link time entries to this invoice
      if (timeEntryIds.length > 0) {
        await tx.timeEntry.updateMany({
          where: {
            id: { in: timeEntryIds },
            organizationId,
            matterId,
          },
          data: {
            invoiceId: newInvoice.id,
            status: "BILLED",
          },
        });
      }

      // Link expenses to this invoice
      if (expenseIds.length > 0) {
        await tx.expense.updateMany({
          where: {
            id: { in: expenseIds },
            matterId,
          },
          data: {
            invoiceId: newInvoice.id,
          },
        });
      }

      return newInvoice;
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error("POST /api/invoices error:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ---------------------------------------------------------------------------
// GET /api/matters/[id]
// Full matter with relations: contacts, assignments, recent time entries,
// documents, tasks, notes, and immigration forms.
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as any).organizationId;
    const matterId = params.id;

    const matter = await prisma.matter.findFirst({
      where: {
        id: matterId,
        organizationId,
      },
      include: {
        matterContacts: {
          include: {
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                type: true,
                aNumber: true,
                currentImmigrationStatus: true,
              },
            },
          },
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
        },
        timeEntries: {
          orderBy: { date: "desc" },
          take: 20,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        documents: {
          orderBy: { createdAt: "desc" },
          take: 50,
          include: {
            uploadedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        tasks: {
          orderBy: [{ status: "asc" }, { dueDate: "asc" }],
        },
        notes: {
          orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        },
        immigrationForms: {
          orderBy: { createdAt: "asc" },
        },
        invoices: {
          orderBy: { issueDate: "desc" },
          take: 10,
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            issueDate: true,
            dueDate: true,
            total: true,
            amountPaid: true,
          },
        },
      },
    });

    if (!matter) {
      return NextResponse.json({ error: "Matter not found" }, { status: 404 });
    }

    // Compute summary stats
    const totalMinutes = matter.timeEntries.reduce(
      (sum, te) => sum + te.durationMinutes,
      0
    );
    const totalBilledAmount = matter.timeEntries.reduce((sum, te) => {
      if (te.billable && te.rate) {
        return sum + (te.durationMinutes / 60) * te.rate;
      }
      return sum;
    }, 0);

    // Transform contacts to include full name
    const contacts = matter.matterContacts.map((mc) => ({
      id: mc.id,
      contactId: mc.contact.id,
      role: mc.role,
      name: `${mc.contact.firstName ?? ""} ${mc.contact.lastName ?? ""}`.trim(),
      email: mc.contact.email,
      phone: mc.contact.phone,
      type: mc.contact.type,
      aNumber: mc.contact.aNumber,
      immigrationStatus: mc.contact.currentImmigrationStatus,
    }));

    const assignedUsers = matter.assignments.map((a) => ({
      id: a.user.id,
      name: `${a.user.firstName} ${a.user.lastName}`,
      email: a.user.email,
      role: a.role,
      userRole: a.user.role,
    }));

    const timeEntries = matter.timeEntries.map((te) => ({
      ...te,
      userName: `${te.user.firstName} ${te.user.lastName}`,
      user: undefined,
    }));

    const documents = matter.documents.map((d) => ({
      ...d,
      uploadedByName: `${d.uploadedBy.firstName} ${d.uploadedBy.lastName}`,
      uploadedBy: undefined,
    }));

    return NextResponse.json({
      ...matter,
      contacts,
      assignedUsers,
      timeEntries,
      documents,
      totalHours: Math.round((totalMinutes / 60) * 100) / 100,
      totalBilledAmount: Math.round(totalBilledAmount * 100) / 100,
      // Remove raw relations
      matterContacts: undefined,
      assignments: undefined,
    });
  } catch (error) {
    console.error("Error fetching matter:", error);
    return NextResponse.json(
      { error: "Failed to fetch matter" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/matters/[id]
// Update matter fields.
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as any).organizationId;
    const matterId = params.id;

    // Verify the matter belongs to this organization
    const existing = await prisma.matter.findFirst({
      where: { id: matterId, organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Matter not found" }, { status: 404 });
    }

    const body = await request.json();

    // Build update data, only including fields that were provided
    const updateData: any = {};
    const allowedFields = [
      "title",
      "description",
      "type",
      "status",
      "practiceArea",
      "billingType",
      "billingRate",
      "flatFeeAmount",
      "contingencyPct",
      "immigrationCaseType",
      "uscisReceiptNumber",
      "immigrationCourt",
      "criminalCaseStage",
      "chargeDescription",
      "courtName",
      "judgeName",
      "injuryType",
      "demandAmount",
      "settlementAmount",
      "tags",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Handle date fields separately to ensure proper conversion
    const dateFields = [
      "openDate",
      "closeDate",
      "solDate",
      "priorityDate",
      "nextHearingDate",
      "incidentDate",
    ];

    for (const field of dateFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field] ? new Date(body[field]) : null;
      }
    }

    // Handle numeric fields
    const numericFields = [
      "billingRate",
      "flatFeeAmount",
      "contingencyPct",
      "demandAmount",
      "settlementAmount",
    ];

    for (const field of numericFields) {
      if (updateData[field] !== undefined && updateData[field] !== null) {
        updateData[field] = parseFloat(updateData[field]);
      }
    }

    const updated = await prisma.matter.update({
      where: { id: matterId },
      data: updateData,
    });

    return NextResponse.json({ matter: updated });
  } catch (error) {
    console.error("Error updating matter:", error);
    return NextResponse.json(
      { error: "Failed to update matter" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/matters/[id]
// Archive a matter (set status to ARCHIVED). Does not hard-delete.
// ---------------------------------------------------------------------------

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as any).organizationId;
    const matterId = params.id;

    // Verify the matter belongs to this organization
    const existing = await prisma.matter.findFirst({
      where: { id: matterId, organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Matter not found" }, { status: 404 });
    }

    if (existing.status === "ARCHIVED") {
      return NextResponse.json(
        { error: "Matter is already archived" },
        { status: 400 }
      );
    }

    const archived = await prisma.matter.update({
      where: { id: matterId },
      data: {
        status: "ARCHIVED",
        closeDate: existing.closeDate ?? new Date(),
      },
    });

    return NextResponse.json({
      message: "Matter archived successfully",
      matter: archived,
    });
  } catch (error) {
    console.error("Error archiving matter:", error);
    return NextResponse.json(
      { error: "Failed to archive matter" },
      { status: 500 }
    );
  }
}

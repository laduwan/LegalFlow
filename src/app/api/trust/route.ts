import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ---------------------------------------------------------------------------
// GET /api/trust
// List trust accounts with summary, or return transactions/ledgers based on
// the ?type= query parameter. Scoped by organizationId.
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as any).organizationId;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") ?? "";

    // Return recent transactions
    if (type === "transactions") {
      const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
      const limit = Math.min(
        100,
        Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10))
      );
      const skip = (page - 1) * limit;
      const accountId = searchParams.get("accountId") ?? "";

      const where: any = {
        trustAccount: { organizationId },
      };

      if (accountId) {
        where.trustAccountId = accountId;
      }

      const [transactions, total] = await Promise.all([
        prisma.trustTransaction.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            trustLedger: {
              include: {
                contact: {
                  select: { id: true, firstName: true, lastName: true },
                },
                matter: {
                  select: { id: true, title: true, matterNumber: true },
                },
              },
            },
            approvedBy: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        }),
        prisma.trustTransaction.count({ where }),
      ]);

      return NextResponse.json({
        transactions,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    // Return client ledgers for a specific account
    if (type === "ledgers") {
      const accountId = searchParams.get("accountId");
      if (!accountId) {
        return NextResponse.json(
          { error: "accountId is required for ledger listing" },
          { status: 400 }
        );
      }

      // Verify account belongs to org
      const account = await prisma.trustAccount.findFirst({
        where: { id: accountId, organizationId },
      });
      if (!account) {
        return NextResponse.json(
          { error: "Trust account not found" },
          { status: 404 }
        );
      }

      const ledgers = await prisma.trustLedger.findMany({
        where: { trustAccountId: accountId },
        orderBy: { updatedAt: "desc" },
        include: {
          contact: {
            select: { id: true, firstName: true, lastName: true, companyName: true },
          },
          matter: {
            select: { id: true, title: true, matterNumber: true },
          },
        },
      });

      return NextResponse.json({ ledgers });
    }

    // Default: list trust accounts with summary
    const accounts = await prisma.trustAccount.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { ledgers: true },
        },
      },
    });

    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    const totalLedgers = accounts.reduce((sum, a) => sum + a._count.ledgers, 0);

    return NextResponse.json({
      accounts,
      summary: {
        totalBalance,
        totalLedgers,
        accountCount: accounts.length,
      },
    });
  } catch (error) {
    console.error("GET /api/trust error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve trust data" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/trust
// Create a trust transaction. For disbursements, validates sufficient funds
// and requires approvedById. Updates ledger and account balances atomically.
// MUST validate that disbursement does not create negative balance on any
// client ledger. Returns 400 error if it would.
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
      trustAccountId,
      trustLedgerId,
      type,
      amount,
      description,
      referenceNumber,
      payee,
      approvedById,
    } = body;

    // Validation
    if (!trustAccountId) {
      return NextResponse.json(
        { error: "trustAccountId is required" },
        { status: 400 }
      );
    }
    if (!trustLedgerId) {
      return NextResponse.json(
        { error: "trustLedgerId is required" },
        { status: 400 }
      );
    }
    if (!type) {
      return NextResponse.json(
        { error: "type is required" },
        { status: 400 }
      );
    }
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "amount must be a positive number" },
        { status: 400 }
      );
    }
    if (!description?.trim()) {
      return NextResponse.json(
        { error: "description is required" },
        { status: 400 }
      );
    }

    // Determine if this is a disbursement
    const isDisbursement = [
      "DISBURSEMENT_CLIENT",
      "DISBURSEMENT_FIRM",
      "DISBURSEMENT_THIRD_PARTY",
    ].includes(type);

    // Disbursements require an approver
    if (isDisbursement && !approvedById) {
      return NextResponse.json(
        { error: "approvedById is required for disbursements" },
        { status: 400 }
      );
    }

    // Verify account belongs to org
    const account = await prisma.trustAccount.findFirst({
      where: { id: trustAccountId, organizationId },
    });
    if (!account) {
      return NextResponse.json(
        { error: "Trust account not found" },
        { status: 404 }
      );
    }

    // Verify ledger belongs to this account
    const ledger = await prisma.trustLedger.findFirst({
      where: { id: trustLedgerId, trustAccountId },
    });
    if (!ledger) {
      return NextResponse.json(
        { error: "Trust ledger not found" },
        { status: 404 }
      );
    }

    const parsedAmount = parseFloat(String(amount));

    // CRITICAL: Check sufficient funds for disbursements — must not create
    // a negative balance on the client ledger.
    if (isDisbursement) {
      if (ledger.balance - parsedAmount < 0) {
        return NextResponse.json(
          {
            error:
              "Insufficient funds: disbursement would create negative client balance",
          },
          { status: 400 }
        );
      }
    }

    // Determine balance change: deposits add, disbursements/fees subtract
    const isCredit = type === "DEPOSIT" || type === "INTEREST";
    const balanceChange = isCredit ? parsedAmount : -parsedAmount;

    // Create transaction and update balances atomically
    const transaction = await prisma.$transaction(async (tx) => {
      // Update ledger balance
      await tx.trustLedger.update({
        where: { id: trustLedgerId },
        data: {
          balance: { increment: balanceChange },
        },
      });

      // Update account balance
      await tx.trustAccount.update({
        where: { id: trustAccountId },
        data: {
          balance: { increment: balanceChange },
        },
      });

      // Create the transaction record
      const newTransaction = await tx.trustTransaction.create({
        data: {
          trustAccountId,
          trustLedgerId,
          type,
          amount: parsedAmount,
          description: description.trim(),
          referenceNumber: referenceNumber ?? null,
          payee: payee ?? null,
          approvedById: approvedById ?? null,
          approvedAt: approvedById ? new Date() : null,
        },
        include: {
          trustLedger: {
            include: {
              contact: {
                select: { id: true, firstName: true, lastName: true },
              },
              matter: {
                select: { id: true, title: true },
              },
            },
          },
          approvedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      });

      return newTransaction;
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("POST /api/trust error:", error);
    return NextResponse.json(
      { error: "Failed to create trust transaction" },
      { status: 500 }
    );
  }
}

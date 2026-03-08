import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateMatterNumber } from "@/lib/utils";

// ---------------------------------------------------------------------------
// GET /api/matters
// List matters with pagination, search, status/type filters.
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
    const search = searchParams.get("search")?.trim() ?? "";
    const status = searchParams.get("status") ?? "";
    const type = searchParams.get("type") ?? "";
    const immigrationCaseType = searchParams.get("immigrationCaseType") ?? "";
    const billingType = searchParams.get("billingType") ?? "";

    // Build where clause
    const where: any = { organizationId };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (immigrationCaseType) {
      where.immigrationCaseType = immigrationCaseType;
    }

    if (billingType) {
      where.billingType = billingType;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { matterNumber: { contains: search, mode: "insensitive" } },
        { uscisReceiptNumber: { contains: search, mode: "insensitive" } },
        {
          matterContacts: {
            some: {
              contact: {
                OR: [
                  { firstName: { contains: search, mode: "insensitive" } },
                  { lastName: { contains: search, mode: "insensitive" } },
                ],
              },
            },
          },
        },
      ];
    }

    // Execute queries in parallel
    const [matters, total] = await Promise.all([
      prisma.matter.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          matterContacts: {
            where: { role: "Client" },
            take: 1,
            include: {
              contact: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
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
                },
              },
            },
          },
        },
      }),
      prisma.matter.count({ where }),
    ]);

    // Transform to include flattened primary client name
    const transformed = matters.map((m) => {
      const primaryContact = m.matterContacts[0]?.contact;
      const primaryClientName = primaryContact
        ? `${primaryContact.firstName ?? ""} ${primaryContact.lastName ?? ""}`.trim()
        : null;

      return {
        ...m,
        primaryClientName,
        assignedUsers: m.assignments.map((a) => ({
          id: a.user.id,
          name: `${a.user.firstName} ${a.user.lastName}`,
          role: a.role,
        })),
        matterContacts: undefined,
        assignments: undefined,
      };
    });

    return NextResponse.json({
      matters: transformed,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error listing matters:", error);
    return NextResponse.json(
      { error: "Failed to list matters" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/matters
// Create a new matter. Auto-generates matter number.
// Creates initial MatterContact for the primary client.
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
      title,
      description,
      type = "IMMIGRATION",
      practiceArea,
      primaryClientId,
      billingType = "HOURLY",
      billingRate,
      flatFeeAmount,
      contingencyPct,
      openDate,
      solDate,
      immigrationCaseType,
      uscisReceiptNumber,
      priorityDate,
      immigrationCourt,
      assignedUserIds = [],
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Generate matter number: find max sequence for this org + year
    const year = new Date().getFullYear();
    const prefix = type === "IMMIGRATION" ? "IMM" : type === "CRIMINAL" ? "CRM" : type === "PERSONAL_INJURY" ? "PI" : "GEN";
    const pattern = `${prefix}-${year}-`;

    const lastMatter = await prisma.matter.findFirst({
      where: {
        organizationId,
        matterNumber: { startsWith: pattern },
      },
      orderBy: { matterNumber: "desc" },
      select: { matterNumber: true },
    });

    let seq = 1;
    if (lastMatter) {
      const parts = lastMatter.matterNumber.split("-");
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1;
      }
    }

    const matterNumber = generateMatterNumber(prefix, seq);

    // Create matter and initial contacts/assignments in a transaction
    const matter = await prisma.$transaction(async (tx) => {
      const newMatter = await tx.matter.create({
        data: {
          organizationId,
          matterNumber,
          title,
          description: description ?? null,
          type,
          practiceArea: practiceArea ?? null,
          status: "INTAKE",
          billingType,
          billingRate: billingRate ? parseFloat(billingRate) : null,
          flatFeeAmount: flatFeeAmount ? parseFloat(flatFeeAmount) : null,
          contingencyPct: contingencyPct ? parseFloat(contingencyPct) : null,
          openDate: openDate ? new Date(openDate) : new Date(),
          solDate: solDate ? new Date(solDate) : null,
          immigrationCaseType: immigrationCaseType ?? null,
          uscisReceiptNumber: uscisReceiptNumber ?? null,
          priorityDate: priorityDate ? new Date(priorityDate) : null,
          immigrationCourt: immigrationCourt ?? null,
          primaryClientId: primaryClientId ?? null,
        },
      });

      // Create MatterContact for primary client
      if (primaryClientId) {
        await tx.matterContact.create({
          data: {
            matterId: newMatter.id,
            contactId: primaryClientId,
            role: "Client",
          },
        });
      }

      // Create MatterAssignment for assigned attorneys
      if (assignedUserIds.length > 0) {
        await tx.matterAssignment.createMany({
          data: assignedUserIds.map((userId: string) => ({
            matterId: newMatter.id,
            userId,
            role: "attorney",
          })),
        });
      }

      return newMatter;
    });

    return NextResponse.json({ matter }, { status: 201 });
  } catch (error) {
    console.error("Error creating matter:", error);
    return NextResponse.json(
      { error: "Failed to create matter" },
      { status: 500 }
    );
  }
}

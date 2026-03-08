import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ---------------------------------------------------------------------------
// GET /api/contacts — list contacts with pagination, search, type filter
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as any).organizationId;
    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10))
    );
    const search = searchParams.get("search")?.trim() ?? "";
    const type = searchParams.get("type")?.trim() ?? "";
    const status = searchParams.get("status")?.trim() ?? "";

    // Build where clause
    const where: any = { organizationId };

    if (type) {
      where.type = type;
    }

    if (status) {
      where.currentImmigrationStatus = status;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { aNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          type: true,
          firstName: true,
          middleName: true,
          lastName: true,
          companyName: true,
          email: true,
          phone: true,
          currentImmigrationStatus: true,
          aNumber: true,
          visaExpirationDate: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.contact.count({ where }),
    ]);

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/contacts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/contacts — create a new contact
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as any).organizationId;
    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validation
    if (!body.firstName?.trim()) {
      return NextResponse.json(
        { error: "First name is required" },
        { status: 400 }
      );
    }
    if (!body.lastName?.trim()) {
      return NextResponse.json(
        { error: "Last name is required" },
        { status: 400 }
      );
    }

    // Build data object — only include non-empty string fields
    const data: any = {
      organizationId,
      type: body.type || "CLIENT",
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
    };

    // Optional string fields
    const optionalStrings = [
      "middleName",
      "suffix",
      "preferredName",
      "companyName",
      "email",
      "phone",
      "altPhone",
      "fax",
      "addressLine1",
      "addressLine2",
      "city",
      "state",
      "zipCode",
      "country",
      "language",
      "communicationPreference",
      "aNumber",
      "countryOfBirth",
      "countryOfCitizenship",
      "currentImmigrationStatus",
      "passportNumber",
    ];

    for (const field of optionalStrings) {
      if (body[field]?.trim()) {
        data[field] = body[field].trim();
      }
    }

    // Optional date fields
    const optionalDates = [
      "dateOfBirth",
      "entryDate",
      "visaExpirationDate",
      "workAuthExpiration",
      "passportExpiration",
    ];

    for (const field of optionalDates) {
      if (body[field]) {
        const parsed = new Date(body[field]);
        if (!isNaN(parsed.getTime())) {
          data[field] = parsed;
        }
      }
    }

    const contact = await prisma.contact.create({ data });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("POST /api/contacts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

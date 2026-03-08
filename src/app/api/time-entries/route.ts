import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ---------------------------------------------------------------------------
// GET /api/time-entries
// List time entries with optional filters, pagination, and included relations.
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
      Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10))
    );
    const skip = (page - 1) * limit;

    // Filters
    const matterId = searchParams.get("matterId") ?? "";
    const userId = searchParams.get("userId") ?? "";
    const startDate = searchParams.get("startDate") ?? "";
    const endDate = searchParams.get("endDate") ?? "";
    const status = searchParams.get("status") ?? "";
    const billable = searchParams.get("billable");

    // Build where clause
    const where: any = { organizationId };

    if (matterId) {
      where.matterId = matterId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (billable !== null && billable !== "") {
      where.billable = billable === "true";
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const [timeEntries, total] = await Promise.all([
      prisma.timeEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "desc" },
        include: {
          matter: {
            select: { id: true, title: true, matterNumber: true },
          },
          user: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),
      prisma.timeEntry.count({ where }),
    ]);

    const transformed = timeEntries.map((entry) => ({
      ...entry,
      matterTitle: entry.matter.title,
      userName: `${entry.user.firstName} ${entry.user.lastName}`,
    }));

    return NextResponse.json({
      timeEntries: transformed,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/time-entries error:", error);
    return NextResponse.json(
      { error: "Failed to list time entries" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/time-entries
// Create a new time entry. Auto-sets rate from user hourlyRate if not provided.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as any).organizationId;
    const userId = (session.user as any).id;
    const body = await request.json();

    const {
      matterId,
      date,
      durationMinutes,
      activityType,
      description,
      billable = true,
      rate,
    } = body;

    // Validation
    if (!matterId) {
      return NextResponse.json(
        { error: "matterId is required" },
        { status: 400 }
      );
    }
    if (!date) {
      return NextResponse.json(
        { error: "date is required" },
        { status: 400 }
      );
    }
    if (!durationMinutes || durationMinutes <= 0) {
      return NextResponse.json(
        { error: "durationMinutes must be a positive number" },
        { status: 400 }
      );
    }
    if (!activityType) {
      return NextResponse.json(
        { error: "activityType is required" },
        { status: 400 }
      );
    }
    if (!description?.trim()) {
      return NextResponse.json(
        { error: "description is required" },
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

    // Auto-set rate from user's hourlyRate if not provided
    let finalRate = rate != null ? parseFloat(rate) : null;
    if (finalRate == null) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { hourlyRate: true },
      });
      finalRate = user?.hourlyRate ?? null;
    }

    const timeEntry = await prisma.timeEntry.create({
      data: {
        organizationId,
        matterId,
        userId,
        date: new Date(date),
        durationMinutes: parseInt(String(durationMinutes), 10),
        activityType,
        description: description.trim(),
        billable,
        rate: finalRate,
        status: "DRAFT",
      },
      include: {
        matter: {
          select: { id: true, title: true, matterNumber: true },
        },
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json({ timeEntry }, { status: 201 });
  } catch (error) {
    console.error("POST /api/time-entries error:", error);
    return NextResponse.json(
      { error: "Failed to create time entry" },
      { status: 500 }
    );
  }
}

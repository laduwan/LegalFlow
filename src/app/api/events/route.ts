import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ---------------------------------------------------------------------------
// GET /api/events
// List events with filters. Scoped by organizationId.
// Supports: date range (start, end), type, matterId for calendar range queries.
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
      200,
      Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10))
    );
    const skip = (page - 1) * limit;

    // Filters
    const start = searchParams.get("start") ?? "";
    const end = searchParams.get("end") ?? "";
    const type = searchParams.get("type") ?? "";
    const matterId = searchParams.get("matterId") ?? "";

    // Build where clause
    const where: any = { organizationId };

    // Date range filter for calendar range queries
    if (start && end) {
      where.startDatetime = {
        gte: new Date(start),
        lte: new Date(end),
      };
    } else if (start) {
      where.startDatetime = { gte: new Date(start) };
    } else if (end) {
      where.startDatetime = { lte: new Date(end) };
    }

    if (type) {
      where.type = type;
    }

    if (matterId) {
      where.matterId = matterId;
    }

    // Execute queries in parallel
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDatetime: "asc" },
        include: {
          matter: {
            select: {
              id: true,
              title: true,
              matterNumber: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    const transformed = events.map((evt) => ({
      id: evt.id,
      title: evt.title,
      type: evt.type,
      startDatetime: evt.startDatetime,
      endDatetime: evt.endDatetime,
      allDay: evt.allDay,
      location: evt.location,
      description: evt.description,
      reminderDays: evt.reminderDays,
      recurrence: evt.recurrence,
      createdAt: evt.createdAt,
      updatedAt: evt.updatedAt,
      createdByName: `${evt.createdBy.firstName} ${evt.createdBy.lastName}`.trim(),
      createdById: evt.createdBy.id,
      matter: evt.matter
        ? {
            id: evt.matter.id,
            title: evt.matter.title,
            matterNumber: evt.matter.matterNumber,
          }
        : null,
    }));

    return NextResponse.json({
      events: transformed,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error listing events:", error);
    return NextResponse.json(
      { error: "Failed to list events" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/events
// Create an event. Auto-creates reminder notifications based on reminderDays.
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
      title,
      type = "OTHER",
      startDatetime,
      endDatetime,
      allDay = false,
      location,
      description,
      matterId,
      reminderDays = [1, 7],
      recurrence,
    } = body;

    // Validation
    if (!title || !startDatetime) {
      return NextResponse.json(
        { error: "title and startDatetime are required" },
        { status: 400 }
      );
    }

    // If matterId is provided, verify it belongs to the same organization
    if (matterId) {
      const matter = await prisma.matter.findFirst({
        where: { id: matterId, organizationId },
        select: { id: true },
      });
      if (!matter) {
        return NextResponse.json(
          { error: "Matter not found or access denied" },
          { status: 404 }
        );
      }
    }

    // Create event and reminder notifications in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.event.create({
        data: {
          organizationId,
          title,
          type,
          startDatetime: new Date(startDatetime),
          endDatetime: endDatetime ? new Date(endDatetime) : null,
          allDay,
          location: location ?? null,
          description: description ?? null,
          matterId: matterId ?? null,
          reminderDays: Array.isArray(reminderDays)
            ? reminderDays.map(Number)
            : [Number(reminderDays)],
          recurrence: recurrence ?? null,
          createdById: userId,
        },
        include: {
          matter: {
            select: {
              id: true,
              title: true,
              matterNumber: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Auto-create reminder notifications for each reminderDays value
      const eventStart = new Date(startDatetime);
      const validReminderDays = (
        Array.isArray(reminderDays)
          ? reminderDays.map(Number)
          : [Number(reminderDays)]
      ).filter((d: number) => d > 0);

      if (validReminderDays.length > 0) {
        const notifications = validReminderDays.map((days: number) => {
          const reminderDate = new Date(eventStart);
          reminderDate.setDate(reminderDate.getDate() - days);

          return {
            userId,
            title: `Reminder: ${title}`,
            message: `${title} is coming up in ${days} day${days === 1 ? "" : "s"} on ${eventStart.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}.${location ? ` Location: ${location}` : ""}`,
            type: "event_reminder",
            link: `/calendar`,
            isRead: false,
            createdAt: reminderDate,
          };
        });

        await tx.notification.createMany({ data: notifications });
      }

      return event;
    });

    return NextResponse.json(
      {
        event: {
          ...result,
          createdByName: `${result.createdBy.firstName} ${result.createdBy.lastName}`.trim(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

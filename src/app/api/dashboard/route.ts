import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ---------------------------------------------------------------------------
// GET /api/dashboard
// Return dashboard summary data scoped by organizationId.
// Includes: active cases, upcoming deadlines, unbilled hours, trust balance,
// pending RFEs, recent activity, and upcoming events.
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = (session.user as any).organizationId;

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Execute all queries in parallel for performance
    const [
      activeCases,
      upcomingDeadlines,
      unbilledTimeEntries,
      trustAccounts,
      pendingRFEs,
      recentActivity,
      upcomingEvents,
    ] = await Promise.all([
      // Count of matters with status ACTIVE or PENDING
      prisma.matter.count({
        where: {
          organizationId,
          status: { in: ["ACTIVE", "PENDING"] },
        },
      }),

      // Count of events in the next 7 days
      prisma.event.count({
        where: {
          organizationId,
          startDatetime: {
            gte: now,
            lte: sevenDaysFromNow,
          },
        },
      }),

      // Sum of durationMinutes for DRAFT billable time entries
      prisma.timeEntry.aggregate({
        where: {
          organizationId,
          status: "DRAFT",
          billable: true,
        },
        _sum: {
          durationMinutes: true,
        },
      }),

      // Sum of all trust account balances
      prisma.trustAccount.aggregate({
        where: { organizationId },
        _sum: {
          balance: true,
        },
      }),

      // Count of immigration forms with status RFE_ISSUED
      prisma.immigrationForm.count({
        where: {
          matter: { organizationId },
          status: "RFE_ISSUED",
        },
      }),

      // Last 10 audit logs
      prisma.auditLog.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),

      // Events in the next 7 days
      prisma.event.findMany({
        where: {
          organizationId,
          startDatetime: {
            gte: now,
            lte: sevenDaysFromNow,
          },
        },
        orderBy: { startDatetime: "asc" },
        include: {
          matter: {
            select: { id: true, title: true, matterNumber: true },
          },
          createdBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),
    ]);

    const unbilledMinutes = unbilledTimeEntries._sum.durationMinutes ?? 0;
    const unbilledHours = Math.round((unbilledMinutes / 60) * 100) / 100;
    const trustBalance = trustAccounts._sum.balance ?? 0;

    return NextResponse.json({
      activeCases,
      upcomingDeadlines,
      unbilledHours,
      trustBalance,
      pendingRFEs,
      recentActivity: recentActivity.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        details: log.details,
        createdAt: log.createdAt,
        userName: log.user
          ? `${log.user.firstName} ${log.user.lastName}`
          : null,
      })),
      upcomingEvents: upcomingEvents.map((evt) => ({
        id: evt.id,
        title: evt.title,
        type: evt.type,
        startDatetime: evt.startDatetime,
        endDatetime: evt.endDatetime,
        allDay: evt.allDay,
        location: evt.location,
        matter: evt.matter
          ? {
              id: evt.matter.id,
              title: evt.matter.title,
              matterNumber: evt.matter.matterNumber,
            }
          : null,
        createdByName: evt.createdBy
          ? `${evt.createdBy.firstName} ${evt.createdBy.lastName}`
          : null,
      })),
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}

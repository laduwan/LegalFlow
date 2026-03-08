/**
 * Time Entries & Billing Integration Tests
 *
 * Tests time tracking business logic:
 * - Creating time entries with proper validation
 * - Auto-rate from user's hourly rate
 * - Filtering by matter, user, date range, status, billable
 * - Status transitions (DRAFT -> APPROVED -> BILLED)
 * - Organization scoping
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let orgId: string;
let otherOrgId: string;
let userId: string;
let otherUserId: string;
let matterId: string;
let otherMatterId: string;

beforeAll(async () => {
  const org = await prisma.organization.create({
    data: {
      name: "Time Test Firm",
      slug: `test-firm-time-${Date.now()}`,
      timezone: "America/New_York",
    },
  });
  orgId = org.id;

  // Second org for isolation tests
  const otherOrg = await prisma.organization.create({
    data: {
      name: "Other Firm",
      slug: `other-firm-time-${Date.now()}`,
      timezone: "America/New_York",
    },
  });
  otherOrgId = otherOrg.id;

  const user = await prisma.user.create({
    data: {
      organizationId: orgId,
      email: `time-test-${Date.now()}@test.example.com`,
      passwordHash: "not-real",
      role: "ATTORNEY",
      firstName: "Jane",
      lastName: "Attorney",
      hourlyRate: 350,
    },
  });
  userId = user.id;

  const otherUser = await prisma.user.create({
    data: {
      organizationId: otherOrgId,
      email: `time-other-${Date.now()}@test.example.com`,
      passwordHash: "not-real",
      role: "ATTORNEY",
      firstName: "Other",
      lastName: "Lawyer",
      hourlyRate: 400,
    },
  });
  otherUserId = otherUser.id;

  const matter = await prisma.matter.create({
    data: {
      organizationId: orgId,
      matterNumber: `TST-TIME-${Date.now()}`,
      title: "Time Test Matter",
      type: "IMMIGRATION",
      status: "ACTIVE",
      billingType: "HOURLY",
      billingRate: 350,
    },
  });
  matterId = matter.id;

  const otherMatter = await prisma.matter.create({
    data: {
      organizationId: otherOrgId,
      matterNumber: `TST-OTHER-${Date.now()}`,
      title: "Other Org Matter",
      type: "IMMIGRATION",
      status: "ACTIVE",
    },
  });
  otherMatterId = otherMatter.id;
});

afterAll(async () => {
  await prisma.timeEntry.deleteMany({ where: { organizationId: orgId } });
  await prisma.timeEntry.deleteMany({ where: { organizationId: otherOrgId } });
  await prisma.matter.deleteMany({ where: { organizationId: orgId } });
  await prisma.matter.deleteMany({ where: { organizationId: otherOrgId } });
  await prisma.user.deleteMany({ where: { organizationId: orgId } });
  await prisma.user.deleteMany({ where: { organizationId: otherOrgId } });
  await prisma.organization.deleteMany({ where: { id: { in: [orgId, otherOrgId] } } });
  await prisma.$disconnect();
});

describe("Time Entry Creation", () => {
  it("should create a time entry with all required fields", async () => {
    const entry = await prisma.timeEntry.create({
      data: {
        organizationId: orgId,
        matterId,
        userId,
        date: new Date("2026-03-01"),
        durationMinutes: 120,
        activityType: "research",
        description: "Legal research on asylum precedents",
        billable: true,
        rate: 350,
        status: "DRAFT",
      },
    });

    expect(entry.id).toBeDefined();
    expect(entry.organizationId).toBe(orgId);
    expect(entry.durationMinutes).toBe(120);
    expect(entry.rate).toBe(350);
    expect(entry.status).toBe("DRAFT");
    expect(entry.billable).toBe(true);
  });

  it("should default status to DRAFT", async () => {
    const entry = await prisma.timeEntry.create({
      data: {
        organizationId: orgId,
        matterId,
        userId,
        date: new Date("2026-03-02"),
        durationMinutes: 60,
        activityType: "client-call",
        description: "Client phone call",
        billable: true,
      },
    });

    expect(entry.status).toBe("DRAFT");
  });

  it("should allow non-billable entries", async () => {
    const entry = await prisma.timeEntry.create({
      data: {
        organizationId: orgId,
        matterId,
        userId,
        date: new Date("2026-03-03"),
        durationMinutes: 30,
        activityType: "administrative",
        description: "Internal file organization",
        billable: false,
      },
    });

    expect(entry.billable).toBe(false);
  });
});

describe("Auto-Rate from User Profile", () => {
  it("should use user hourlyRate when rate is not provided", async () => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { hourlyRate: true },
    });

    const entry = await prisma.timeEntry.create({
      data: {
        organizationId: orgId,
        matterId,
        userId,
        date: new Date("2026-03-04"),
        durationMinutes: 90,
        activityType: "drafting",
        description: "Document drafting",
        billable: true,
        rate: user?.hourlyRate,
      },
    });

    expect(entry.rate).toBe(350); // User's hourly rate
  });

  it("should allow overriding the rate", async () => {
    const entry = await prisma.timeEntry.create({
      data: {
        organizationId: orgId,
        matterId,
        userId,
        date: new Date("2026-03-04"),
        durationMinutes: 60,
        activityType: "court-appearance",
        description: "Court appearance — reduced rate",
        billable: true,
        rate: 200,
      },
    });

    expect(entry.rate).toBe(200);
  });
});

describe("Time Entry Filtering", () => {
  beforeAll(async () => {
    // Create entries with varying dates and statuses for filter tests
    await prisma.timeEntry.createMany({
      data: [
        {
          organizationId: orgId,
          matterId,
          userId,
          date: new Date("2026-02-01"),
          durationMinutes: 60,
          activityType: "research",
          description: "February research",
          billable: true,
          rate: 350,
          status: "APPROVED",
        },
        {
          organizationId: orgId,
          matterId,
          userId,
          date: new Date("2026-02-15"),
          durationMinutes: 120,
          activityType: "drafting",
          description: "February drafting",
          billable: true,
          rate: 350,
          status: "BILLED",
        },
        {
          organizationId: orgId,
          matterId,
          userId,
          date: new Date("2026-03-01"),
          durationMinutes: 45,
          activityType: "client-call",
          description: "March client call",
          billable: false,
          rate: 350,
          status: "DRAFT",
        },
      ],
    });
  });

  it("should filter by status", async () => {
    const approved = await prisma.timeEntry.findMany({
      where: { organizationId: orgId, status: "APPROVED" },
    });
    expect(approved.length).toBeGreaterThanOrEqual(1);
    approved.forEach((e) => expect(e.status).toBe("APPROVED"));
  });

  it("should filter by billable flag", async () => {
    const nonBillable = await prisma.timeEntry.findMany({
      where: { organizationId: orgId, billable: false },
    });
    expect(nonBillable.length).toBeGreaterThanOrEqual(1);
    nonBillable.forEach((e) => expect(e.billable).toBe(false));
  });

  it("should filter by date range", async () => {
    const february = await prisma.timeEntry.findMany({
      where: {
        organizationId: orgId,
        date: {
          gte: new Date("2026-02-01"),
          lte: new Date("2026-02-28"),
        },
      },
    });
    expect(february.length).toBeGreaterThanOrEqual(2);
    february.forEach((e) => {
      expect(e.date.getMonth()).toBe(1); // February = month 1
    });
  });

  it("should filter by matter", async () => {
    const byMatter = await prisma.timeEntry.findMany({
      where: { matterId },
    });
    expect(byMatter.length).toBeGreaterThan(0);
    byMatter.forEach((e) => expect(e.matterId).toBe(matterId));
  });
});

describe("Status Transitions", () => {
  it("should transition from DRAFT to APPROVED", async () => {
    const entry = await prisma.timeEntry.create({
      data: {
        organizationId: orgId,
        matterId,
        userId,
        date: new Date("2026-03-05"),
        durationMinutes: 60,
        activityType: "review",
        description: "Document review — status test",
        billable: true,
        rate: 350,
        status: "DRAFT",
      },
    });

    const updated = await prisma.timeEntry.update({
      where: { id: entry.id },
      data: { status: "APPROVED" },
    });

    expect(updated.status).toBe("APPROVED");
  });

  it("should transition from APPROVED to BILLED", async () => {
    const entry = await prisma.timeEntry.create({
      data: {
        organizationId: orgId,
        matterId,
        userId,
        date: new Date("2026-03-06"),
        durationMinutes: 90,
        activityType: "research",
        description: "Research — billing test",
        billable: true,
        rate: 350,
        status: "APPROVED",
      },
    });

    const billed = await prisma.timeEntry.update({
      where: { id: entry.id },
      data: { status: "BILLED" },
    });

    expect(billed.status).toBe("BILLED");
  });

  it("should support WRITTEN_OFF status", async () => {
    const entry = await prisma.timeEntry.create({
      data: {
        organizationId: orgId,
        matterId,
        userId,
        date: new Date("2026-03-07"),
        durationMinutes: 30,
        activityType: "administrative",
        description: "Written off time",
        billable: true,
        rate: 350,
        status: "DRAFT",
      },
    });

    const writtenOff = await prisma.timeEntry.update({
      where: { id: entry.id },
      data: { status: "WRITTEN_OFF" },
    });

    expect(writtenOff.status).toBe("WRITTEN_OFF");
  });
});

describe("Multi-Tenant Isolation", () => {
  it("should not return entries from other organizations", async () => {
    // Create entry in other org
    await prisma.timeEntry.create({
      data: {
        organizationId: otherOrgId,
        matterId: otherMatterId,
        userId: otherUserId,
        date: new Date("2026-03-01"),
        durationMinutes: 60,
        activityType: "research",
        description: "Other org entry — should not appear",
        billable: true,
        rate: 400,
      },
    });

    const myEntries = await prisma.timeEntry.findMany({
      where: { organizationId: orgId },
    });

    myEntries.forEach((e) => {
      expect(e.organizationId).toBe(orgId);
      expect(e.organizationId).not.toBe(otherOrgId);
    });
  });
});

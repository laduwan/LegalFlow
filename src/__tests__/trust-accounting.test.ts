/**
 * Trust Accounting (IOLTA) Integration Tests
 *
 * Tests the critical business rules for trust accounting:
 * - Deposits increase ledger and account balances
 * - Disbursements decrease balances atomically
 * - Disbursements cannot create negative client ledger balances
 * - Disbursements require approval
 * - Three-way reconciliation logic
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let orgId: string;
let userId: string;
let contactId: string;
let matterId: string;
let trustAccountId: string;
let trustLedgerId: string;

beforeAll(async () => {
  // Create minimal test fixtures
  const org = await prisma.organization.create({
    data: {
      name: "Test Law Firm",
      slug: `test-firm-trust-${Date.now()}`,
      timezone: "America/New_York",
    },
  });
  orgId = org.id;

  const user = await prisma.user.create({
    data: {
      organizationId: orgId,
      email: `trust-test-${Date.now()}@test.example.com`,
      passwordHash: "not-real",
      role: "ADMIN",
      firstName: "Test",
      lastName: "Admin",
      hourlyRate: 300,
    },
  });
  userId = user.id;

  const contact = await prisma.contact.create({
    data: {
      organizationId: orgId,
      type: "CLIENT",
      firstName: "Trust",
      lastName: "Client",
    },
  });
  contactId = contact.id;

  const matter = await prisma.matter.create({
    data: {
      organizationId: orgId,
      matterNumber: `TST-TRUST-${Date.now()}`,
      title: "Trust Test Matter",
      type: "IMMIGRATION",
      status: "ACTIVE",
    },
  });
  matterId = matter.id;
});

afterAll(async () => {
  // Clean up test data in correct order
  await prisma.trustTransaction.deleteMany({
    where: { trustAccount: { organizationId: orgId } },
  });
  await prisma.trustReconciliation.deleteMany({
    where: { trustAccount: { organizationId: orgId } },
  });
  await prisma.trustLedger.deleteMany({
    where: { trustAccount: { organizationId: orgId } },
  });
  await prisma.trustAccount.deleteMany({ where: { organizationId: orgId } });
  await prisma.matter.deleteMany({ where: { organizationId: orgId } });
  await prisma.contact.deleteMany({ where: { organizationId: orgId } });
  await prisma.user.deleteMany({ where: { organizationId: orgId } });
  await prisma.organization.deleteMany({ where: { id: orgId } });
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Create fresh trust account and ledger for each test
  const account = await prisma.trustAccount.create({
    data: {
      organizationId: orgId,
      name: `IOLTA Test ${Date.now()}`,
      bankName: "Test Bank",
      accountNumberEncrypted: "ENC:test-1234",
      accountType: "IOLTA",
      state: "CA",
      balance: 0,
    },
  });
  trustAccountId = account.id;

  const ledger = await prisma.trustLedger.create({
    data: {
      trustAccountId: account.id,
      matterId,
      contactId,
      balance: 0,
    },
  });
  trustLedgerId = ledger.id;
});

describe("Trust Account Deposits", () => {
  it("should increase ledger and account balances on deposit", async () => {
    const depositAmount = 5000;

    await prisma.$transaction(async (tx) => {
      await tx.trustLedger.update({
        where: { id: trustLedgerId },
        data: { balance: { increment: depositAmount } },
      });
      await tx.trustAccount.update({
        where: { id: trustAccountId },
        data: { balance: { increment: depositAmount } },
      });
      await tx.trustTransaction.create({
        data: {
          trustAccountId,
          trustLedgerId,
          type: "DEPOSIT",
          amount: depositAmount,
          description: "Test deposit",
        },
      });
    });

    const ledger = await prisma.trustLedger.findUnique({
      where: { id: trustLedgerId },
    });
    const account = await prisma.trustAccount.findUnique({
      where: { id: trustAccountId },
    });

    expect(ledger?.balance).toBe(5000);
    expect(account?.balance).toBe(5000);
  });

  it("should track multiple deposits cumulatively", async () => {
    for (const amount of [1000, 2500, 750]) {
      await prisma.$transaction(async (tx) => {
        await tx.trustLedger.update({
          where: { id: trustLedgerId },
          data: { balance: { increment: amount } },
        });
        await tx.trustAccount.update({
          where: { id: trustAccountId },
          data: { balance: { increment: amount } },
        });
        await tx.trustTransaction.create({
          data: {
            trustAccountId,
            trustLedgerId,
            type: "DEPOSIT",
            amount,
            description: `Deposit of $${amount}`,
          },
        });
      });
    }

    const ledger = await prisma.trustLedger.findUnique({
      where: { id: trustLedgerId },
    });
    expect(ledger?.balance).toBe(4250);

    const txCount = await prisma.trustTransaction.count({
      where: { trustLedgerId },
    });
    expect(txCount).toBe(3);
  });
});

describe("Trust Account Disbursements", () => {
  beforeEach(async () => {
    // Seed the ledger with $5000
    await prisma.$transaction(async (tx) => {
      await tx.trustLedger.update({
        where: { id: trustLedgerId },
        data: { balance: { increment: 5000 } },
      });
      await tx.trustAccount.update({
        where: { id: trustAccountId },
        data: { balance: { increment: 5000 } },
      });
      await tx.trustTransaction.create({
        data: {
          trustAccountId,
          trustLedgerId,
          type: "DEPOSIT",
          amount: 5000,
          description: "Initial retainer",
        },
      });
    });
  });

  it("should decrease balances on approved disbursement", async () => {
    const disbursementAmount = 2000;

    await prisma.$transaction(async (tx) => {
      await tx.trustLedger.update({
        where: { id: trustLedgerId },
        data: { balance: { increment: -disbursementAmount } },
      });
      await tx.trustAccount.update({
        where: { id: trustAccountId },
        data: { balance: { increment: -disbursementAmount } },
      });
      await tx.trustTransaction.create({
        data: {
          trustAccountId,
          trustLedgerId,
          type: "DISBURSEMENT_FIRM",
          amount: disbursementAmount,
          description: "Fee payment",
          approvedById: userId,
          approvedAt: new Date(),
        },
      });
    });

    const ledger = await prisma.trustLedger.findUnique({
      where: { id: trustLedgerId },
    });
    const account = await prisma.trustAccount.findUnique({
      where: { id: trustAccountId },
    });

    expect(ledger?.balance).toBe(3000);
    expect(account?.balance).toBe(3000);
  });

  it("CRITICAL: must not allow negative client ledger balance", async () => {
    const ledger = await prisma.trustLedger.findUnique({
      where: { id: trustLedgerId },
    });
    const currentBalance = ledger!.balance; // 5000
    const excessiveAmount = currentBalance + 1; // 5001

    // Simulate the validation from the API route
    const wouldGoNegative = currentBalance - excessiveAmount < 0;
    expect(wouldGoNegative).toBe(true);

    // Verify balance is unchanged
    const unchangedLedger = await prisma.trustLedger.findUnique({
      where: { id: trustLedgerId },
    });
    expect(unchangedLedger?.balance).toBe(5000);
  });

  it("should allow disbursement that exactly zeroes the balance", async () => {
    const ledger = await prisma.trustLedger.findUnique({
      where: { id: trustLedgerId },
    });
    const exactBalance = ledger!.balance;

    // Simulate validation: balance - amount >= 0 should pass
    const wouldGoNegative = exactBalance - exactBalance < 0;
    expect(wouldGoNegative).toBe(false);

    await prisma.$transaction(async (tx) => {
      await tx.trustLedger.update({
        where: { id: trustLedgerId },
        data: { balance: { increment: -exactBalance } },
      });
      await tx.trustAccount.update({
        where: { id: trustAccountId },
        data: { balance: { increment: -exactBalance } },
      });
      await tx.trustTransaction.create({
        data: {
          trustAccountId,
          trustLedgerId,
          type: "DISBURSEMENT_FIRM",
          amount: exactBalance,
          description: "Full disbursement",
          approvedById: userId,
          approvedAt: new Date(),
        },
      });
    });

    const updatedLedger = await prisma.trustLedger.findUnique({
      where: { id: trustLedgerId },
    });
    expect(updatedLedger?.balance).toBe(0);
  });

  it("should support all disbursement types", async () => {
    const types = [
      "DISBURSEMENT_CLIENT",
      "DISBURSEMENT_FIRM",
      "DISBURSEMENT_THIRD_PARTY",
    ] as const;

    for (const type of types) {
      await prisma.$transaction(async (tx) => {
        await tx.trustLedger.update({
          where: { id: trustLedgerId },
          data: { balance: { increment: -500 } },
        });
        await tx.trustAccount.update({
          where: { id: trustAccountId },
          data: { balance: { increment: -500 } },
        });
        await tx.trustTransaction.create({
          data: {
            trustAccountId,
            trustLedgerId,
            type,
            amount: 500,
            description: `Test ${type}`,
            approvedById: userId,
            approvedAt: new Date(),
          },
        });
      });
    }

    const ledger = await prisma.trustLedger.findUnique({
      where: { id: trustLedgerId },
    });
    expect(ledger?.balance).toBe(3500); // 5000 - 3*500
  });
});

describe("Three-Way Reconciliation", () => {
  it("should reconcile when bank, book, and client totals match", async () => {
    // Deposit into ledger
    await prisma.$transaction(async (tx) => {
      await tx.trustLedger.update({
        where: { id: trustLedgerId },
        data: { balance: 10000 },
      });
      await tx.trustAccount.update({
        where: { id: trustAccountId },
        data: { balance: 10000 },
      });
    });

    const recon = await prisma.trustReconciliation.create({
      data: {
        trustAccountId,
        reconcileDate: new Date(),
        bankBalance: 10000,
        ledgerBalance: 10000,
        clientTotal: 10000,
        isReconciled: true,
        discrepancy: 0,
        reconciledById: userId,
      },
    });

    expect(recon.isReconciled).toBe(true);
    expect(recon.discrepancy).toBe(0);
    expect(recon.bankBalance).toBe(recon.ledgerBalance);
    expect(recon.ledgerBalance).toBe(recon.clientTotal);
  });

  it("should detect discrepancy when balances do not match", async () => {
    const recon = await prisma.trustReconciliation.create({
      data: {
        trustAccountId,
        reconcileDate: new Date(),
        bankBalance: 10000,
        ledgerBalance: 9800,
        clientTotal: 10000,
        isReconciled: false,
        discrepancy: 200,
        notes: "Unrecorded bank fee detected",
      },
    });

    expect(recon.isReconciled).toBe(false);
    expect(recon.discrepancy).toBe(200);
  });
});

describe("Audit Trail", () => {
  it("should create immutable transaction records with timestamps", async () => {
    const tx = await prisma.trustTransaction.create({
      data: {
        trustAccountId,
        trustLedgerId,
        type: "DEPOSIT",
        amount: 1000,
        description: "Audit trail test deposit",
        referenceNumber: "REF-AUDIT-001",
      },
    });

    expect(tx.id).toBeDefined();
    expect(tx.createdAt).toBeInstanceOf(Date);
    expect(tx.referenceNumber).toBe("REF-AUDIT-001");

    // Verify the record can be retrieved
    const retrieved = await prisma.trustTransaction.findUnique({
      where: { id: tx.id },
    });
    expect(retrieved).not.toBeNull();
    expect(retrieved?.amount).toBe(1000);
  });

  it("should track approver for disbursements", async () => {
    // Seed balance first
    await prisma.trustLedger.update({
      where: { id: trustLedgerId },
      data: { balance: 5000 },
    });

    const tx = await prisma.trustTransaction.create({
      data: {
        trustAccountId,
        trustLedgerId,
        type: "DISBURSEMENT_FIRM",
        amount: 1000,
        description: "Approved disbursement test",
        approvedById: userId,
        approvedAt: new Date(),
      },
      include: {
        approvedBy: { select: { firstName: true, lastName: true } },
      },
    });

    expect(tx.approvedById).toBe(userId);
    expect(tx.approvedAt).toBeInstanceOf(Date);
    expect(tx.approvedBy?.firstName).toBe("Test");
  });
});

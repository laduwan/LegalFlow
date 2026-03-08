import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding LegalFlow database...\n");

  // ============================================================
  // ORGANIZATION
  // ============================================================
  const org = await prisma.organization.create({
    data: {
      name: "Garcia & Associates Immigration Law",
      slug: "garcia-associates",
      plan: "professional",
      billingEmail: "billing@garcialaw.example.com",
      trustAccountState: "CA",
      phone: "(213) 555-0100",
      address: "350 S Grand Ave, Suite 2100, Los Angeles, CA 90071",
      website: "https://garcialaw.example.com",
      timezone: "America/Los_Angeles",
    },
  });
  console.log(`Created organization: ${org.name}`);

  // ============================================================
  // USERS
  // ============================================================
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "elena.garcia@garcialaw.example.com",
      passwordHash,
      role: "ADMIN",
      firstName: "Elena",
      lastName: "Garcia",
      barNumber: "CA-123456",
      hourlyRate: 450,
      phone: "(213) 555-0101",
    },
  });

  const attorney = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "marcus.chen@garcialaw.example.com",
      passwordHash,
      role: "ATTORNEY",
      firstName: "Marcus",
      lastName: "Chen",
      barNumber: "CA-789012",
      hourlyRate: 350,
      phone: "(213) 555-0102",
    },
  });

  const paralegal = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "sofia.ramirez@garcialaw.example.com",
      passwordHash,
      role: "PARALEGAL",
      firstName: "Sofia",
      lastName: "Ramirez",
      hourlyRate: 150,
      phone: "(213) 555-0103",
    },
  });

  const assistant = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "james.wilson@garcialaw.example.com",
      passwordHash,
      role: "LEGAL_ASSISTANT",
      firstName: "James",
      lastName: "Wilson",
      hourlyRate: 100,
      phone: "(213) 555-0104",
    },
  });

  console.log(`Created ${4} users (password: Password123!)`);

  // ============================================================
  // CONTACTS (CLIENTS)
  // ============================================================
  const clientMaria = await prisma.contact.create({
    data: {
      organizationId: org.id,
      type: "CLIENT",
      firstName: "Maria",
      lastName: "Hernandez",
      email: "maria.hernandez@email.example.com",
      phone: "(213) 555-0201",
      addressLine1: "1234 Oak Street",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90012",
      country: "MX",
      language: "es",
      aNumber: "A-234-567-890",
      dateOfBirth: new Date("1988-03-15"),
      countryOfBirth: "MX",
      countryOfCitizenship: "MX",
      currentImmigrationStatus: "lpr",
      entryDate: new Date("2015-06-20"),
      portalEnabled: true,
      portalEmail: "maria.hernandez@email.example.com",
    },
  });

  const clientPatel = await prisma.contact.create({
    data: {
      organizationId: org.id,
      type: "CLIENT",
      firstName: "Raj",
      lastName: "Patel",
      email: "raj.patel@email.example.com",
      phone: "(310) 555-0301",
      addressLine1: "5678 Wilshire Blvd, Apt 4B",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90036",
      country: "IN",
      language: "en",
      aNumber: "A-345-678-901",
      dateOfBirth: new Date("1991-11-02"),
      countryOfBirth: "IN",
      countryOfCitizenship: "IN",
      currentImmigrationStatus: "h1b",
      entryDate: new Date("2019-10-01"),
      visaExpirationDate: new Date("2026-09-30"),
      workAuthExpiration: new Date("2026-09-30"),
    },
  });

  const clientNguyen = await prisma.contact.create({
    data: {
      organizationId: org.id,
      type: "CLIENT",
      firstName: "Linh",
      lastName: "Nguyen",
      email: "linh.nguyen@email.example.com",
      phone: "(626) 555-0401",
      addressLine1: "910 Broadway",
      city: "Alhambra",
      state: "CA",
      zipCode: "91801",
      country: "VN",
      language: "vi",
      aNumber: "A-456-789-012",
      dateOfBirth: new Date("1985-07-20"),
      countryOfBirth: "VN",
      countryOfCitizenship: "VN",
      currentImmigrationStatus: "asylee",
      entryDate: new Date("2020-01-15"),
    },
  });

  const clientOkafor = await prisma.contact.create({
    data: {
      organizationId: org.id,
      type: "CLIENT",
      firstName: "Chioma",
      lastName: "Okafor",
      email: "chioma.okafor@email.example.com",
      phone: "(818) 555-0501",
      addressLine1: "2345 Ventura Blvd",
      city: "Sherman Oaks",
      state: "CA",
      zipCode: "91403",
      country: "NG",
      language: "en",
      dateOfBirth: new Date("1993-01-10"),
      countryOfBirth: "NG",
      countryOfCitizenship: "NG",
      currentImmigrationStatus: "f1",
      entryDate: new Date("2021-08-15"),
      visaExpirationDate: new Date("2027-05-31"),
    },
  });

  const clientReyes = await prisma.contact.create({
    data: {
      organizationId: org.id,
      type: "CLIENT",
      firstName: "Carlos",
      lastName: "Reyes",
      email: "carlos.reyes@email.example.com",
      phone: "(562) 555-0601",
      addressLine1: "6789 Pacific Ave",
      city: "Long Beach",
      state: "CA",
      zipCode: "90802",
      country: "GT",
      language: "es",
      aNumber: "A-567-890-123",
      dateOfBirth: new Date("1979-09-25"),
      countryOfBirth: "GT",
      countryOfCitizenship: "GT",
      currentImmigrationStatus: "removal-proceedings",
      entryDate: new Date("2010-03-01"),
    },
  });

  // Opposing / third-party contacts
  const uscis = await prisma.contact.create({
    data: {
      organizationId: org.id,
      type: "GOVERNMENT_AGENCY",
      isOrganization: true,
      companyName: "USCIS California Service Center",
      addressLine1: "24000 Avila Rd",
      city: "Laguna Niguel",
      state: "CA",
      zipCode: "92677",
      phone: "(800) 375-5283",
    },
  });

  console.log(`Created 6 contacts (5 clients + 1 agency)`);

  // ============================================================
  // MATTERS
  // ============================================================
  const matterHernandez = await prisma.matter.create({
    data: {
      organizationId: org.id,
      matterNumber: "IMM-2025-001",
      type: "IMMIGRATION",
      status: "ACTIVE",
      title: "Hernandez - Remove Conditions on Residence (I-751)",
      description:
        "Petition to remove conditions on permanent residence. Joint filing with USC spouse.",
      primaryClientId: clientMaria.id,
      openDate: new Date("2025-06-15"),
      billingType: "FLAT_FEE",
      flatFeeAmount: 3500,
      immigrationCaseType: "family-based",
      uscisReceiptNumber: "MSC-25-123-45678",
      tags: ["family-based", "i-751", "priority"],
    },
  });

  const matterPatel = await prisma.matter.create({
    data: {
      organizationId: org.id,
      matterNumber: "IMM-2025-002",
      type: "IMMIGRATION",
      status: "ACTIVE",
      title: "Patel - H-1B to Green Card (EB-2)",
      description:
        "Employment-based green card through PERM labor certification and I-140/I-485.",
      primaryClientId: clientPatel.id,
      openDate: new Date("2025-04-01"),
      billingType: "HOURLY",
      billingRate: 350,
      immigrationCaseType: "employment-based",
      priorityDate: new Date("2024-11-15"),
      tags: ["employment-based", "eb2", "perm"],
    },
  });

  const matterNguyen = await prisma.matter.create({
    data: {
      organizationId: org.id,
      matterNumber: "IMM-2025-003",
      type: "IMMIGRATION",
      status: "ACTIVE",
      title: "Nguyen - Asylum Asylee Adjustment of Status",
      description: "One-year asylee filing I-485 adjustment of status to LPR.",
      primaryClientId: clientNguyen.id,
      openDate: new Date("2025-07-01"),
      billingType: "FLAT_FEE",
      flatFeeAmount: 4000,
      immigrationCaseType: "asylum",
      tags: ["asylum", "adjustment"],
    },
  });

  const matterOkafor = await prisma.matter.create({
    data: {
      organizationId: org.id,
      matterNumber: "IMM-2025-004",
      type: "IMMIGRATION",
      status: "INTAKE",
      title: "Okafor - F-1 to H-1B Change of Status",
      description: "F-1 OPT to H-1B change of status for software engineer position.",
      primaryClientId: clientOkafor.id,
      openDate: new Date("2026-01-10"),
      billingType: "FLAT_FEE",
      flatFeeAmount: 5000,
      immigrationCaseType: "h1b",
      tags: ["h1b", "change-of-status"],
    },
  });

  const matterReyes = await prisma.matter.create({
    data: {
      organizationId: org.id,
      matterNumber: "IMM-2025-005",
      type: "IMMIGRATION",
      status: "ACTIVE",
      title: "Reyes - Cancellation of Removal (Non-LPR)",
      description:
        "Cancellation of removal for non-LPR with 10+ years continuous physical presence.",
      primaryClientId: clientReyes.id,
      openDate: new Date("2025-03-15"),
      billingType: "HOURLY",
      billingRate: 450,
      immigrationCaseType: "removal-defense",
      immigrationCourt: "Los Angeles Immigration Court",
      nextHearingDate: new Date("2026-04-22"),
      tags: ["removal-defense", "cancellation", "court"],
    },
  });

  console.log(`Created 5 matters`);

  // ============================================================
  // MATTER CONTACTS & ASSIGNMENTS
  // ============================================================
  await prisma.matterContact.createMany({
    data: [
      { matterId: matterHernandez.id, contactId: clientMaria.id, role: "primary_client" },
      { matterId: matterPatel.id, contactId: clientPatel.id, role: "primary_client" },
      { matterId: matterNguyen.id, contactId: clientNguyen.id, role: "primary_client" },
      { matterId: matterOkafor.id, contactId: clientOkafor.id, role: "primary_client" },
      { matterId: matterReyes.id, contactId: clientReyes.id, role: "primary_client" },
      { matterId: matterReyes.id, contactId: uscis.id, role: "government_agency" },
    ],
  });

  await prisma.matterAssignment.createMany({
    data: [
      { matterId: matterHernandez.id, userId: attorney.id, role: "attorney" },
      { matterId: matterHernandez.id, userId: paralegal.id, role: "paralegal" },
      { matterId: matterPatel.id, userId: admin.id, role: "lead_attorney" },
      { matterId: matterPatel.id, userId: paralegal.id, role: "paralegal" },
      { matterId: matterNguyen.id, userId: attorney.id, role: "attorney" },
      { matterId: matterOkafor.id, userId: attorney.id, role: "attorney" },
      { matterId: matterOkafor.id, userId: assistant.id, role: "assistant" },
      { matterId: matterReyes.id, userId: admin.id, role: "lead_attorney" },
      { matterId: matterReyes.id, userId: paralegal.id, role: "paralegal" },
    ],
  });

  console.log("Created matter contacts & assignments");

  // ============================================================
  // IMMIGRATION FORMS
  // ============================================================
  await prisma.immigrationForm.createMany({
    data: [
      {
        matterId: matterHernandez.id,
        formType: "I-751",
        status: "FILED",
        receiptNumber: "MSC-25-123-45678",
        filedDate: new Date("2025-08-01"),
        receivedDate: new Date("2025-08-15"),
      },
      {
        matterId: matterPatel.id,
        formType: "I-140",
        status: "APPROVED_BY_USCIS",
        receiptNumber: "SRC-25-200-11111",
        filedDate: new Date("2025-05-15"),
        approvedDate: new Date("2025-11-01"),
      },
      {
        matterId: matterPatel.id,
        formType: "I-485",
        status: "RECEIVED",
        receiptNumber: "SRC-25-200-22222",
        filedDate: new Date("2025-12-01"),
        receivedDate: new Date("2025-12-20"),
      },
      {
        matterId: matterPatel.id,
        formType: "I-765",
        status: "RECEIVED",
        receiptNumber: "SRC-25-200-33333",
        filedDate: new Date("2025-12-01"),
        receivedDate: new Date("2025-12-20"),
      },
      {
        matterId: matterNguyen.id,
        formType: "I-485",
        status: "IN_PROGRESS",
      },
      {
        matterId: matterOkafor.id,
        formType: "I-129",
        status: "NOT_STARTED",
      },
      {
        matterId: matterReyes.id,
        formType: "EOIR-42B",
        status: "READY_FOR_REVIEW",
        reviewedBy: admin.id,
      },
      {
        matterId: matterReyes.id,
        formType: "EOIR-28",
        status: "FILED",
        filedDate: new Date("2025-03-20"),
      },
    ],
  });

  console.log("Created 8 immigration forms");

  // ============================================================
  // TIME ENTRIES
  // ============================================================
  const timeEntries = [
    {
      organizationId: org.id,
      matterId: matterPatel.id,
      userId: admin.id,
      date: new Date("2026-03-01"),
      durationMinutes: 120,
      activityType: "client-meeting",
      description: "Initial strategy meeting for EB-2 green card process",
      billable: true,
      rate: 450,
      status: "APPROVED" as const,
    },
    {
      organizationId: org.id,
      matterId: matterPatel.id,
      userId: paralegal.id,
      date: new Date("2026-03-02"),
      durationMinutes: 180,
      activityType: "immigration-forms",
      description: "Prepared I-485 supporting documents checklist and organized evidence",
      billable: true,
      rate: 150,
      status: "APPROVED" as const,
    },
    {
      organizationId: org.id,
      matterId: matterReyes.id,
      userId: admin.id,
      date: new Date("2026-03-03"),
      durationMinutes: 240,
      activityType: "hearing-prep",
      description: "Prepared witness declarations and country conditions evidence for merits hearing",
      billable: true,
      rate: 450,
      status: "BILLED" as const,
    },
    {
      organizationId: org.id,
      matterId: matterReyes.id,
      userId: paralegal.id,
      date: new Date("2026-03-03"),
      durationMinutes: 90,
      activityType: "research",
      description: "Researched Guatemala country conditions reports for cancellation claim",
      billable: true,
      rate: 150,
      status: "APPROVED" as const,
    },
    {
      organizationId: org.id,
      matterId: matterHernandez.id,
      userId: attorney.id,
      date: new Date("2026-03-04"),
      durationMinutes: 60,
      activityType: "client-call",
      description: "Called client to review I-751 receipt notice and next steps",
      billable: true,
      rate: 350,
      status: "DRAFT" as const,
    },
    {
      organizationId: org.id,
      matterId: matterNguyen.id,
      userId: attorney.id,
      date: new Date("2026-03-05"),
      durationMinutes: 150,
      activityType: "drafting",
      description: "Drafted asylee adjustment cover letter and compiled supporting docs",
      billable: true,
      rate: 350,
      status: "DRAFT" as const,
    },
    {
      organizationId: org.id,
      matterId: matterOkafor.id,
      userId: assistant.id,
      date: new Date("2026-03-06"),
      durationMinutes: 45,
      activityType: "administrative",
      description: "Organized employer support documents for H-1B petition",
      billable: true,
      rate: 100,
      status: "DRAFT" as const,
    },
    {
      organizationId: org.id,
      matterId: matterReyes.id,
      userId: admin.id,
      date: new Date("2026-03-07"),
      durationMinutes: 180,
      activityType: "court-appearance",
      description: "Attended master calendar hearing at LA Immigration Court",
      billable: true,
      rate: 450,
      status: "APPROVED" as const,
    },
  ];

  await prisma.timeEntry.createMany({ data: timeEntries });
  console.log(`Created ${timeEntries.length} time entries`);

  // ============================================================
  // INVOICES & PAYMENTS
  // ============================================================
  const invoice1 = await prisma.invoice.create({
    data: {
      organizationId: org.id,
      matterId: matterReyes.id,
      contactId: clientReyes.id,
      invoiceNumber: "INV-2026-001",
      status: "SENT",
      issueDate: new Date("2026-03-01"),
      dueDate: new Date("2026-03-31"),
      subtotal: 1800,
      tax: 0,
      total: 1800,
      amountPaid: 0,
      notes: "Hearing preparation — 4 hours at $450/hr",
      paymentTerms: "Net 30",
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      organizationId: org.id,
      matterId: matterPatel.id,
      contactId: clientPatel.id,
      invoiceNumber: "INV-2026-002",
      status: "PAID",
      issueDate: new Date("2026-02-15"),
      dueDate: new Date("2026-03-15"),
      subtotal: 1350,
      tax: 0,
      total: 1350,
      amountPaid: 1350,
      notes: "February services — strategy meeting and form preparation",
      paymentTerms: "Net 30",
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: invoice2.id,
      amount: 1350,
      method: "check",
      reference: "CHK-4521",
      date: new Date("2026-03-10"),
    },
  });

  const invoice3 = await prisma.invoice.create({
    data: {
      organizationId: org.id,
      matterId: matterHernandez.id,
      contactId: clientMaria.id,
      invoiceNumber: "INV-2025-010",
      status: "PARTIAL",
      issueDate: new Date("2025-08-01"),
      dueDate: new Date("2025-09-01"),
      subtotal: 3500,
      tax: 0,
      total: 3500,
      amountPaid: 2000,
      notes: "Flat fee — I-751 Petition to Remove Conditions",
      paymentTerms: "Net 30",
    },
  });

  await prisma.payment.createMany({
    data: [
      {
        invoiceId: invoice3.id,
        amount: 1500,
        method: "credit_card",
        reference: "CC-9182",
        date: new Date("2025-08-10"),
      },
      {
        invoiceId: invoice3.id,
        amount: 500,
        method: "credit_card",
        reference: "CC-9305",
        date: new Date("2025-10-01"),
      },
    ],
  });

  console.log("Created 3 invoices with payments");

  // ============================================================
  // TRUST ACCOUNTS & TRANSACTIONS
  // ============================================================
  const trustAccount = await prisma.trustAccount.create({
    data: {
      organizationId: org.id,
      name: "Garcia & Associates IOLTA",
      bankName: "First Republic Bank",
      accountNumberEncrypted: "ENC:xxxx-xxxx-1234",
      accountType: "IOLTA",
      state: "CA",
      balance: 18500,
    },
  });

  const ledgerReyes = await prisma.trustLedger.create({
    data: {
      trustAccountId: trustAccount.id,
      matterId: matterReyes.id,
      contactId: clientReyes.id,
      balance: 7500,
    },
  });

  const ledgerPatel = await prisma.trustLedger.create({
    data: {
      trustAccountId: trustAccount.id,
      matterId: matterPatel.id,
      contactId: clientPatel.id,
      balance: 5000,
    },
  });

  const ledgerHernandez = await prisma.trustLedger.create({
    data: {
      trustAccountId: trustAccount.id,
      matterId: matterHernandez.id,
      contactId: clientMaria.id,
      balance: 3500,
    },
  });

  const ledgerNguyen = await prisma.trustLedger.create({
    data: {
      trustAccountId: trustAccount.id,
      matterId: matterNguyen.id,
      contactId: clientNguyen.id,
      balance: 2500,
    },
  });

  // Trust transactions
  await prisma.trustTransaction.createMany({
    data: [
      {
        trustAccountId: trustAccount.id,
        trustLedgerId: ledgerReyes.id,
        type: "DEPOSIT",
        amount: 10000,
        description: "Initial retainer deposit — Reyes removal defense",
        referenceNumber: "DEP-001",
        createdAt: new Date("2025-03-20"),
      },
      {
        trustAccountId: trustAccount.id,
        trustLedgerId: ledgerReyes.id,
        type: "DISBURSEMENT_FIRM",
        amount: -2500,
        description: "Fee payment — March 2025 services",
        referenceNumber: "DSB-001",
        approvedById: admin.id,
        approvedAt: new Date("2025-04-01"),
        createdAt: new Date("2025-04-01"),
      },
      {
        trustAccountId: trustAccount.id,
        trustLedgerId: ledgerPatel.id,
        type: "DEPOSIT",
        amount: 5000,
        description: "Retainer deposit — EB-2 green card case",
        referenceNumber: "DEP-002",
        createdAt: new Date("2025-04-05"),
      },
      {
        trustAccountId: trustAccount.id,
        trustLedgerId: ledgerHernandez.id,
        type: "DEPOSIT",
        amount: 3500,
        description: "Flat fee deposit — I-751 petition",
        referenceNumber: "DEP-003",
        createdAt: new Date("2025-06-20"),
      },
      {
        trustAccountId: trustAccount.id,
        trustLedgerId: ledgerNguyen.id,
        type: "DEPOSIT",
        amount: 4000,
        description: "Retainer deposit — asylum adjustment case",
        referenceNumber: "DEP-004",
        createdAt: new Date("2025-07-05"),
      },
      {
        trustAccountId: trustAccount.id,
        trustLedgerId: ledgerNguyen.id,
        type: "DISBURSEMENT_THIRD_PARTY",
        amount: -1100,
        description: "USCIS filing fee — I-485",
        referenceNumber: "DSB-002",
        payee: "U.S. Department of Homeland Security",
        approvedById: admin.id,
        approvedAt: new Date("2025-09-01"),
        createdAt: new Date("2025-09-01"),
      },
      {
        trustAccountId: trustAccount.id,
        trustLedgerId: ledgerNguyen.id,
        type: "DISBURSEMENT_THIRD_PARTY",
        amount: -400,
        description: "Medical exam fee — I-693",
        referenceNumber: "DSB-003",
        payee: "Dr. Kim Medical Group",
        approvedById: admin.id,
        approvedAt: new Date("2025-09-15"),
        createdAt: new Date("2025-09-15"),
      },
    ],
  });

  // Reconciliation record
  await prisma.trustReconciliation.create({
    data: {
      trustAccountId: trustAccount.id,
      reconcileDate: new Date("2026-02-28"),
      bankBalance: 18500,
      ledgerBalance: 18500,
      clientTotal: 18500,
      isReconciled: true,
      discrepancy: 0,
      reconciledById: admin.id,
      notes: "February 2026 three-way reconciliation — all balances match.",
    },
  });

  console.log("Created trust account with 4 ledgers, 7 transactions, 1 reconciliation");

  // ============================================================
  // EVENTS / CALENDAR
  // ============================================================
  await prisma.event.createMany({
    data: [
      {
        organizationId: org.id,
        matterId: matterReyes.id,
        title: "Reyes — Merits Hearing",
        type: "COURT_HEARING",
        startDatetime: new Date("2026-04-22T09:00:00-07:00"),
        endDatetime: new Date("2026-04-22T12:00:00-07:00"),
        location: "LA Immigration Court, Rm 312",
        description: "Individual merits hearing for cancellation of removal",
        reminderDays: [1, 3, 7],
        createdById: admin.id,
      },
      {
        organizationId: org.id,
        matterId: matterPatel.id,
        title: "Patel — Biometrics Appointment",
        type: "OTHER",
        startDatetime: new Date("2026-03-20T10:00:00-07:00"),
        endDatetime: new Date("2026-03-20T11:00:00-07:00"),
        location: "USCIS Application Support Center, LA",
        description: "I-485 biometrics (fingerprints)",
        reminderDays: [1, 3],
        createdById: attorney.id,
      },
      {
        organizationId: org.id,
        matterId: matterOkafor.id,
        title: "Okafor — Consultation",
        type: "CONSULTATION",
        startDatetime: new Date("2026-03-12T14:00:00-07:00"),
        endDatetime: new Date("2026-03-12T15:00:00-07:00"),
        location: "Office — Conference Room A",
        description: "Review H-1B petition documents with client and employer rep",
        reminderDays: [1],
        createdById: attorney.id,
      },
      {
        organizationId: org.id,
        matterId: matterHernandez.id,
        title: "Hernandez — I-751 Interview",
        type: "CLIENT_MEETING",
        startDatetime: new Date("2026-05-15T13:00:00-07:00"),
        endDatetime: new Date("2026-05-15T14:30:00-07:00"),
        location: "USCIS Field Office, Los Angeles",
        description: "Joint interview for removal of conditions",
        reminderDays: [1, 7, 14],
        createdById: attorney.id,
      },
      {
        organizationId: org.id,
        title: "Staff Meeting",
        type: "INTERNAL_MEETING",
        startDatetime: new Date("2026-03-10T09:00:00-07:00"),
        endDatetime: new Date("2026-03-10T10:00:00-07:00"),
        location: "Office — Main Conference Room",
        description: "Weekly case review and assignment updates",
        reminderDays: [1],
        createdById: admin.id,
      },
      {
        organizationId: org.id,
        matterId: matterPatel.id,
        title: "Patel — EAD Expiration",
        type: "WORK_AUTH_EXPIRATION",
        startDatetime: new Date("2026-09-30T00:00:00-07:00"),
        allDay: true,
        description: "Raj Patel H-1B/EAD work authorization expires",
        reminderDays: [30, 60, 90],
        createdById: paralegal.id,
      },
    ],
  });

  console.log("Created 6 calendar events");

  // ============================================================
  // TASKS
  // ============================================================
  await prisma.task.createMany({
    data: [
      {
        matterId: matterOkafor.id,
        assigneeId: assistant.id,
        title: "Collect employer support letter and job description",
        priority: "high",
        status: "pending",
        dueDate: new Date("2026-03-15"),
      },
      {
        matterId: matterReyes.id,
        assigneeId: paralegal.id,
        title: "Prepare witness declarations for merits hearing",
        priority: "high",
        status: "in_progress",
        dueDate: new Date("2026-04-01"),
      },
      {
        matterId: matterNguyen.id,
        assigneeId: attorney.id,
        title: "Complete I-485 form and cover letter",
        priority: "medium",
        status: "in_progress",
        dueDate: new Date("2026-03-20"),
      },
      {
        matterId: matterPatel.id,
        assigneeId: paralegal.id,
        title: "Schedule biometrics appointment follow-up",
        priority: "low",
        status: "completed",
        dueDate: new Date("2026-03-10"),
      },
      {
        matterId: matterHernandez.id,
        assigneeId: attorney.id,
        title: "Prepare I-751 interview prep packet for client",
        priority: "medium",
        status: "pending",
        dueDate: new Date("2026-05-01"),
      },
    ],
  });

  console.log("Created 5 tasks");

  // ============================================================
  // DOCUMENTS
  // ============================================================
  await prisma.document.createMany({
    data: [
      {
        organizationId: org.id,
        matterId: matterHernandez.id,
        contactId: clientMaria.id,
        filename: "i751_receipt_notice.pdf",
        originalFilename: "I-751 Receipt Notice.pdf",
        filePath: "/documents/hernandez/i751_receipt_notice.pdf",
        fileSize: 245000,
        mimeType: "application/pdf",
        documentType: "receipt-notice",
        description: "USCIS receipt notice for I-751 petition",
        tags: ["i-751", "receipt"],
        isClientVisible: true,
        uploadedById: paralegal.id,
      },
      {
        organizationId: org.id,
        matterId: matterPatel.id,
        contactId: clientPatel.id,
        filename: "i140_approval_notice.pdf",
        originalFilename: "I-140 Approval Notice.pdf",
        filePath: "/documents/patel/i140_approval_notice.pdf",
        fileSize: 312000,
        mimeType: "application/pdf",
        documentType: "approval-notice",
        description: "I-140 approval notice for EB-2 petition",
        tags: ["i-140", "approval", "eb2"],
        isClientVisible: true,
        uploadedById: paralegal.id,
      },
      {
        organizationId: org.id,
        matterId: matterReyes.id,
        contactId: clientReyes.id,
        filename: "reyes_declaration.docx",
        originalFilename: "Reyes Declaration.docx",
        filePath: "/documents/reyes/reyes_declaration.docx",
        fileSize: 89000,
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        documentType: "evidence",
        description: "Client declaration for cancellation of removal",
        tags: ["declaration", "cancellation"],
        isClientVisible: false,
        uploadedById: admin.id,
      },
      {
        organizationId: org.id,
        matterId: matterReyes.id,
        filename: "guatemala_country_report_2025.pdf",
        originalFilename: "Guatemala Country Conditions Report 2025.pdf",
        filePath: "/documents/reyes/guatemala_country_report_2025.pdf",
        fileSize: 1250000,
        mimeType: "application/pdf",
        documentType: "evidence",
        description: "State Department country conditions report for Guatemala",
        tags: ["country-conditions", "guatemala", "evidence"],
        isClientVisible: false,
        uploadedById: paralegal.id,
      },
    ],
  });

  console.log("Created 4 documents");

  // ============================================================
  // AUDIT LOG SAMPLES
  // ============================================================
  await prisma.auditLog.createMany({
    data: [
      {
        organizationId: org.id,
        userId: admin.id,
        action: "CREATE",
        entityType: "Matter",
        entityId: matterReyes.id,
        details: { matterNumber: "IMM-2025-005", title: "Reyes - Cancellation of Removal" },
      },
      {
        organizationId: org.id,
        userId: admin.id,
        action: "APPROVE_DISBURSEMENT",
        entityType: "TrustTransaction",
        details: { amount: -2500, ledger: "Reyes" },
      },
      {
        organizationId: org.id,
        userId: paralegal.id,
        action: "UPLOAD",
        entityType: "Document",
        details: { filename: "i751_receipt_notice.pdf", matter: "IMM-2025-001" },
      },
    ],
  });

  console.log("Created 3 audit log entries");

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log("\n========================================");
  console.log("Seed complete!");
  console.log("========================================");
  console.log(`Organization: ${org.name}`);
  console.log(`Users: 4 (admin, attorney, paralegal, assistant)`);
  console.log(`Contacts: 6 (5 clients, 1 government agency)`);
  console.log(`Matters: 5 (all immigration)`);
  console.log(`Immigration forms: 8`);
  console.log(`Time entries: 8`);
  console.log(`Invoices: 3 (with payments)`);
  console.log(`Trust account: 1 (4 ledgers, 7 transactions)`);
  console.log(`Calendar events: 6`);
  console.log(`Tasks: 5`);
  console.log(`Documents: 4`);
  console.log("\nLogin credentials:");
  console.log(`  Admin:     elena.garcia@garcialaw.example.com / Password123!`);
  console.log(`  Attorney:  marcus.chen@garcialaw.example.com / Password123!`);
  console.log(`  Paralegal: sofia.ramirez@garcialaw.example.com / Password123!`);
  console.log(`  Assistant: james.wilson@garcialaw.example.com / Password123!`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

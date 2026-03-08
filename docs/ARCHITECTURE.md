# LegalFlow — System Architecture

> **Last Updated:** March 8, 2026

## Overview

LegalFlow is a legal practice management platform built for immigration law firms, with extensible architecture to support Criminal Defense and Personal Injury practice areas.

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 (App Router) | React-based SSR/SSG framework |
| Language | TypeScript | Type-safe development |
| Styling | Tailwind CSS | Utility-first CSS |
| UI Components | Custom (shadcn/ui pattern) | Consistent design system |
| State | React Query + Zustand | Server state + client state |
| Backend | Next.js API Routes | API layer (same deployment) |
| Database | PostgreSQL | Relational data store |
| ORM | Prisma | Type-safe database access |
| Auth | NextAuth.js | Authentication & sessions |
| Icons | Lucide React | Icon library |

## Project Structure

```
LegalFlow/
├── docs/
│   ├── ARCHITECTURE.md          # This file
│   └── INTEGRATIONS.md          # External services disclosure
├── prisma/
│   └── schema.prisma            # Database schema (40+ models)
├── src/
│   ├── app/
│   │   ├── (auth)/              # Auth pages (login, register)
│   │   ├── (dashboard)/         # Protected app pages
│   │   │   ├── dashboard/       # Main dashboard
│   │   │   ├── matters/         # Case management
│   │   │   ├── contacts/        # Client/contact CRM
│   │   │   ├── immigration/     # Immigration module
│   │   │   │   ├── forms/       # USCIS form tracking
│   │   │   │   ├── detainees/   # Detainee management
│   │   │   │   └── visas/       # Visa expiration tracking
│   │   │   ├── billing/         # Time tracking & invoicing
│   │   │   ├── trust/           # IOLTA trust accounting
│   │   │   ├── documents/       # Document management
│   │   │   ├── calendar/        # Calendar & deadlines
│   │   │   ├── portal/          # Client portal admin
│   │   │   └── settings/        # Firm settings & connections
│   │   ├── (portal)/            # Client-facing portal
│   │   └── api/                 # API routes
│   ├── components/
│   │   ├── ui/                  # Base UI components
│   │   └── layout/              # Sidebar, header
│   ├── lib/                     # Utilities, Prisma client, auth config
│   ├── types/                   # TypeScript type definitions
│   └── hooks/                   # Custom React hooks
├── .env                         # Environment variables
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Database Architecture

### Core Models (40+ tables)
- **Multi-tenancy**: All data scoped by `organizationId`
- **Users & Auth**: Organization, User, Session
- **CRM**: Contact (with immigration-specific fields)
- **Case Management**: Matter, MatterContact, MatterAssignment, Task, MatterNote
- **Immigration**: ImmigrationForm, Detainee, Facility, DetaineeTransfer, DetaineeCommunication
- **Billing**: TimeEntry, Expense, Invoice, Payment
- **Trust**: TrustAccount, TrustLedger, TrustTransaction, TrustReconciliation
- **Documents**: Document, DocumentTemplate
- **Calendar**: Event (with immigration-specific event types)
- **Audit**: AuditLog, AIAuditLog, Notification

### Key Design Decisions
1. **Organization-scoped**: Every query filters by `organizationId` for data isolation
2. **Timezone-aware**: All dates use `DateTime` with timezone, critical for legal deadlines
3. **Audit trail**: Immutable audit logs for compliance
4. **Soft deletes**: Matters are archived, not deleted
5. **Trust accounting safety**: Hard block on negative balances, approval workflows

## Authentication & Authorization

- **Provider**: NextAuth.js with credentials (email/password)
- **Password**: bcrypt with 12 salt rounds
- **Sessions**: JWT-based, 24-hour expiry
- **Roles**: ADMIN, ATTORNEY, PARALEGAL, LEGAL_ASSISTANT, READ_ONLY
- **Middleware**: All dashboard routes protected; unauthenticated users redirected to `/login`

## Immigration Module Architecture

The immigration module is the core differentiator:

```
Immigration Module
├── Forms Management
│   ├── USCIS Form Library (23+ form types)
│   ├── Status Pipeline (10-stage workflow)
│   ├── RFE Tracking & Deadline Alerts
│   └── Receipt Number Management
├── Detainee Tracking
│   ├── Facility Database
│   ├── Bond Status Management
│   ├── Transfer Tracking
│   └── Communication Logs
├── Visa & Status Tracking
│   ├── Expiration Dashboard (30/90/180 day alerts)
│   ├── Work Authorization Monitoring
│   └── Priority Date Tracking
└── External Resources
    ├── USCIS Case Status Lookup
    ├── ICE Detainee Locator
    ├── Visa Bulletin Monitor
    └── Processing Times Checker
```

## Trust Accounting (IOLTA)

Critical compliance feature:
- Per-client-per-matter ledgers within trust accounts
- **Hard block** on negative balance disbursements
- Three-way reconciliation: Bank balance vs Book balance vs Sum of client ledgers
- Approval workflow for all trust transactions
- Immutable transaction history

## Security Considerations

- Passwords hashed with bcrypt (never stored plaintext)
- JWT sessions with configurable expiry
- Organization-scoped data isolation (multi-tenant)
- Sensitive fields recommended for application-level encryption (passport numbers, bank account numbers)
- Audit logging for all data modifications
- Role-based access control at route and API level
- Client portal uses separate authentication flow
- No sensitive data in error messages or logs

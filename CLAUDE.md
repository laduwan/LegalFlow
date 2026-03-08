# CLAUDE.md - LegalFlow

This file provides guidance for AI assistants working on the LegalFlow codebase.

## Project Overview

**LegalFlow** is a legal practice management platform built for immigration law firms, with extensible architecture for Criminal Defense and Personal Injury practice areas.

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom shadcn/ui-pattern components in `src/components/ui/`
- **Database**: PostgreSQL + Prisma 5 ORM
- **Auth**: NextAuth.js (credentials provider, JWT sessions)
- **Icons**: Lucide React

## Repository Structure

```
LegalFlow/
├── docs/
│   ├── ARCHITECTURE.md        # System architecture overview
│   └── INTEGRATIONS.md        # External services disclosure (REQUIRED)
├── prisma/
│   └── schema.prisma          # 40+ database models
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login, register pages
│   │   ├── (dashboard)/       # Protected app pages (all modules)
│   │   ├── (portal)/          # Client-facing portal
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── ui/                # Base UI components
│   │   └── layout/            # Sidebar, header
│   ├── lib/                   # prisma.ts, auth.ts, utils.ts, constants.ts
│   ├── types/                 # TypeScript types
│   └── hooks/                 # Custom React hooks
├── .env                       # Environment variables (DO NOT COMMIT)
├── package.json
└── tailwind.config.ts
```

## Development Workflows

### Getting Started

```bash
npm install
npx prisma generate
npx prisma db push         # Apply schema to database
npm run dev                 # Start dev server at localhost:3000
```

### Environment Variables

Required in `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/legalflow"
NEXTAUTH_SECRET="your-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### Git Conventions

- **Default branch**: `main`
- **Branch naming**: `feature/case-management`, `fix/auth-redirect`
- **Commit messages**: Imperative mood, small focused changes

### Running Tests

```bash
npm run build              # Type-check and build
npm run lint               # ESLint
```

## Key Conventions

### Code Style

- Use domain-specific naming: `caseFile`, `courtFiling`, `clientIntake`
- All dates use timezone-aware timestamps (critical for legal deadlines)
- All database queries MUST be scoped by `organizationId` (multi-tenant)

### Immigration Module

- USCIS form types defined in `src/lib/constants.ts` (`USCIS_FORMS`)
- Immigration statuses in `IMMIGRATION_STATUSES`
- Form status pipeline in `FORM_STATUSES`
- Case types in `IMMIGRATION_CASE_TYPES`

### Trust Accounting (IOLTA)

- CRITICAL: Never allow negative client ledger balances
- All trust transactions require approval for disbursements
- Three-way reconciliation: Bank vs Book vs Client Ledger Total
- Immutable audit trail

### Integration Disclosure

- All external services documented in `docs/INTEGRATIONS.md`
- In-app connections page at `/settings/connections`
- Both locations MUST be kept in sync when adding new integrations

## Common Pitfalls

- Do not hardcode jurisdiction-specific rules — use configuration
- Be careful with date/time calculations (deadlines, statutes of limitations)
- Never log or expose sensitive client data (A-Numbers, passport numbers)
- Always validate legal document fields
- Trust accounting: always check balance before disbursement

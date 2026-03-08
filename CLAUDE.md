# CLAUDE.md - LegalFlow

This file provides guidance for AI assistants working on the LegalFlow codebase.

## Project Overview

**LegalFlow** is a legal case management SaaS platform purpose-built for **Immigration**, **Criminal Defense**, and **Personal Injury** attorneys. It is not a generic legal tool — every feature is tailored to these three practice areas.

**Target Price**: $60–65/user/month (all features included, no upgrade traps)

**Core Differentiators**:
1. Purpose-built for 3 practice areas (not generic)
2. Industry-first detainee tracking module
3. AI with mandatory attorney review workflow
4. Full IOLTA trust accounting (bar compliant, all 50 states)
5. All features included at one price

**Project Status**: Initial stage — repository bootstrapping.

## Technology Stack

```
Frontend:        Next.js 14+ (App Router) + TypeScript
UI Framework:    Tailwind CSS + shadcn/ui
State:           Zustand or React Query
Backend:         Node.js + tRPC (or REST)
Database:        PostgreSQL + Prisma ORM
Auth:            NextAuth.js or Clerk
File Storage:    AWS S3 or Cloudflare R2
Search:          Typesense or Meilisearch
AI:              Anthropic Claude API or OpenAI
Payments:        Stripe
Email:           Resend or SendGrid
Hosting:         Vercel (frontend) + Railway/Render (backend) or AWS
```

## Repository Structure

As the project grows, the expected structure will follow Next.js App Router conventions:

```
LegalFlow/
├── CLAUDE.md                # AI assistant guidance (this file)
├── src/
│   ├── app/                 # Next.js App Router pages & layouts
│   ├── components/          # Reusable UI components (shadcn/ui based)
│   ├── lib/                 # Shared utilities, helpers, constants
│   ├── server/              # tRPC routers, server-side logic
│   ├── db/                  # Prisma schema, migrations, seed data
│   └── types/               # Shared TypeScript type definitions
├── prisma/
│   └── schema.prisma        # Database schema
├── public/                  # Static assets
├── tests/                   # Test files
├── tailwind.config.ts
├── next.config.js
├── package.json
└── tsconfig.json
```

## Domain Model — Key Entities

### Practice Areas & Subtypes

- **Immigration**: Family-Based, Employment, Asylum, DACA, Removal Defense, Naturalization, TPS, U-Visa/T-Visa, Consular Processing
- **Criminal Defense**: Felony, Misdemeanor, DUI/DWI, Drug Offenses, White Collar, Juvenile, Federal, Appeals
- **Personal Injury**: Auto Accident, Slip & Fall, Medical Malpractice, Product Liability, Wrongful Death, Workers' Comp, Dog Bite

### Matter Model

Every case/matter includes:
- Matter ID (auto-generated, firm-prefixed)
- Matter type: `Immigration | Criminal | PersonalInjury | General`
- Status: `Intake | Active | Pending | Closed | Archived`
- Practice area subtype (see above)
- Client(s) and opposing party (linked to Contacts)
- Assigned attorney(s) and staff
- Open date, close date
- Statute of limitations date (with alerts)
- Custom fields (firm-configurable)
- Tags/labels

### User Roles (RBAC)

- **Admin** — firm owner, full access
- **Attorney** — case management, billing, AI usage
- **Paralegal** — case support, limited billing
- **Legal Assistant** — document management, scheduling
- **Read-only** — auditors, client portal viewers

### Multi-Tenancy

Each firm is fully isolated. All queries must be scoped to the firm's `tenantId`. Never allow cross-tenant data access.

## Development Workflows

### Git Conventions

- **Default branch**: `main`
- **Branch naming**: Use descriptive branch names (e.g., `feature/case-management`, `fix/auth-redirect`)
- **Commit messages**: Use clear, imperative-mood messages (e.g., "Add case intake form", "Fix date parsing in contract module")
- Commit frequently with small, focused changes

### Getting Started

Once the project is scaffolded:

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in DATABASE_URL, NEXTAUTH_SECRET, etc.

# Run database migrations
npx prisma migrate dev

# Seed the database (if seed script exists)
npx prisma db seed

# Start development server
npm run dev

# Run tests
npm test

# Run linter
npm run lint
```

### Environment Variables (Expected)

```
DATABASE_URL=           # PostgreSQL connection string
NEXTAUTH_SECRET=        # Auth secret key
NEXTAUTH_URL=           # App URL (http://localhost:3000 in dev)
ANTHROPIC_API_KEY=      # Claude API key (for AI features)
STRIPE_SECRET_KEY=      # Stripe billing
STRIPE_WEBHOOK_SECRET=  # Stripe webhook verification
S3_BUCKET=              # File storage bucket
S3_REGION=              # File storage region
S3_ACCESS_KEY=          # File storage credentials
S3_SECRET_KEY=          # File storage credentials
RESEND_API_KEY=         # Email service
```

## Key Conventions

### Code Style

- Follow the conventions established by the project's linter/formatter configuration
- Prefer clarity over cleverness, especially in legal domain logic
- Use meaningful, domain-specific naming (e.g., `matter`, `courtFiling`, `clientIntake`, `ioltaAccount`, `detaineeRecord`)
- TypeScript strict mode — no `any` types unless absolutely unavoidable

### Authentication & Security

- **2FA (TOTP) is required for all users** — never make it optional
- All auth events must be written to an audit log
- Sessions use secure token handling; enforce session expiry
- Password reset must go through email verification flow

### Multi-Tenancy Rules

- Every database query MUST be scoped to the firm's tenant ID
- Never expose data from one firm to another
- Test tenant isolation explicitly in integration tests

### AI Integration Rules

- All AI-generated content MUST go through a mandatory attorney review workflow
- AI output is never auto-applied — it is always a suggestion/draft
- Log all AI interactions for auditability
- Use the Anthropic Claude API as the primary AI provider

### IOLTA Trust Accounting

- Must be bar-compliant across all 50 US states
- Trust funds are sacred — never mix with operating accounts
- Every transaction must have a complete audit trail
- Three-way reconciliation: bank balance, book balance, client ledger balance
- Interest on Lawyer Trust Accounts must follow jurisdictional rules

### Legal Domain Notes

- Legal terminology must be used consistently throughout the codebase
- Date handling is critical — always use timezone-aware timestamps (UTC storage, local display)
- Document retention and audit trails are required — design with auditability in mind
- Access control and data privacy are paramount for legal data
- Consider compliance requirements (attorney-client privilege, data protection regulations)
- Conflict checking is mandatory on new matter creation (search all parties across the firm)

## Feature Roadmap (Phased)

### Phase 1: Core MVP (Months 1–4)
- Authentication & user management (email/password, 2FA, RBAC, multi-tenancy)
- Case/matter management (CRUD, views: dashboard/list/kanban/timeline, conflict checks, templates)
- Contact management (clients, opposing parties, courts, agencies)
- Task & deadline management (templates, court rules integration, automated reminders)
- Document management (upload, templates, versioning, folder organization)
- Time tracking & basic billing (timers, expense tracking, invoice generation)
- Calendar integration (deadlines, hearings, appointments)

### Phase 2: Practice-Area Modules (Months 5–7)
- Immigration module (visa tracker, form autofill, USCIS receipt tracking, detainee tracking)
- Criminal defense module (court date tracking, plea tracker, discovery management, sentencing calculator)
- Personal injury module (medical records tracker, demand package builder, settlement calculator, lien tracking)

### Phase 3: Advanced Features (Months 8–10)
- IOLTA trust accounting (three-way reconciliation, all 50 states)
- Client portal (read-only access, secure messaging, document sharing)
- AI assistant (document drafting, case research, deadline analysis — with mandatory review)
- Reporting & analytics (firm dashboard, attorney productivity, revenue tracking)

### Phase 4: Growth (Months 11–12)
- Integrations (court e-filing, LexisNexis, Google Workspace, Outlook, QuickBooks)
- Advanced workflows (custom automation, conditional task triggers)
- Mobile optimization (responsive design, PWA)

## Case/Matter Views

When building matter views, support these four layouts:
1. **Dashboard (cards)**: Active matters with status, next deadline, days open
2. **List view**: Sortable/filterable table
3. **Kanban**: Drag matters between status columns
4. **Timeline**: Chronological case events

Quick actions available from any view: Add note, Add task, Upload document, Log time.

## Testing

- Write tests for all business logic, especially legal workflow rules
- Test RBAC enforcement — verify that roles cannot exceed their permissions
- Test multi-tenancy isolation — ensure no cross-firm data leaks
- Test IOLTA accounting math — financial calculations must be exact (use decimal types, not floats)
- Test conflict checking logic thoroughly
- Test statute of limitations alerting
- Update this section with the test runner command once established

## Common Pitfalls

- **Do not hardcode jurisdiction-specific rules** — use configuration or data-driven approaches
- **Be careful with date/time calculations** (deadlines, statutes of limitations) — always timezone-aware
- **Ensure sensitive client data is never logged or exposed** in error messages or stack traces
- **Do not skip validation on legal document fields** — incomplete filings have real consequences
- **Never use floating-point for money** — use Prisma `Decimal` / integer cents for all financial amounts
- **Never bypass 2FA** — it is mandatory for all users, not optional
- **Never auto-apply AI output** — always require attorney review
- **Never allow cross-tenant data access** — scope every query to the firm's tenant ID
- **Conflict checks are not optional** — run them on every new matter and new contact

## Environment & Deployment

- **Frontend**: Vercel (recommended) for Next.js
- **Backend/DB**: Railway, Render, or AWS for PostgreSQL and backend services
- **File Storage**: AWS S3 or Cloudflare R2
- **CI/CD**: Update this section once pipeline is configured
- **Environments**: development, staging, production

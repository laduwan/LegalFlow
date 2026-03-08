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

---

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
- Billing type: `Hourly | FlatFee | Contingency | Hybrid`
- Custom fields (firm-configurable)
- Tags/labels

### Contact Model

Contacts represent all people and organizations in the system:
- Type: `Client | OpposingParty | Witness | Expert | Court | MedicalProvider | Insurance | Other`
- Person vs Organization flag
- Name fields (first, middle, last, suffix, preferred name)
- Multiple addresses, phones, emails
- Language preference and communication preferences
- Linked matters, notes, documents, custom fields

**Immigration-specific contact fields**: A-Number, date of birth, country of birth/citizenship, current immigration status, entry date, visa expiration, work authorization expiration

**Personal Injury-specific contact fields**: Date of incident, incident type, insurance information, linked medical providers, linked liens

### Intake Workflow

- Embeddable intake forms (public URL generation)
- Drag-drop form builder
- Lead pipeline: `New → Contacted → Consultation → Retained → Declined`
- Auto-create matter on retention
- E-signature for retainer agreements

### User Roles (RBAC)

- **Admin** — firm owner, full access
- **Attorney** — case management, billing, AI usage
- **Paralegal** — case support, limited billing
- **Legal Assistant** — document management, scheduling
- **Read-only** — auditors, client portal viewers

### Multi-Tenancy

Each firm is fully isolated. All queries must be scoped to the firm's `tenantId`. Never allow cross-tenant data access.

---

## Database Schema (Key Tables)

```sql
-- Organizations (firms)
organizations (id, name, slug, plan, billing_email, trust_account_state, created_at)

-- Users
users (id, organization_id, email, password_hash, role, first_name, last_name,
       bar_number, hourly_rate, 2fa_enabled, created_at)

-- Contacts
contacts (id, organization_id, type, is_organization, first_name, last_name,
          company_name, email, phone, address, language,
          -- Immigration: a_number, country_of_birth, immigration_status
          -- PI: incident_date, insurance_info
          created_at)

-- Matters
matters (id, organization_id, matter_number, type, status, practice_area,
         primary_client_id, assigned_attorney_id, open_date, close_date,
         sol_date, billing_type, billing_rate, created_at)

-- Matter contacts (join table)
matter_contacts (matter_id, contact_id, role)

-- Time entries
time_entries (id, organization_id, matter_id, user_id, date, duration_minutes,
             activity_type, description, billable, rate, status, invoice_id, created_at)

-- Trust accounts
trust_accounts (id, organization_id, name, bank_name, account_number_encrypted,
               account_type, state, balance, created_at)

-- Trust ledgers (per client per matter)
trust_ledgers (id, trust_account_id, matter_id, contact_id, balance, created_at)

-- Trust transactions
trust_transactions (id, trust_account_id, trust_ledger_id, type, amount,
                   description, reference_number, approved_by_id, created_at)

-- Documents
documents (id, organization_id, matter_id, contact_id, filename, file_path,
          file_size, mime_type, document_type, version, uploaded_by_id, created_at)

-- Events
events (id, organization_id, matter_id, title, type, start_datetime,
       end_datetime, location, description, created_by_id, created_at)

-- Detainees (Immigration/Criminal)
detainees (id, organization_id, contact_id, matter_id, a_number, booking_number,
          current_facility_id, legal_status, bond_amount, bond_status,
          next_hearing_date, created_at)

-- Facilities
facilities (id, name, type, address, phone, ice_field_office, created_at)

-- Medical treatments (PI)
medical_treatments (id, matter_id, provider_id, treatment_date, type, diagnosis,
                   bill_amount, record_status, created_at)

-- Liens (PI)
liens (id, matter_id, lien_holder_id, type, asserted_amount, negotiated_amount,
      final_amount, status, created_at)

-- AI audit log
ai_audit_log (id, organization_id, user_id, matter_id, feature, input_hash,
             input_preview, output_hash, output_preview, final_value_hash,
             approved, approved_by_id, created_at)
```

---

## Time Tracking & Billing

### Time Entry Model
- Matter (required), user, date, duration (hours/minutes)
- Activity type (configurable: Research, Drafting, Court, Client Meeting, etc.)
- Billable flag, billing rate (default from user, overridable per matter)
- Status: `Draft | Approved | Billed | WrittenOff`

### Billing Types Per Matter
- **Hourly**: default rate + matter-specific overrides
- **Flat fee**: with payment schedule
- **Contingency**: percentage, with settlement calculator
- **Hybrid**: hourly + contingency

### Invoicing
- Generate from unbilled time + expenses
- Invoice templates with firm branding, line item editing, payment terms
- Send via email with pay link (Stripe)
- Payment tracking: `Paid | Partial | Overdue`
- Automated payment reminders

### Expense Tracking
- Types: Filing fee, Court costs, Expert fee, Medical records, etc.
- Billable to client flag, receipt attachment, reimbursement status

---

## IOLTA Trust Accounting

**BUILD THIS CAREFULLY — compliance is critical.**

### Trust Account Model
- Account type: `IOLTA | IndividualClientTrust | Operating`
- State (determines compliance rules)
- Bank name, account number (encrypted), opening/current balance

### Client Trust Ledger
- One ledger per client per matter
- Every transaction links to a ledger
- Running balance per ledger — **cannot go negative (hard block)**

### Transaction Types
- Deposit (retainer received, settlement received)
- Disbursement to client / to firm (earned fees — requires invoice) / to third party
- Transfer between client ledgers
- Bank fee (from operating only)
- Interest allocation

### Three-Way Reconciliation (Monthly Required)
1. Bank statement balance
2. Trust account ledger total
3. Sum of all client ledgers

All three must match. Flag discrepancies immediately.

### Compliance Features
- Overdraft prevention (block disbursement if insufficient client funds)
- Immutable audit trail of all transactions
- Reconciliation reports, client ledger statements
- State-specific rule validation (configurable by state)
- Compliance alerts (minimum balance, inactive funds, unidentified deposits)
- **All trust transactions require approval workflow. No bulk operations.**

---

## Document Management

### Document Model
- File stored in S3/R2, with original filename, MIME type, file size
- Document type: `Pleading | Correspondence | Evidence | Contract | MedicalRecord | etc.`
- Linked to matter and optionally to contact
- Version number with full version history

### Features
- Drag-drop and bulk upload with auto-categorization
- Virtual folder structure by matter
- Full-text search (extract text from PDFs, Word docs)
- Document preview (PDF, images, common formats)
- Secure sharing links (expiring, password-protected)
- Template library with merge fields from matter/contact data
- E-signature integration (DocuSign or built-in)

---

## Calendar & Deadlines

### Event Model
- Types: Court hearing, Client meeting, Deadline, Task due, Deposition, etc.
- Date/time (or all-day), end date/time, location, recurrence
- Linked to matter, attendees (users + contacts), configurable reminders

### Deadline Engine
- Statute of limitations by jurisdiction (database of rules)
- Auto-calculate deadlines from: incident date + SOL period, filing date + response period, service date + answer deadline
- Court rules by jurisdiction (federal, state, local)
- Escalating reminders as deadlines approach

### Calendar Views
- Day, week, month
- Firm-wide, matter-specific, personal ("My calendar")

### Integrations
- Google Calendar (two-way sync)
- Outlook/Microsoft 365 (two-way sync)
- Auto-add Zoom/Teams meeting links

---

## Client Portal

### Client Access
- Unique login per client (email-based)
- View matters (read-only status), shared documents, invoices, payment history
- Upload requested documents, make payments
- Secure messaging with attorney, appointment scheduling

### Attorney Controls
- Choose which documents/case info to share
- Send secure messages, request document uploads (with checklist)
- Send appointment availability

---

## Phase 2: Practice-Specific Modules

### Immigration Module

**USCIS Form Library**: All current forms (I-130, I-485, I-589, I-601, I-765, I-131, N-400, etc.) with field mapping to client/matter data, auto-population with review workflow, version tracking, PDF generation.

**Form Auto-Fill Workflow**:
1. Attorney initiates form preparation
2. System pre-fills all mapped fields from client data
3. Attorney reviews each field (required step)
4. Attorney approves or modifies
5. Generate final PDF
6. Audit log captures all AI suggestions vs final values

**Detainee Tracking (Industry First)**:
- Detainee profile: A-Number, booking number, current facility, legal status, bond amount/status, next hearing date
- Facility database (all ICE detention centers, county jails, federal prisons)
- Transfer alerts, bond tracking, visitation logging, communication logs, release monitoring

**Case Type Workflows**: Family-based, Employment-based, Asylum, DACA (renewal tracking, mass campaign tools), Removal defense, Naturalization (N-400 eligibility calculator)

**Visa Tracking**: Priority date monitoring (Visa Bulletin), status/work auth/travel doc expiration alerts

**Multilingual**: Client portal in Spanish, Portuguese, French, Haitian Creole, Mandarin. Intake forms in multiple languages. AI translation of client communications.

### Criminal Defense Module

**Case Stages**: Arrest/Booking → Initial Appearance → Arraignment → Discovery → Pretrial Motions → Plea Negotiations → Trial → Sentencing → Appeal → Post-Conviction

**Evidence Management**: Item tracking (physical, digital), chain of custody log, photos/videos, Bates numbering, privilege designations, work product protection

**Discovery Tracking**: Requests sent/received, Brady/Giglio material tracking, deadlines, motion to compel tracking

**Plea Tracking**: Offers received (date, terms, expiration), counteroffers, client consultation notes, final disposition

**Sentencing**: Guideline calculator (federal and state), prior conviction tracking, mitigation evidence collection

**Post-Disposition**: Probation/parole monitoring, expungement eligibility, record sealing workflow

### Personal Injury Module

**Medical Treatment Tracking**: Provider database, treatment entries (date, provider, type, diagnosis, cost), medical record request tracking with follow-ups, bill tracking, treatment timeline visualization

**Medical Lien Management**: Lien types (Hospital, Medicare, Medicaid, ERISA, Attorney), asserted/negotiated/final amounts, lien payment in settlement

**Settlement Calculator**: Gross settlement → attorney fees → case expenses → medical liens → other liens → net to client. Multiple scenario comparison.

**Demand Letter Automation**: Generate from case facts, include AI-assisted medical summary, damages calculation, liability analysis. Attorney review and approval required.

**Statute of Limitations**: By state and injury type, minor tolling rules, discovery rule, escalating alerts (90/60/30/7 days)

**Insurance Tracking**: At-fault party insurance, UM/UIM, Med-pay, health insurance (subrogation), adjuster contacts, negotiation log

**Expert Witnesses**: Expert database, retained experts per case, reports, invoices

### Discovery Management (All Practice Areas)

- Discovery dashboard with outstanding requests, response deadlines, status tracking
- Types: Interrogatories, Requests for Production, Requests for Admission, Subpoenas, Depositions
- Request/response tracking with per-request status: `Pending | Responded | Objected | Disputed`
- Objection library (prebuilt, customizable), privilege log generation, Bates numbering
- Meet and confer logging, motion to compel triggers
- Deposition management: scheduling, notice tracking, transcripts, exhibit tracking, key testimony tagging

---

## AI Features

**CRITICAL: All AI output requires attorney review before entering case record.**

### Architecture
- Anthropic Claude API (primary) or OpenAI (fallback)
- All AI requests include case context
- All AI outputs logged (input, output, reviewer, final value)
- "AI-generated" flag on any content that used AI assistance

### Feature List
1. **Smart Intake Population** — extract client info from uploaded documents, pre-fill intake forms, attorney reviews each field
2. **Form Auto-Fill (Immigration)** — map client data to USCIS form fields, generate draft, attorney reviews every field
3. **Demand Letter Drafting (PI)** — input case facts/medical records/injuries, output draft, attorney edits and approves
4. **Document Summarization** — summarize medical records, deposition transcripts, police reports; key facts extraction
5. **Motion Drafting** — motion to continue/suppress/in limine; attorney provides key facts, AI drafts, attorney finalizes
6. **Translation** — translate client communications and documents (Spanish, Portuguese, French, Haitian Creole, Mandarin)
7. **Deadline Risk Scoring** — analyze case timeline, flag high-risk situations, prioritize attorney attention
8. **Case Value Estimator (PI)** — input injury type/liability/treatment, output value range based on comparable verdicts (flagged as estimate only)

### AI Audit Trail
Every AI interaction must log: what was suggested, what was modified, who approved, when.

---

## Security Requirements

### Encryption
- All data encrypted at rest (AES-256) and in transit (TLS 1.3)
- Sensitive fields additionally encrypted (SSN, A-numbers, bank accounts)

### Authentication
- **Mandatory 2FA (TOTP) for all users** — never optional
- Session timeout (configurable, default 30 min)
- Brute force protection, password complexity requirements
- Password rotation policy (optional)

### Access Control
- Role-based permissions with matter-level access restrictions
- Audit log of all data access
- IP whitelisting (optional)

### Compliance Targets
- HIPAA compliant (BAA for medical records)
- Bar compliant (all 50 states for IOLTA)
- GDPR compliant (if serving EU)
- SOC 2 Type II (target for Year 2)

### Infrastructure
- Daily encrypted backups, point-in-time recovery (90 days)
- DDoS protection, WAF, intrusion detection
- Documented incident response plan, 24-hour breach notification

---

## Development Workflows

### Git Conventions

- **Default branch**: `main`
- **Branch naming**: Use descriptive branch names (e.g., `feature/case-management`, `fix/auth-redirect`)
- **Commit messages**: Use clear, imperative-mood messages (e.g., "Add case intake form", "Fix date parsing in contract module")
- Commit frequently with small, focused changes
- Code review required for all merges

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

### Code Quality

- TypeScript strict mode — no `any` types unless absolutely unavoidable
- ESLint + Prettier
- Pre-commit hooks
- Use meaningful, domain-specific naming (e.g., `matter`, `courtFiling`, `clientIntake`, `ioltaAccount`, `detaineeRecord`)

### CI/CD (Target)

- GitHub Actions or similar
- Automated testing on PR
- Staging environment
- Production deployment with approval

### Monitoring (Target)

- Error tracking (Sentry)
- Performance monitoring
- Uptime monitoring
- Usage analytics

---

## Feature Roadmap (Phased)

### Phase 1: Core MVP (Months 1–4)
- Authentication & user management (email/password, 2FA, RBAC, multi-tenancy)
- Case/matter management (CRUD, views: dashboard/list/kanban/timeline, conflict checks, templates)
- Contact/CRM management (clients, opposing parties, courts, agencies, intake workflow)
- Time tracking & billing (timers, expense tracking, invoice generation, Stripe)
- IOLTA trust accounting (three-way reconciliation, all 50 states)
- Document management (upload, templates, versioning, full-text search, e-signature)
- Calendar & deadlines (court rules engine, SOL alerts, Google/Outlook sync)
- Client portal (read-only access, secure messaging, document sharing, payments)

### Phase 2: Practice-Specific Modules (Months 5–8)
- Immigration module (USCIS forms, visa tracker, detainee tracking, multilingual)
- Criminal defense module (case stages, evidence/discovery management, plea/sentencing tracking)
- Personal injury module (medical records, demand packages, settlement calculator, lien tracking)
- Discovery management (all practice areas)
- AI features (with mandatory attorney review)

### Phase 3: Advanced Features (Months 9–12)
- Court e-filing integration (PACER, state courts — CA, TX, FL, NY first)
- Docket monitoring (subscribe to cases, auto-alerts on new filings)
- Advanced reporting (matter, financial, productivity, compliance, custom report builder)
- Mobile apps (iOS/Android — React Native or native, with offline time entry)

### Phase 4: Scale (Year 2)
- Public API (REST or GraphQL) + integration marketplace
- SOC 2 Type II certification
- White-label options (custom branding, custom domain, feature toggles)
- Advanced workflows (custom automation, conditional task triggers)

### MVP Quick Start (Solo/Small Team)

| Weeks | Focus |
|-------|-------|
| 1–2 | Foundation: Next.js + TypeScript, PostgreSQL + Prisma, auth, org/user models |
| 3–4 | Core matters: Matter CRUD, Contact CRUD, basic dashboard |
| 5–6 | Time & billing: Time entry, basic invoicing, Stripe integration |
| 7–8 | Documents & calendar: Upload/storage, basic calendar, Google Calendar sync |
| 9–10 | Trust accounting: Trust accounts, client ledgers, basic reconciliation |
| 11–12 | Polish & launch: Client portal, email notifications, bug fixes, deploy |

Post-MVP: Add practice-specific features based on user feedback, AI features one at a time, detainee tracking (key differentiator).

---

## Case/Matter Views

When building matter views, support these four layouts:
1. **Dashboard (cards)**: Active matters with status, next deadline, days open
2. **List view**: Sortable/filterable table
3. **Kanban**: Drag matters between status columns
4. **Timeline**: Chronological case events

Quick actions available from any view: Add note, Add task, Upload document, Log time.

---

## Testing

- Unit tests for all business logic
- Integration tests for API endpoints
- E2E tests for critical workflows (billing, trust accounting)
- **Trust accounting requires 100% test coverage**
- Test RBAC enforcement — verify that roles cannot exceed their permissions
- Test multi-tenancy isolation — ensure no cross-firm data leaks
- Test IOLTA accounting math — use decimal types, not floats
- Test conflict checking logic thoroughly
- Test statute of limitations alerting
- Update this section with the test runner command once established

---

## Common Pitfalls

- **Do not hardcode jurisdiction-specific rules** — use configuration or data-driven approaches
- **Be careful with date/time calculations** (deadlines, statutes of limitations) — always timezone-aware (UTC storage, local display)
- **Ensure sensitive client data is never logged or exposed** in error messages or stack traces
- **Do not skip validation on legal document fields** — incomplete filings have real consequences
- **Never use floating-point for money** — use Prisma `Decimal` / integer cents for all financial amounts
- **Never bypass 2FA** — it is mandatory for all users, not optional
- **Never auto-apply AI output** — always require attorney review
- **Never allow cross-tenant data access** — scope every query to the firm's tenant ID
- **Conflict checks are not optional** — run them on every new matter and new contact
- **Trust ledger balances cannot go negative** — hard block, not a warning
- **All trust transactions require approval workflow** — no bulk operations
- **Sensitive fields (SSN, A-numbers, bank accounts) must be additionally encrypted** beyond at-rest encryption

---

## Environment & Deployment

- **Frontend**: Vercel (recommended) for Next.js
- **Backend/DB**: Railway, Render, or AWS for PostgreSQL and backend services
- **File Storage**: AWS S3 or Cloudflare R2
- **CI/CD**: Update this section once pipeline is configured
- **Environments**: development, staging, production

---

## External Resources

- USCIS Forms: https://www.uscis.gov/forms
- ICE Detainee Locator: https://locator.ice.gov/odls/
- Visa Bulletin: https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html
- PACER: https://pacer.uscourts.gov/
- State Bar IOLTA Rules: varies by state

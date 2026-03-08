# LegalFlow — External Integrations & Resources Disclosure

> **Last Updated:** March 8, 2026
> **Version:** 1.0.0

This document provides a comprehensive disclosure of all external services, APIs, and integrations that LegalFlow connects to or is designed to connect to. This serves as the authoritative reference for all third-party resource connections.

---

## Table of Contents

1. [Immigration-Specific Services](#1-immigration-specific-services)
2. [Calendar & Scheduling](#2-calendar--scheduling)
3. [Payment Processing](#3-payment-processing)
4. [Document Storage](#4-document-storage)
5. [Email Services](#5-email-services)
6. [Accounting](#6-accounting)
7. [Infrastructure](#7-infrastructure)
8. [Data Flow Summary](#8-data-flow-summary)
9. [Privacy & Compliance Considerations](#9-privacy--compliance-considerations)
10. [Configuration Reference](#10-configuration-reference)

---

## 1. Immigration-Specific Services

### 1.1 USCIS Case Status Checker

| Field | Details |
|-------|---------|
| **Service** | USCIS Case Status Online |
| **URL** | https://egov.uscis.gov/casestatus/landing.do |
| **Purpose** | Check filing status by USCIS receipt number for all active immigration cases |
| **Data Sent** | USCIS receipt numbers (e.g., IOE/MSC/LIN/SRC + 10 digits) |
| **Data Received** | Case status text, last updated date |
| **PII Transmitted** | Receipt numbers only — no names, addresses, or other PII |
| **Authentication** | None (public endpoint) |
| **Rate Limits** | Subject to USCIS website terms of use |
| **Privacy Note** | Receipt numbers are sent to a U.S. government public website. No attorney-client privileged information is transmitted. |

### 1.2 ICE Online Detainee Locator System (ODLS)

| Field | Details |
|-------|---------|
| **Service** | ICE ODLS |
| **URL** | https://locator.ice.gov/odls/ |
| **Purpose** | Locate individuals in ICE custody to track detained clients |
| **Data Sent** | Alien Registration Number (A-Number), country of birth |
| **Data Received** | Facility name and location, custody status |
| **PII Transmitted** | A-Number and country of birth (minimum required by ICE) |
| **Authentication** | None (public search) |
| **Privacy Note** | A-Numbers are sensitive immigration identifiers. Only transmitted to ICE's official locator system. Results are not cached beyond the active session. |

### 1.3 Department of State Visa Bulletin

| Field | Details |
|-------|---------|
| **Service** | U.S. Department of State Visa Bulletin |
| **URL** | https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html |
| **Purpose** | Monitor monthly priority date cutoffs for all preference categories |
| **Data Sent** | None |
| **Data Received** | Visa bulletin tables (preference category dates by country) |
| **PII Transmitted** | None — read-only access to publicly available data |
| **Privacy Note** | No client data is transmitted. Bulletin data is public information published by the Department of State. |

### 1.4 USCIS Processing Times

| Field | Details |
|-------|---------|
| **Service** | USCIS Processing Times |
| **URL** | https://egov.uscis.gov/processing-times/ |
| **Purpose** | Check current processing times for immigration forms at USCIS service centers |
| **Data Sent** | Form type identifier, service center identifier |
| **Data Received** | Processing time ranges |
| **PII Transmitted** | None |
| **Privacy Note** | Only form type codes and service center names are used. No client data transmitted. |

### 1.5 EOIR Immigration Court System

| Field | Details |
|-------|---------|
| **Service** | Executive Office for Immigration Review (EOIR) |
| **URL** | https://www.justice.gov/eoir |
| **Purpose** | Court date lookup, hearing schedules, and case information for removal proceedings |
| **Data Sent** | A-Number (for automated case lookup) |
| **Data Received** | Hearing dates, court location, judge assignment |
| **PII Transmitted** | A-Number |
| **Authentication** | EOIR automated telephone system / portal credentials |
| **Privacy Note** | A-Numbers sent to DOJ system. Subject to DOJ privacy policies and EOIR terms of use. |

---

## 2. Calendar & Scheduling

### 2.1 Google Calendar API

| Field | Details |
|-------|---------|
| **Service** | Google Calendar via Google Workspace APIs |
| **Purpose** | Bidirectional sync of court dates, hearings, deadlines, and meetings |
| **Data Sent** | Event titles, dates/times, locations, descriptions |
| **Data Received** | Events created/modified in Google Calendar |
| **PII Transmitted** | Event titles may contain matter numbers. Configurable to exclude client names. |
| **Authentication** | OAuth 2.0 (Google Cloud Console credentials) |
| **Required Config** | `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_CALENDAR_ID` |
| **Privacy Note** | Event data stored on Google servers. Recommend using a dedicated calendar (not personal) for firm events. Google Workspace is SOC 2 and ISO 27001 certified. |

### 2.2 Microsoft Outlook Calendar (Microsoft Graph)

| Field | Details |
|-------|---------|
| **Service** | Microsoft Graph API — Calendar |
| **Purpose** | Bidirectional sync with Microsoft 365 / Outlook calendars |
| **Data Sent** | Event titles, dates/times, locations, descriptions |
| **Data Received** | Events created/modified in Outlook |
| **PII Transmitted** | Same as Google Calendar — configurable |
| **Authentication** | OAuth 2.0 (Microsoft Entra ID app registration) |
| **Required Config** | `MICROSOFT_APP_ID`, `MICROSOFT_APP_SECRET`, `MICROSOFT_TENANT_ID` |
| **Privacy Note** | Data stored in Microsoft 365 tenant. Microsoft is SOC 2 Type II and ISO 27001 certified. |

---

## 3. Payment Processing

### 3.1 Stripe

| Field | Details |
|-------|---------|
| **Service** | Stripe Payments |
| **Purpose** | Process credit card and ACH payments for client invoices and trust deposits |
| **Data Sent** | Invoice amount, client email (for receipts), metadata (invoice number) |
| **Data Received** | Payment confirmation, transaction ID, receipt URL |
| **PII Transmitted** | Client email address. Payment card data handled entirely by Stripe (never touches LegalFlow servers). |
| **Authentication** | API keys (publishable + secret) |
| **Required Config** | `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| **Compliance** | PCI DSS Level 1 certified. LegalFlow uses Stripe Elements/Checkout so card data never touches our servers. |
| **Privacy Note** | Stripe processes and stores payment data under their privacy policy. No legal case details are sent to Stripe. |

### 3.2 LawPay

| Field | Details |
|-------|---------|
| **Service** | LawPay (by AffiniPay) |
| **Purpose** | Legal-specific payment processing with built-in IOLTA compliance |
| **Data Sent** | Payment amount, trust/operating account designation, client identifier |
| **Data Received** | Payment confirmation, compliance receipts |
| **PII Transmitted** | Client name/email for receipts |
| **Authentication** | API key |
| **Required Config** | `LAWPAY_API_KEY`, `LAWPAY_ACCOUNT_ID` |
| **Compliance** | PCI DSS Level 1, ABA recommended. Designed specifically for attorney trust account compliance. |
| **Privacy Note** | LawPay is purpose-built for law firms and understands attorney-client privilege requirements. |

---

## 4. Document Storage

### 4.1 Local File Storage (Default)

| Field | Details |
|-------|---------|
| **Service** | Local server filesystem |
| **Purpose** | Store uploaded documents (pleadings, evidence, identification, correspondence, etc.) |
| **Data Stored** | All document files (PDFs, images, Word docs, etc.) |
| **Location** | Server filesystem at configured path |
| **PII Stored** | Documents may contain highly sensitive PII and privileged information |
| **Required Config** | `UPLOAD_DIR` (defaults to `./uploads`) |
| **Privacy Note** | All data remains on your infrastructure. No external transmission. Recommend enabling filesystem encryption at rest. |

### 4.2 Amazon S3

| Field | Details |
|-------|---------|
| **Service** | Amazon Simple Storage Service (S3) |
| **Purpose** | Cloud document storage with versioning, lifecycle policies, and high durability |
| **Data Stored** | All document files, encrypted at rest with AES-256 (SSE-S3 or SSE-KMS) |
| **PII Stored** | Documents may contain highly sensitive PII |
| **Authentication** | AWS IAM credentials |
| **Required Config** | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `AWS_REGION` |
| **Privacy Note** | Choose region carefully for data residency compliance. Enable server-side encryption, bucket policies, and access logging. AWS is SOC 1/2/3, ISO 27001, HIPAA eligible. |

### 4.3 Cloudflare R2 (Alternative)

| Field | Details |
|-------|---------|
| **Service** | Cloudflare R2 Object Storage |
| **Purpose** | S3-compatible cloud storage with zero egress fees |
| **Data Stored** | Same as S3 |
| **Required Config** | `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_ENDPOINT` |
| **Privacy Note** | Cloudflare is SOC 2 Type II certified. Data encrypted at rest. |

---

## 5. Email Services

### 5.1 Resend

| Field | Details |
|-------|---------|
| **Service** | Resend (transactional email) |
| **Purpose** | Send invoice notifications, deadline reminders, portal invitations, and system alerts |
| **Data Sent** | Recipient email address, email subject line, email body (HTML) |
| **PII Transmitted** | Client email addresses, client names in greeting. No legal document content in automated emails. |
| **Authentication** | API key |
| **Required Config** | `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS` |
| **Privacy Note** | Email content is transactional only (notifications, reminders). No privileged legal content is included in automated emails. Resend processes emails under their privacy policy. |

### 5.2 SendGrid (Alternative)

| Field | Details |
|-------|---------|
| **Service** | Twilio SendGrid |
| **Purpose** | Alternative email delivery service |
| **Data Sent** | Same as Resend |
| **Required Config** | `SENDGRID_API_KEY`, `EMAIL_FROM_ADDRESS` |
| **Compliance** | SOC 2 Type II certified (Twilio) |
| **Privacy Note** | Same considerations as Resend. |

---

## 6. Accounting

### 6.1 QuickBooks Online

| Field | Details |
|-------|---------|
| **Service** | Intuit QuickBooks Online |
| **Purpose** | Sync invoices, payments, and trust transactions for bookkeeping and tax reporting |
| **Data Sent** | Invoice line items, payment amounts, client names (on invoices), chart of accounts mapping |
| **Data Received** | Account balances, synced transaction IDs |
| **PII Transmitted** | Client names as they appear on invoices. No case details or legal information. |
| **Authentication** | OAuth 2.0 (Intuit Developer credentials) |
| **Required Config** | `QUICKBOOKS_CLIENT_ID`, `QUICKBOOKS_CLIENT_SECRET` |
| **Privacy Note** | Only financial transaction data is synced. Matter descriptions, case details, and privileged information are never sent to QuickBooks. Client names appear only as invoice payees. |

---

## 7. Infrastructure

### 7.1 PostgreSQL Database

| Field | Details |
|-------|---------|
| **Service** | PostgreSQL (via Prisma ORM) |
| **Purpose** | Primary data store for all application data |
| **Data Stored** | Users, organizations, contacts, matters, documents metadata, time entries, billing, trust accounting, immigration records, audit logs |
| **PII Stored** | Extensive — client names, A-Numbers, passport numbers (recommended encrypted), addresses, financial records |
| **Required Config** | `DATABASE_URL` |
| **Privacy Note** | Database should be configured with SSL/TLS, strong authentication, network access controls, and regular backups. Sensitive fields (passport numbers, SSN if stored) should use application-level encryption. |

### 7.2 NextAuth.js Authentication

| Field | Details |
|-------|---------|
| **Service** | NextAuth.js (self-hosted, no external service) |
| **Purpose** | User authentication, session management, JWT token generation |
| **Data Processed** | Email, password (hashed with bcrypt, 12 rounds), JWT session tokens |
| **External Calls** | None — fully self-hosted |
| **Required Config** | `NEXTAUTH_SECRET`, `NEXTAUTH_URL` |
| **Privacy Note** | Passwords are never stored in plaintext. bcrypt with 12 salt rounds. JWTs are signed with NEXTAUTH_SECRET. No authentication data is sent to external services. |

---

## 8. Data Flow Summary

```
┌──────────────────────────────────────────────────────────┐
│                      LegalFlow App                        │
│                                                          │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Contacts │  │ Matters  │  │ Billing  │  │  Trust   │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │              │              │              │       │
└───────┼──────────────┼──────────────┼──────────────┼───────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
   ┌─────────┐   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │PostgreSQL│   │  File    │  │ Stripe / │  │QuickBooks│
   │ Database │   │ Storage  │  │ LawPay   │  │  Online  │
   └─────────┘   └──────────┘  └──────────┘  └──────────┘

External Government Services (read-only / lookup):
  → USCIS Case Status (receipt # → status)
  → ICE Detainee Locator (A# → facility)
  → Visa Bulletin (public data)
  → USCIS Processing Times (public data)
  → EOIR Court System (A# → hearing dates)

Notification Services:
  → Resend / SendGrid (email delivery)

Calendar Sync (bidirectional):
  → Google Calendar / Microsoft Outlook
```

---

## 9. Privacy & Compliance Considerations

### Attorney-Client Privilege
- **No privileged content** is transmitted to third-party services in automated processes
- Document content is stored only in your controlled storage (local filesystem or your S3 bucket)
- Email notifications contain only transactional information, never case details
- Calendar events can be configured to exclude client names

### Data Minimization
- Each integration transmits only the minimum data required for its function
- USCIS lookups: receipt numbers only
- ICE lookups: A-Number and country of birth only
- Payment processors: amounts and client email only
- Accounting sync: financial data only, no case details

### Sensitive Data Handling
| Data Type | Storage | Encryption | Notes |
|-----------|---------|------------|-------|
| Passwords | PostgreSQL | bcrypt (12 rounds) | Never stored plaintext |
| A-Numbers | PostgreSQL | Application-level recommended | Indexed for search |
| Passport Numbers | PostgreSQL | Application-level encryption recommended | Stored encrypted |
| Trust Account Numbers | PostgreSQL | Application-level encryption | Bank account numbers |
| Documents | File Storage | At-rest encryption recommended | Contains PII |
| Payment Card Data | Stripe/LawPay only | PCI DSS Level 1 | Never touches LegalFlow |

### Compliance Standards
- **IOLTA**: Trust accounting module designed for state bar IOLTA compliance
- **PCI DSS**: Payment card data handled by PCI-compliant processors only
- **Data Retention**: Audit logs are immutable and retained per configured policy
- **Access Control**: Role-based access with organization-scoped data isolation

---

## 10. Configuration Reference

All configuration is done via environment variables. See `.env.example` for the template.

### Required (Core)
```
DATABASE_URL=postgresql://user:password@host:5432/legalflow
NEXTAUTH_SECRET=<random-32-character-string>
NEXTAUTH_URL=http://localhost:3000
```

### Optional (Integrations)
```
# Google Calendar
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_CALENDAR_ID=

# Microsoft Calendar
MICROSOFT_APP_ID=
MICROSOFT_APP_SECRET=
MICROSOFT_TENANT_ID=

# Stripe
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# LawPay
LAWPAY_API_KEY=
LAWPAY_ACCOUNT_ID=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=

# Cloudflare R2
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_ENDPOINT=

# Email (choose one)
RESEND_API_KEY=
SENDGRID_API_KEY=
EMAIL_FROM_ADDRESS=

# QuickBooks
QUICKBOOKS_CLIENT_ID=
QUICKBOOKS_CLIENT_SECRET=

# File Storage
UPLOAD_DIR=./uploads
```

---

*This document is auto-referenced from the in-app Connections & Integrations page at Settings > Connections.*

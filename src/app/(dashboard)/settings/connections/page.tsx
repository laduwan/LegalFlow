"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Shield,
  Calendar,
  CreditCard,
  HardDrive,
  Mail,
  Scale,
  BookOpen,
  Link2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Settings,
  RefreshCw,
  Database,
  Lock,
  FileText,
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "connected" | "configured" | "not_configured" | "error";
  icon: any;
  externalUrl?: string;
  docsUrl?: string;
  dataExchanged: string;
  privacyNote: string;
  lastChecked?: string;
  configFields?: string[];
}

const integrations: Integration[] = [
  // Immigration-Specific
  {
    id: "uscis-case-status",
    name: "USCIS Case Status",
    description: "Check case status by receipt number through the USCIS website. Allows bulk status checks for all active cases.",
    category: "Immigration Services",
    status: "configured",
    icon: Globe,
    externalUrl: "https://egov.uscis.gov/casestatus/landing.do",
    dataExchanged: "USCIS receipt numbers (outbound), case status updates (inbound)",
    privacyNote: "Receipt numbers are sent to USCIS public status check. No PII beyond receipt numbers is transmitted.",
    lastChecked: "2026-03-08T10:30:00Z",
  },
  {
    id: "ice-detainee-locator",
    name: "ICE Online Detainee Locator System",
    description: "Locate detained individuals in ICE custody using A-Number and country of birth.",
    category: "Immigration Services",
    status: "configured",
    icon: Shield,
    externalUrl: "https://locator.ice.gov/odls/#/index",
    dataExchanged: "A-Number, country of birth (outbound), facility location and custody status (inbound)",
    privacyNote: "A-Numbers and country of birth are sent to ICE public locator. Subject to ICE privacy policies.",
  },
  {
    id: "visa-bulletin",
    name: "Department of State Visa Bulletin",
    description: "Monitor monthly Visa Bulletin for priority date movements across all preference categories.",
    category: "Immigration Services",
    status: "configured",
    icon: BookOpen,
    externalUrl: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html",
    dataExchanged: "No data sent. Visa bulletin data retrieved (public information).",
    privacyNote: "Read-only access to publicly available visa bulletin data. No client data transmitted.",
    lastChecked: "2026-03-01T00:00:00Z",
  },
  {
    id: "uscis-processing-times",
    name: "USCIS Processing Times",
    description: "Check current processing times for forms at various USCIS service centers.",
    category: "Immigration Services",
    status: "configured",
    icon: RefreshCw,
    externalUrl: "https://egov.uscis.gov/processing-times/",
    dataExchanged: "Form type and service center (outbound), processing time estimates (inbound)",
    privacyNote: "Only form types and service center identifiers are used. No client PII transmitted.",
  },
  {
    id: "eoir-court",
    name: "EOIR Immigration Court",
    description: "Access immigration court information, hearing schedules, and case lookup.",
    category: "Immigration Services",
    status: "not_configured",
    icon: Scale,
    externalUrl: "https://www.justice.gov/eoir",
    dataExchanged: "A-Number (outbound), court date and case status (inbound)",
    privacyNote: "A-Numbers sent to EOIR automated system. Subject to DOJ privacy policies.",
    configFields: ["EOIR Telephone Number", "Court Location"],
  },
  // Calendar
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Sync court dates, hearings, deadlines, and client meetings with Google Calendar.",
    category: "Calendar & Scheduling",
    status: "not_configured",
    icon: Calendar,
    dataExchanged: "Event titles, dates, times, locations (bidirectional sync)",
    privacyNote: "Event data synced to Google servers. Matter numbers included but no client PII in event titles by default. Configurable.",
    configFields: ["Google OAuth Client ID", "Google OAuth Client Secret", "Calendar ID"],
  },
  {
    id: "outlook-calendar",
    name: "Microsoft Outlook Calendar",
    description: "Sync events with Microsoft 365 / Outlook calendar via Microsoft Graph API.",
    category: "Calendar & Scheduling",
    status: "not_configured",
    icon: Calendar,
    dataExchanged: "Event titles, dates, times, locations (bidirectional sync)",
    privacyNote: "Event data synced via Microsoft Graph API. Same PII controls as Google Calendar.",
    configFields: ["Microsoft App ID", "Microsoft App Secret", "Tenant ID"],
  },
  // Payments
  {
    id: "stripe",
    name: "Stripe",
    description: "Process client payments for invoices and trust deposits via credit card and ACH.",
    category: "Payments",
    status: "not_configured",
    icon: CreditCard,
    dataExchanged: "Invoice amounts, client email for receipts (outbound), payment confirmations (inbound)",
    privacyNote: "Payment card data handled entirely by Stripe (PCI DSS compliant). LegalFlow never stores card numbers. Client email sent for receipts.",
    configFields: ["Stripe Publishable Key", "Stripe Secret Key", "Webhook Secret"],
  },
  {
    id: "lawpay",
    name: "LawPay",
    description: "Legal-specific payment processing with built-in IOLTA compliance. Separates earned and unearned fees.",
    category: "Payments",
    status: "not_configured",
    icon: CreditCard,
    dataExchanged: "Invoice amounts, trust/operating account designation (outbound), payment confirmations (inbound)",
    privacyNote: "LawPay is ABA-recommended and designed for attorney trust compliance. PCI DSS Level 1 compliant.",
    configFields: ["LawPay API Key", "LawPay Account ID"],
  },
  // Storage
  {
    id: "local-storage",
    name: "Local File Storage",
    description: "Store documents on the local server filesystem. Default storage option.",
    category: "Document Storage",
    status: "connected",
    icon: HardDrive,
    dataExchanged: "Document files stored on local server disk",
    privacyNote: "All documents remain on your server. No data transmitted to external services. Encryption at rest recommended.",
    lastChecked: "2026-03-08T12:00:00Z",
  },
  {
    id: "aws-s3",
    name: "Amazon S3",
    description: "Store documents in AWS S3 with server-side encryption, versioning, and lifecycle policies.",
    category: "Document Storage",
    status: "not_configured",
    icon: HardDrive,
    dataExchanged: "Document files (outbound/inbound), encrypted at rest with AES-256",
    privacyNote: "Documents stored in your AWS account. Enable server-side encryption. Consider region selection for data residency compliance.",
    configFields: ["AWS Access Key ID", "AWS Secret Access Key", "S3 Bucket Name", "AWS Region"],
  },
  // Email
  {
    id: "resend",
    name: "Resend",
    description: "Send transactional emails: invoice notifications, deadline reminders, portal invitations.",
    category: "Email Service",
    status: "not_configured",
    icon: Mail,
    dataExchanged: "Recipient email, email subject and body (outbound)",
    privacyNote: "Client email addresses and notification content sent to Resend for delivery. No legal document content included in automated emails.",
    configFields: ["Resend API Key", "From Email Address"],
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    description: "Alternative email delivery service for notifications and client communications.",
    category: "Email Service",
    status: "not_configured",
    icon: Mail,
    dataExchanged: "Recipient email, email subject and body (outbound)",
    privacyNote: "Same privacy considerations as Resend. Twilio/SendGrid is SOC 2 Type II compliant.",
    configFields: ["SendGrid API Key", "From Email Address"],
  },
  // Accounting
  {
    id: "quickbooks",
    name: "QuickBooks Online",
    description: "Sync invoices, payments, and trust transactions with QuickBooks for accounting.",
    category: "Accounting",
    status: "not_configured",
    icon: BookOpen,
    dataExchanged: "Invoice data, payment records, chart of accounts mapping (bidirectional)",
    privacyNote: "Financial data synced to Intuit servers. Client names may appear on invoices. No case details transmitted.",
    configFields: ["QuickBooks OAuth Client ID", "QuickBooks OAuth Client Secret"],
  },
  // Database
  {
    id: "postgresql",
    name: "PostgreSQL Database",
    description: "Primary data store for all application data. Managed via Prisma ORM.",
    category: "Infrastructure",
    status: "connected",
    icon: Database,
    dataExchanged: "All application data (clients, matters, documents metadata, billing, trust records)",
    privacyNote: "All sensitive data stored in your PostgreSQL instance. Enable SSL, use strong passwords, and configure network access controls.",
    lastChecked: "2026-03-08T12:00:00Z",
  },
  // Auth
  {
    id: "nextauth",
    name: "NextAuth.js Authentication",
    description: "Handles user authentication, session management, and JWT tokens.",
    category: "Infrastructure",
    status: "connected",
    icon: Lock,
    dataExchanged: "User credentials (hashed with bcrypt), JWT session tokens",
    privacyNote: "Passwords are hashed with bcrypt (12 rounds) and never stored in plaintext. Sessions use signed JWTs. No auth data sent to external services.",
    lastChecked: "2026-03-08T12:00:00Z",
  },
];

const statusConfig = {
  connected: { label: "Connected", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  configured: { label: "Configured", color: "bg-blue-100 text-blue-800", icon: CheckCircle2 },
  not_configured: { label: "Not Configured", color: "bg-gray-100 text-gray-600", icon: XCircle },
  error: { label: "Error", color: "bg-red-100 text-red-800", icon: AlertCircle },
};

const categories = [...new Set(integrations.map((i) => i.category))];

export default function ConnectionsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filtered = filterCategory === "all"
    ? integrations
    : integrations.filter((i) => i.category === filterCategory);

  const connectedCount = integrations.filter((i) => i.status === "connected" || i.status === "configured").length;
  const totalCount = integrations.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Connections & Integrations</h1>
        <p className="text-slate-500 mt-1">
          All external services, APIs, and integrations used by LegalFlow.{" "}
          <span className="font-medium">{connectedCount} of {totalCount}</span> services active.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{connectedCount}</p>
            <p className="text-xs text-slate-500">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">{totalCount - connectedCount}</p>
            <p className="text-xs text-slate-500">Not Configured</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{categories.length}</p>
            <p className="text-xs text-slate-500">Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-600">{totalCount}</p>
            <p className="text-xs text-slate-500">Total Services</p>
          </CardContent>
        </Card>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filterCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterCategory("all")}
        >
          All ({totalCount})
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={filterCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCategory(cat)}
          >
            {cat} ({integrations.filter((i) => i.category === cat).length})
          </Button>
        ))}
      </div>

      {/* Integration list */}
      <div className="space-y-3">
        {filtered.map((integration) => {
          const status = statusConfig[integration.status];
          const StatusIcon = status.icon;
          const isExpanded = expandedId === integration.id;

          return (
            <Card key={integration.id} className={isExpanded ? "ring-2 ring-blue-200" : ""}>
              <CardContent className="p-0">
                <button
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : integration.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <integration.icon className="h-5 w-5 text-slate-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{integration.name}</h3>
                      <p className="text-sm text-slate-500">{integration.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {status.label}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t px-4 py-4 bg-slate-50 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-1">Data Exchanged</h4>
                        <p className="text-sm text-slate-600">{integration.dataExchanged}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-1">Privacy & Compliance</h4>
                        <p className="text-sm text-slate-600">{integration.privacyNote}</p>
                      </div>
                    </div>

                    {integration.lastChecked && (
                      <p className="text-xs text-slate-400">
                        Last checked: {new Date(integration.lastChecked).toLocaleString()}
                      </p>
                    )}

                    {integration.configFields && integration.status === "not_configured" && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Configuration Required</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {integration.configFields.map((field) => (
                            <div key={field}>
                              <label className="text-xs text-slate-500">{field}</label>
                              <input
                                type="text"
                                placeholder={`Enter ${field}`}
                                className="w-full mt-1 px-3 py-1.5 text-sm border border-slate-200 rounded-md"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {integration.externalUrl && (
                        <a
                          href={integration.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Open Service
                        </a>
                      )}
                      {integration.status === "not_configured" ? (
                        <Button size="sm">Configure</Button>
                      ) : (
                        <Button size="sm" variant="outline">
                          <Settings className="h-3.5 w-3.5 mr-1" />
                          Manage
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Documentation reference */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 flex items-start gap-3">
          <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900">Full Integration Documentation</h4>
            <p className="text-sm text-blue-700 mt-1">
              For complete technical details about all integrations, data flows, and privacy
              considerations, see the{" "}
              <code className="bg-blue-100 px-1 py-0.5 rounded text-xs">docs/INTEGRATIONS.md</code>{" "}
              file in the project repository. This document serves as the authoritative disclosure
              of all external resources and connections.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Briefcase,
  FileText,
  Upload,
  DollarSign,
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Download,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Demo data for a sample immigration client
// ---------------------------------------------------------------------------

const clientName = "Maria Rodriguez";

const myCases = [
  {
    id: "1",
    matterName: "Adjustment of Status (I-485)",
    caseType: "Family-Based Immigration",
    status: "ACTIVE",
    statusColor: "bg-green-100 text-green-800",
    lastUpdate: "2026-03-07T14:30:00Z",
    lastUpdateText: "Receipt notice received for I-485 filing",
    receiptNumber: "IOE-0912345678",
    attorney: "Sarah Chen",
  },
  {
    id: "2",
    matterName: "Employment Authorization (I-765)",
    caseType: "Work Permit",
    status: "PENDING",
    statusColor: "bg-yellow-100 text-yellow-800",
    lastUpdate: "2026-03-05T10:00:00Z",
    lastUpdateText: "Application filed with USCIS - awaiting receipt",
    receiptNumber: null,
    attorney: "Sarah Chen",
  },
];

const documentRequests = [
  {
    id: "1",
    name: "Tax Returns (2023, 2024, 2025)",
    status: "uploaded" as const,
    requestedAt: "2026-03-06T10:00:00Z",
    description: "Federal tax returns for the last 3 years",
  },
  {
    id: "2",
    name: "Employment Verification Letter",
    status: "uploaded" as const,
    requestedAt: "2026-03-06T10:00:00Z",
    description:
      "Letter from current employer confirming position and salary",
  },
  {
    id: "3",
    name: "Passport-Style Photos (2x2)",
    status: "pending" as const,
    requestedAt: "2026-03-07T11:00:00Z",
    description: "Two identical 2x2 inch photos with white background",
  },
  {
    id: "4",
    name: "Birth Certificate (Certified Translation)",
    status: "pending" as const,
    requestedAt: "2026-03-08T09:00:00Z",
    description:
      "Certified English translation of your birth certificate",
  },
];

const sharedDocuments = [
  {
    id: "1",
    name: "I-797C Receipt Notice - I-485",
    sharedAt: "2026-03-07T14:30:00Z",
    type: "Receipt Notice",
  },
  {
    id: "2",
    name: "Retainer Agreement - Signed",
    sharedAt: "2026-02-15T10:00:00Z",
    type: "Contract",
  },
  {
    id: "3",
    name: "Case Strategy Summary",
    sharedAt: "2026-02-20T16:00:00Z",
    type: "Correspondence",
  },
];

const outstandingInvoices = [
  {
    id: "1",
    invoiceNumber: "INV-2026-0042",
    description: "I-485 Application Filing Fee",
    amount: 1225.0,
    dueDate: "2026-03-15",
    status: "due" as const,
  },
  {
    id: "2",
    invoiceNumber: "INV-2026-0038",
    description: "Legal Services - February 2026",
    amount: 3500.0,
    dueDate: "2026-03-20",
    status: "due" as const,
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ClientPortalHomePage() {
  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  function handleSendMessage() {
    if (!messageText.trim()) return;
    setMessageSent(true);
    setMessageText("");
    setTimeout(() => setMessageSent(false), 3000);
  }

  return (
    <div className="space-y-8">
      {/* Welcome message */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {clientName}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here is an overview of your immigration cases and pending items.
        </p>
      </div>

      {/* Case status cards */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-blue-600" />
          My Cases
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myCases.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {c.matterName}
                    </h3>
                    <p className="text-xs text-slate-500">{c.caseType}</p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      c.statusColor
                    )}
                  >
                    {c.status}
                  </span>
                </div>
                {c.receiptNumber && (
                  <div className="text-xs text-slate-500 mb-2">
                    Receipt #:{" "}
                    <span className="font-mono font-medium text-slate-700">
                      {c.receiptNumber}
                    </span>
                  </div>
                )}
                <div className="bg-blue-50 rounded-lg p-3 mt-2">
                  <p className="text-xs font-medium text-blue-800">
                    Latest Update
                  </p>
                  <p className="text-sm text-blue-700 mt-0.5">
                    {c.lastUpdateText}
                  </p>
                  <p className="text-[11px] text-blue-500 mt-1">
                    {formatRelativeTime(c.lastUpdate)} &middot; Attorney:{" "}
                    {c.attorney}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Document requests */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <FileText className="h-5 w-5 text-amber-600" />
          Document Requests
        </h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {documentRequests.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-800">
                        {doc.name}
                      </p>
                      {doc.status === "uploaded" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700">
                          <CheckCircle className="h-3 w-3" />
                          Uploaded
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {doc.description}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Requested {formatDate(doc.requestedAt)}
                    </p>
                  </div>
                  {doc.status === "pending" && (
                    <Button size="sm" className="ml-4 flex-shrink-0">
                      <Upload className="mr-1 h-3.5 w-3.5" />
                      Upload
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Two-column: Shared documents + Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shared documents */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Documents Shared by Firm
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {sharedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800">
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-400">
                          {doc.type}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          &middot; Shared {formatDate(doc.sharedAt)}
                        </span>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                      <Download className="h-4 w-4 text-blue-600" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Outstanding invoices */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Outstanding Invoices
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {outstandingInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-800">
                          {inv.description}
                        </p>
                        <Badge variant="outline" className="text-[10px]">
                          {inv.invoiceNumber}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Due {formatDate(inv.dueDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      <span className="text-sm font-semibold text-slate-800">
                        ${inv.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Pay
                      </Button>
                    </div>
                  </div>
                ))}
                {outstandingInvoices.length === 0 && (
                  <div className="p-6 text-center">
                    <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">
                      No outstanding invoices
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Secure message box */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-indigo-600" />
          Send a Secure Message
        </h2>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-600 mb-3">
              Send a secure message to your attorney. You will receive a reply
              through this portal.
            </p>
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message here..."
              className="mb-3"
              rows={4}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Messages are encrypted and visible only to your legal team.
              </p>
              <Button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
              >
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </div>
            {messageSent && (
              <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg p-3">
                <CheckCircle className="h-4 w-4" />
                Message sent successfully. Your attorney will respond shortly.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

"use client";

import { useState, useMemo, Fragment } from "react";
import { cn, formatDate, formatCurrency } from "@/lib/utils";
import { USCIS_FORMS, FORM_STATUSES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ImmigrationFormEntry {
  id: string;
  formType: string;
  matterTitle: string;
  clientName: string;
  status: string;
  receiptNumber: string | null;
  filedDate: string | null;
  receivedDate: string | null;
  approvedDate: string | null;
  deniedDate: string | null;
  rfeDate: string | null;
  rfeResponseDeadline: string | null;
  notes: string | null;
  lastUpdated: string;
  timeline: { date: string; event: string }[];
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_FORMS: ImmigrationFormEntry[] = [
  {
    id: "frm-001",
    formType: "I-130",
    matterTitle: "Garcia Family Petition",
    clientName: "Maria Garcia",
    status: "FILED",
    receiptNumber: "WAC-24-123-45678",
    filedDate: "2025-11-15",
    receivedDate: null,
    approvedDate: null,
    deniedDate: null,
    rfeDate: null,
    rfeResponseDeadline: null,
    notes: "Petition for spouse adjustment",
    lastUpdated: "2025-12-01",
    timeline: [
      { date: "2025-10-01", event: "Form preparation started" },
      { date: "2025-10-28", event: "Ready for attorney review" },
      { date: "2025-11-05", event: "Approved by attorney" },
      { date: "2025-11-15", event: "Filed with USCIS" },
    ],
  },
  {
    id: "frm-002",
    formType: "I-485",
    matterTitle: "Garcia Family Petition",
    clientName: "Carlos Garcia",
    status: "RFE_ISSUED",
    receiptNumber: "WAC-24-234-56789",
    filedDate: "2025-09-20",
    receivedDate: "2025-10-05",
    approvedDate: null,
    deniedDate: null,
    rfeDate: "2026-02-10",
    rfeResponseDeadline: "2026-03-27",
    notes: "RFE: Additional evidence of bona fide marriage needed",
    lastUpdated: "2026-02-10",
    timeline: [
      { date: "2025-08-01", event: "Form preparation started" },
      { date: "2025-09-10", event: "Medical exam completed (I-693)" },
      { date: "2025-09-20", event: "Filed with USCIS" },
      { date: "2025-10-05", event: "Receipt notice received" },
      { date: "2026-02-10", event: "RFE issued by USCIS" },
    ],
  },
  {
    id: "frm-003",
    formType: "I-765",
    matterTitle: "Nguyen Work Authorization",
    clientName: "Thi Nguyen",
    status: "APPROVED_BY_USCIS",
    receiptNumber: "SRC-24-345-67890",
    filedDate: "2025-06-01",
    receivedDate: "2025-06-15",
    approvedDate: "2025-09-20",
    deniedDate: null,
    rfeDate: null,
    rfeResponseDeadline: null,
    notes: "EAD approved, card production ordered",
    lastUpdated: "2025-09-20",
    timeline: [
      { date: "2025-05-15", event: "Form preparation started" },
      { date: "2025-06-01", event: "Filed with USCIS" },
      { date: "2025-06-15", event: "Receipt notice received" },
      { date: "2025-09-20", event: "Approved by USCIS" },
    ],
  },
  {
    id: "frm-004",
    formType: "I-131",
    matterTitle: "Nguyen Work Authorization",
    clientName: "Thi Nguyen",
    status: "RECEIVED",
    receiptNumber: "SRC-24-456-78901",
    filedDate: "2025-06-01",
    receivedDate: "2025-06-15",
    approvedDate: null,
    deniedDate: null,
    rfeDate: null,
    rfeResponseDeadline: null,
    notes: "Advance Parole combo card filed concurrently with EAD",
    lastUpdated: "2025-06-15",
    timeline: [
      { date: "2025-05-15", event: "Form preparation started" },
      { date: "2025-06-01", event: "Filed with USCIS" },
      { date: "2025-06-15", event: "Receipt notice received" },
    ],
  },
  {
    id: "frm-005",
    formType: "I-589",
    matterTitle: "Ahmed Asylum Application",
    clientName: "Hassan Ahmed",
    status: "IN_PROGRESS",
    receiptNumber: null,
    filedDate: null,
    receivedDate: null,
    approvedDate: null,
    deniedDate: null,
    rfeDate: null,
    rfeResponseDeadline: null,
    notes: "Preparing personal declaration and country conditions evidence",
    lastUpdated: "2026-03-01",
    timeline: [
      { date: "2026-01-15", event: "Case intake completed" },
      { date: "2026-02-01", event: "Form preparation started" },
      { date: "2026-03-01", event: "Declaration draft in progress" },
    ],
  },
  {
    id: "frm-006",
    formType: "N-400",
    matterTitle: "Patel Naturalization",
    clientName: "Priya Patel",
    status: "READY_FOR_REVIEW",
    receiptNumber: null,
    filedDate: null,
    receivedDate: null,
    approvedDate: null,
    deniedDate: null,
    rfeDate: null,
    rfeResponseDeadline: null,
    notes: "All sections completed, awaiting attorney review",
    lastUpdated: "2026-02-20",
    timeline: [
      { date: "2026-01-05", event: "Eligibility check completed" },
      { date: "2026-01-20", event: "Form preparation started" },
      { date: "2026-02-20", event: "Ready for attorney review" },
    ],
  },
  {
    id: "frm-007",
    formType: "I-140",
    matterTitle: "Chen EB-2 Petition",
    clientName: "Wei Chen",
    status: "FILED",
    receiptNumber: "LIN-25-567-89012",
    filedDate: "2026-01-10",
    receivedDate: null,
    approvedDate: null,
    deniedDate: null,
    rfeDate: null,
    rfeResponseDeadline: null,
    notes: "EB-2 NIW petition, premium processing requested",
    lastUpdated: "2026-01-10",
    timeline: [
      { date: "2025-10-01", event: "Case evaluation completed" },
      { date: "2025-11-15", event: "Petition letter drafted" },
      { date: "2025-12-20", event: "Evidence package compiled" },
      { date: "2026-01-10", event: "Filed with USCIS (premium)" },
    ],
  },
  {
    id: "frm-008",
    formType: "I-485",
    matterTitle: "Rodriguez Adjustment",
    clientName: "Ana Rodriguez",
    status: "DENIED",
    receiptNumber: "WAC-23-678-90123",
    filedDate: "2024-08-15",
    receivedDate: "2024-09-01",
    approvedDate: null,
    deniedDate: "2026-01-20",
    rfeDate: null,
    rfeResponseDeadline: null,
    notes: "Denied due to inadmissibility grounds. Evaluating I-601 waiver.",
    lastUpdated: "2026-01-20",
    timeline: [
      { date: "2024-07-01", event: "Form preparation started" },
      { date: "2024-08-15", event: "Filed with USCIS" },
      { date: "2024-09-01", event: "Receipt notice received" },
      { date: "2025-06-15", event: "Biometrics appointment" },
      { date: "2025-11-10", event: "Interview scheduled" },
      { date: "2026-01-20", event: "Application denied" },
    ],
  },
  {
    id: "frm-009",
    formType: "I-130",
    matterTitle: "Kim Family Petition",
    clientName: "Soo-Jin Kim",
    status: "NOT_STARTED",
    receiptNumber: null,
    filedDate: null,
    receivedDate: null,
    approvedDate: null,
    deniedDate: null,
    rfeDate: null,
    rfeResponseDeadline: null,
    notes: "Awaiting client documents before starting form",
    lastUpdated: "2026-03-05",
    timeline: [
      { date: "2026-03-05", event: "Matter opened, documents requested from client" },
    ],
  },
  {
    id: "frm-010",
    formType: "I-765",
    matterTitle: "Ahmed Asylum Application",
    clientName: "Hassan Ahmed",
    status: "NOT_STARTED",
    receiptNumber: null,
    filedDate: null,
    receivedDate: null,
    approvedDate: null,
    deniedDate: null,
    rfeDate: null,
    rfeResponseDeadline: null,
    notes: "EAD application pending asylum filing",
    lastUpdated: "2026-02-01",
    timeline: [
      { date: "2026-02-01", event: "Pending asylum application filing" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Pipeline statuses for visualization
// ---------------------------------------------------------------------------

const PIPELINE_STAGES = [
  { key: "NOT_STARTED", label: "Not Started", bg: "bg-gray-200", text: "text-gray-800" },
  { key: "IN_PROGRESS", label: "In Progress", bg: "bg-blue-200", text: "text-blue-800" },
  { key: "READY_FOR_REVIEW", label: "Ready for Review", bg: "bg-purple-200", text: "text-purple-800" },
  { key: "FILED", label: "Filed", bg: "bg-cyan-200", text: "text-cyan-800" },
  { key: "RECEIVED", label: "Received", bg: "bg-teal-200", text: "text-teal-800" },
  { key: "RFE_ISSUED", label: "RFE Issued", bg: "bg-red-200", text: "text-red-800" },
  { key: "APPROVED_BY_USCIS", label: "Approved", bg: "bg-green-200", text: "text-green-800" },
  { key: "DENIED", label: "Denied", bg: "bg-red-300", text: "text-red-900" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStatusBadge(statusValue: string) {
  const status = FORM_STATUSES.find((s) => s.value === statusValue);
  if (!status) return <Badge variant="secondary">{statusValue}</Badge>;
  return <Badge className={cn(status.color, "border-0")}>{status.label}</Badge>;
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getFormLabel(formType: string) {
  return USCIS_FORMS.find((f) => f.value === formType)?.label ?? formType;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ImmigrationFormsPage() {
  const [forms, setForms] = useState<ImmigrationFormEntry[]>(DEMO_FORMS);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [matterSearch, setMatterSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // New form dialog state
  const [newMatter, setNewMatter] = useState("");
  const [newFormType, setNewFormType] = useState("");
  const [newStatus, setNewStatus] = useState("NOT_STARTED");
  const [newNotes, setNewNotes] = useState("");

  // Filtered forms
  const filtered = useMemo(() => {
    return forms.filter((f) => {
      if (search) {
        const q = search.toLowerCase();
        const matches =
          f.clientName.toLowerCase().includes(q) ||
          f.formType.toLowerCase().includes(q) ||
          (f.receiptNumber && f.receiptNumber.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (filterType && f.formType !== filterType) return false;
      if (filterStatus && f.status !== filterStatus) return false;
      if (matterSearch) {
        const q = matterSearch.toLowerCase();
        if (!f.matterTitle.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [forms, search, filterType, filterStatus, matterSearch]);

  // Pipeline counts
  const pipelineCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const stage of PIPELINE_STAGES) {
      counts[stage.key] = 0;
    }
    // Count APPROVED internal status under FILED for pipeline simplification
    for (const f of forms) {
      if (f.status === "APPROVED") {
        counts["FILED"] = (counts["FILED"] || 0) + 1;
      } else if (f.status === "RFE_RESPONDED") {
        counts["RECEIVED"] = (counts["RECEIVED"] || 0) + 1;
      } else if (counts[f.status] !== undefined) {
        counts[f.status]++;
      }
    }
    return counts;
  }, [forms]);

  // RFE alerts
  const rfeAlerts = forms.filter(
    (f) => f.status === "RFE_ISSUED" && f.rfeResponseDeadline
  );

  function handleCreateForm() {
    if (!newMatter || !newFormType) return;
    const entry: ImmigrationFormEntry = {
      id: `frm-${Date.now()}`,
      formType: newFormType,
      matterTitle: newMatter,
      clientName: newMatter,
      status: newStatus,
      receiptNumber: null,
      filedDate: null,
      receivedDate: null,
      approvedDate: null,
      deniedDate: null,
      rfeDate: null,
      rfeResponseDeadline: null,
      notes: newNotes || null,
      lastUpdated: new Date().toISOString().split("T")[0],
      timeline: [
        {
          date: new Date().toISOString().split("T")[0],
          event: "Form filing created",
        },
      ],
    };
    setForms((prev) => [entry, ...prev]);
    setDialogOpen(false);
    setNewMatter("");
    setNewFormType("");
    setNewStatus("NOT_STARTED");
    setNewNotes("");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Immigration Forms</h1>
          <p className="text-sm text-slate-500">
            Manage USCIS form filings across all matters
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>New Form Filing</Button>
      </div>

      {/* RFE Alert Banner */}
      {rfeAlerts.length > 0 && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4">
          <h3 className="font-semibold text-red-800">
            RFE Alert — {rfeAlerts.length} form{rfeAlerts.length > 1 ? "s" : ""} with pending RFE responses
          </h3>
          <ul className="mt-2 space-y-1">
            {rfeAlerts.map((f) => {
              const days = daysUntil(f.rfeResponseDeadline!);
              return (
                <li key={f.id} className="text-sm text-red-700">
                  <span className="font-medium">{f.formType}</span> — {f.clientName}:{" "}
                  <span className={cn("font-bold", days <= 14 ? "text-red-900" : "")}>
                    {days} days remaining
                  </span>{" "}
                  (deadline {formatDate(f.rfeResponseDeadline!)})
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Status Pipeline Visualization */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filing Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 overflow-x-auto">
            {PIPELINE_STAGES.map((stage, idx) => (
              <div key={stage.key} className="flex items-center">
                <button
                  onClick={() =>
                    setFilterStatus(filterStatus === stage.key ? "" : stage.key)
                  }
                  className={cn(
                    "flex flex-col items-center justify-center rounded-lg px-4 py-3 min-w-[100px] transition-all",
                    stage.bg,
                    stage.text,
                    filterStatus === stage.key && "ring-2 ring-slate-900 ring-offset-1"
                  )}
                >
                  <span className="text-2xl font-bold">{pipelineCounts[stage.key]}</span>
                  <span className="text-xs font-medium whitespace-nowrap">
                    {stage.label}
                  </span>
                </button>
                {idx < PIPELINE_STAGES.length - 1 && (
                  <div className="mx-1 text-slate-300 text-lg select-none">&rarr;</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <Label className="mb-1 block text-xs text-slate-500">Search</Label>
          <Input
            placeholder="Search client, form type, receipt #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-[200px]">
          <Label className="mb-1 block text-xs text-slate-500">Form Type</Label>
          <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">All Form Types</option>
            {USCIS_FORMS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.value} — {f.label.split(" - ")[1] || f.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-[180px]">
          <Label className="mb-1 block text-xs text-slate-500">Status</Label>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {FORM_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-[200px]">
          <Label className="mb-1 block text-xs text-slate-500">Matter</Label>
          <Input
            placeholder="Search matter..."
            value={matterSearch}
            onChange={(e) => setMatterSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Forms Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Form Type</TableHead>
                <TableHead>Matter / Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Receipt #</TableHead>
                <TableHead>Filed Date</TableHead>
                <TableHead>RFE Deadline</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No forms match the current filters.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((form) => {
                const isRfe = form.status === "RFE_ISSUED";
                const isExpanded = expandedId === form.id;

                return (
                  <Fragment key={form.id}>
                    <TableRow
                      className={cn(
                        "cursor-pointer",
                        isRfe && "bg-red-50 hover:bg-red-100/70"
                      )}
                      onClick={() =>
                        setExpandedId(isExpanded ? null : form.id)
                      }
                    >
                      <TableCell className="font-medium">
                        {form.formType}
                        <div className="text-xs text-slate-500 font-normal">
                          {getFormLabel(form.formType).split(" - ")[1] || ""}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{form.matterTitle}</div>
                        <div className="text-xs text-slate-500">{form.clientName}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(form.status)}</TableCell>
                      <TableCell className="text-sm">
                        {form.receiptNumber ?? <span className="text-slate-400">--</span>}
                      </TableCell>
                      <TableCell className="text-sm">
                        {form.filedDate ? formatDate(form.filedDate) : <span className="text-slate-400">--</span>}
                      </TableCell>
                      <TableCell>
                        {form.rfeResponseDeadline ? (
                          <div>
                            <div className="text-sm">{formatDate(form.rfeResponseDeadline)}</div>
                            <div
                              className={cn(
                                "text-xs font-semibold",
                                daysUntil(form.rfeResponseDeadline) <= 14
                                  ? "text-red-600"
                                  : "text-amber-600"
                              )}
                            >
                              {daysUntil(form.rfeResponseDeadline)} days left
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm">--</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {formatDate(form.lastUpdated)}
                      </TableCell>
                    </TableRow>

                    {/* Expanded Detail Row */}
                    {isExpanded && (
                      <TableRow className="bg-slate-50">
                        <TableCell colSpan={7} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Form Details */}
                            <div>
                              <h4 className="font-semibold mb-2">Form Details</h4>
                              <dl className="space-y-1 text-sm">
                                <div className="flex gap-2">
                                  <dt className="text-slate-500 w-32">Full Name:</dt>
                                  <dd>{getFormLabel(form.formType)}</dd>
                                </div>
                                <div className="flex gap-2">
                                  <dt className="text-slate-500 w-32">Matter:</dt>
                                  <dd>{form.matterTitle}</dd>
                                </div>
                                <div className="flex gap-2">
                                  <dt className="text-slate-500 w-32">Client:</dt>
                                  <dd>{form.clientName}</dd>
                                </div>
                                <div className="flex gap-2">
                                  <dt className="text-slate-500 w-32">Receipt #:</dt>
                                  <dd>{form.receiptNumber ?? "Not yet assigned"}</dd>
                                </div>
                                {form.filedDate && (
                                  <div className="flex gap-2">
                                    <dt className="text-slate-500 w-32">Filed:</dt>
                                    <dd>{formatDate(form.filedDate)}</dd>
                                  </div>
                                )}
                                {form.approvedDate && (
                                  <div className="flex gap-2">
                                    <dt className="text-slate-500 w-32">Approved:</dt>
                                    <dd>{formatDate(form.approvedDate)}</dd>
                                  </div>
                                )}
                                {form.deniedDate && (
                                  <div className="flex gap-2">
                                    <dt className="text-slate-500 w-32">Denied:</dt>
                                    <dd className="text-red-600 font-medium">
                                      {formatDate(form.deniedDate)}
                                    </dd>
                                  </div>
                                )}
                                {form.notes && (
                                  <div className="flex gap-2">
                                    <dt className="text-slate-500 w-32">Notes:</dt>
                                    <dd>{form.notes}</dd>
                                  </div>
                                )}
                              </dl>
                            </div>

                            {/* Timeline */}
                            <div>
                              <h4 className="font-semibold mb-2">Timeline</h4>
                              <ol className="relative border-l border-slate-300 ml-2 space-y-3">
                                {form.timeline.map((entry, i) => (
                                  <li key={i} className="ml-4">
                                    <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-slate-400" />
                                    <time className="text-xs text-slate-500">
                                      {formatDate(entry.date)}
                                    </time>
                                    <p className="text-sm">{entry.event}</p>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Form Filing Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Form Filing</DialogTitle>
            <DialogDescription>
              Create a new immigration form filing linked to a matter.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nf-matter">Matter / Client</Label>
              <Input
                id="nf-matter"
                className="mt-1"
                placeholder="Enter matter title or client name"
                value={newMatter}
                onChange={(e) => setNewMatter(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="nf-type">Form Type</Label>
              <Select
                id="nf-type"
                className="mt-1"
                value={newFormType}
                onChange={(e) => setNewFormType(e.target.value)}
              >
                <option value="">Select form type...</option>
                {USCIS_FORMS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="nf-status">Initial Status</Label>
              <Select
                id="nf-status"
                className="mt-1"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {FORM_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="nf-notes">Notes</Label>
              <Textarea
                id="nf-notes"
                className="mt-1"
                placeholder="Optional notes..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateForm}
              disabled={!newMatter || !newFormType}
            >
              Create Filing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


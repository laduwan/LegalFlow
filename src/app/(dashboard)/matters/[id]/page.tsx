"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  MATTER_STATUSES,
  IMMIGRATION_CASE_TYPES,
  USCIS_FORMS,
  FORM_STATUSES,
} from "@/lib/constants";
import {
  cn,
  formatDate,
  formatRelativeTime,
  formatCurrency,
  formatMinutesToHours,
} from "@/lib/utils";

// ---------------------------------------------------------------------------
// Demo data for a sample I-485 Adjustment of Status case
// ---------------------------------------------------------------------------

const DEMO_MATTER = {
  id: "m2",
  matterNumber: "IMM-2025-00002",
  title: "Patel Family - I-130 / I-485 Adjustment",
  status: "PENDING" as const,
  type: "IMMIGRATION",
  description:
    "Family-based adjustment of status petition for Raj Patel, sponsored by USC spouse Priya Patel. Concurrent filing of I-130, I-485, I-765 (EAD), and I-131 (Advance Parole). Priority date is current.",
  clientName: "Raj Patel",
  clientId: "c1",
  assignedAttorney: "Sarah Chen",
  billingType: "HOURLY",
  billingRate: 350,
  openDate: "2025-02-03",
  immigrationCaseType: "family-based",
  uscisReceiptNumber: "IOE9202345678",
  priorityDate: "2025-02-03",
  nextHearingDate: null as string | null,
  immigrationCourt: null as string | null,
  totalHours: 24.5,
  totalBilled: 8575,
  trustBalance: 3200,
};

const DEMO_FORMS = [
  {
    id: "f1",
    formType: "I-130",
    label: "I-130 - Petition for Alien Relative",
    status: "FILED",
    receiptNumber: "IOE9202345678",
    filedDate: "2025-02-15",
    receivedDate: "2025-02-28",
    notes: "Filed concurrently with I-485.",
  },
  {
    id: "f2",
    formType: "I-485",
    label: "I-485 - Adjustment of Status",
    status: "RECEIVED",
    receiptNumber: "IOE9202345679",
    filedDate: "2025-02-15",
    receivedDate: "2025-02-28",
    notes: "Biometrics appointment scheduled for April 2025.",
  },
  {
    id: "f3",
    formType: "I-765",
    label: "I-765 - Employment Authorization (EAD)",
    status: "APPROVED_BY_USCIS",
    receiptNumber: "IOE9202345680",
    filedDate: "2025-02-15",
    receivedDate: "2025-02-28",
    notes: "EAD approved and card produced.",
  },
  {
    id: "f4",
    formType: "I-131",
    label: "I-131 - Travel Document (Advance Parole)",
    status: "APPROVED_BY_USCIS",
    receiptNumber: "IOE9202345681",
    filedDate: "2025-02-15",
    receivedDate: "2025-02-28",
    notes: "Combo card issued with EAD.",
  },
  {
    id: "f5",
    formType: "I-864",
    label: "I-864 - Affidavit of Support",
    status: "FILED",
    receiptNumber: null as string | null,
    filedDate: "2025-02-15",
    receivedDate: null as string | null,
    notes: "Filed with I-485 packet.",
  },
  {
    id: "f6",
    formType: "I-693",
    label: "I-693 - Medical Examination",
    status: "FILED",
    receiptNumber: null as string | null,
    filedDate: "2025-02-15",
    receivedDate: null as string | null,
    notes: "Sealed medical submitted with initial filing.",
  },
];

const DEMO_CONTACTS = [
  {
    id: "c1",
    name: "Raj Patel",
    role: "Client / Beneficiary",
    email: "raj.patel@email.com",
    phone: "(555) 123-4567",
  },
  {
    id: "c2",
    name: "Priya Patel",
    role: "Petitioner",
    email: "priya.patel@email.com",
    phone: "(555) 123-4568",
  },
  {
    id: "c3",
    name: "Dr. James Wilson",
    role: "Civil Surgeon",
    email: "jwilson@medclinic.com",
    phone: "(555) 999-1234",
  },
];

const DEMO_DOCUMENTS = [
  {
    id: "d1",
    filename: "I-485_signed.pdf",
    type: "Government Form",
    uploadedBy: "Sarah Chen",
    createdAt: "2025-02-14T10:00:00Z",
    size: "2.4 MB",
  },
  {
    id: "d2",
    filename: "marriage_certificate.pdf",
    type: "Evidence",
    uploadedBy: "Raj Patel",
    createdAt: "2025-02-10T14:30:00Z",
    size: "1.1 MB",
  },
  {
    id: "d3",
    filename: "I-864_affidavit.pdf",
    type: "Government Form",
    uploadedBy: "Sarah Chen",
    createdAt: "2025-02-13T09:15:00Z",
    size: "3.2 MB",
  },
  {
    id: "d4",
    filename: "receipt_notice_I485.pdf",
    type: "Receipt Notice",
    uploadedBy: "Sarah Chen",
    createdAt: "2025-03-01T11:00:00Z",
    size: "0.5 MB",
  },
  {
    id: "d5",
    filename: "EAD_approval_notice.pdf",
    type: "Approval Notice",
    uploadedBy: "Sarah Chen",
    createdAt: "2025-06-15T16:00:00Z",
    size: "0.4 MB",
  },
];

const DEMO_TIME_ENTRIES = [
  {
    id: "t1",
    date: "2025-02-03",
    description: "Initial consultation with client re: AOS eligibility",
    durationMinutes: 60,
    rate: 350,
    user: "Sarah Chen",
    activityType: "Client Meeting",
  },
  {
    id: "t2",
    date: "2025-02-06",
    description: "Review supporting documents and prepare filing checklist",
    durationMinutes: 120,
    rate: 350,
    user: "Sarah Chen",
    activityType: "Document Review",
  },
  {
    id: "t3",
    date: "2025-02-10",
    description: "Draft I-130 and I-485 petitions",
    durationMinutes: 240,
    rate: 350,
    user: "Sarah Chen",
    activityType: "Immigration Form Preparation",
  },
  {
    id: "t4",
    date: "2025-02-13",
    description: "Prepare I-864 Affidavit of Support with financial documentation",
    durationMinutes: 90,
    rate: 350,
    user: "Sarah Chen",
    activityType: "Document Drafting",
  },
  {
    id: "t5",
    date: "2025-02-14",
    description: "Final review and assembly of filing packet",
    durationMinutes: 180,
    rate: 350,
    user: "Sarah Chen",
    activityType: "Document Review",
  },
  {
    id: "t6",
    date: "2025-03-15",
    description: "USCIS inquiry re: biometrics scheduling",
    durationMinutes: 30,
    rate: 350,
    user: "Sarah Chen",
    activityType: "USCIS Inquiry",
  },
];

const DEMO_INVOICES = [
  {
    id: "inv1",
    invoiceNumber: "INV-2025-0012",
    date: "2025-03-01",
    amount: 5250,
    status: "PAID",
  },
  {
    id: "inv2",
    invoiceNumber: "INV-2025-0025",
    date: "2025-04-01",
    amount: 3325,
    status: "SENT",
  },
];

const DEMO_TASKS = [
  {
    id: "tk1",
    title: "Follow up on biometrics appointment",
    status: "completed",
    dueDate: "2025-04-10",
    assignee: "Sarah Chen",
    priority: "high",
  },
  {
    id: "tk2",
    title: "Prepare interview prep memo for client",
    status: "pending",
    dueDate: "2025-09-01",
    assignee: "Sarah Chen",
    priority: "medium",
  },
  {
    id: "tk3",
    title: "Collect updated pay stubs from petitioner",
    status: "pending",
    dueDate: "2025-08-15",
    assignee: "Michael Torres",
    priority: "medium",
  },
  {
    id: "tk4",
    title: "Monitor case status online",
    status: "pending",
    dueDate: "2025-07-15",
    assignee: "Sarah Chen",
    priority: "low",
  },
];

const DEMO_NOTES = [
  {
    id: "n1",
    content:
      "Client confirmed they have not traveled outside the US since filing. Advised not to travel without advance parole document.",
    author: "Sarah Chen",
    createdAt: "2025-02-03T16:30:00Z",
    isPinned: true,
  },
  {
    id: "n2",
    content:
      "Biometrics completed on 4/15/2025 at USCIS Application Support Center, Newark NJ. No issues reported.",
    author: "Sarah Chen",
    createdAt: "2025-04-15T14:00:00Z",
    isPinned: false,
  },
  {
    id: "n3",
    content:
      "EAD/AP combo card received by client. Confirmed card details are correct.",
    author: "Michael Torres",
    createdAt: "2025-06-20T10:00:00Z",
    isPinned: false,
  },
];

const DEMO_ACTIVITY = [
  {
    id: "a1",
    action: "EAD combo card approved",
    timestamp: "2025-06-15T16:00:00Z",
  },
  {
    id: "a2",
    action: "Biometrics completed",
    timestamp: "2025-04-15T14:00:00Z",
  },
  {
    id: "a3",
    action: "Receipt notices received for all forms",
    timestamp: "2025-03-01T11:00:00Z",
  },
  {
    id: "a4",
    action: "I-485 packet filed with USCIS",
    timestamp: "2025-02-15T09:00:00Z",
  },
  {
    id: "a5",
    action: "Matter opened",
    timestamp: "2025-02-03T09:00:00Z",
  },
];

const FILING_HISTORY = [
  {
    date: "2025-02-15",
    event: "Initial filing - I-130, I-485, I-765, I-131, I-864, I-693 filed concurrently",
  },
  {
    date: "2025-02-28",
    event: "Receipt notices received for I-130, I-485, I-765, I-131",
  },
  { date: "2025-04-15", event: "Biometrics appointment completed" },
  {
    date: "2025-06-15",
    event: "EAD / Advance Parole combo card approved and produced",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStatusConfig(status: string) {
  return MATTER_STATUSES.find((s) => s.value === status) ?? MATTER_STATUSES[0];
}

function getFormStatusConfig(status: string) {
  return FORM_STATUSES.find((s) => s.value === status) ?? FORM_STATUSES[0];
}

const ROLE_COLORS: Record<string, string> = {
  "Client / Beneficiary": "bg-blue-100 text-blue-800",
  Petitioner: "bg-purple-100 text-purple-800",
  "Civil Surgeon": "bg-teal-100 text-teal-800",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MatterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const matter = DEMO_MATTER; // In production, fetch by params.id

  const statusCfg = getStatusConfig(matter.status);

  // Tasks local state
  const [tasks, setTasks] = useState(DEMO_TASKS);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Notes local state
  const [notes, setNotes] = useState(DEMO_NOTES);
  const [newNoteContent, setNewNoteContent] = useState("");

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: t.status === "completed" ? "pending" : "completed" }
          : t
      )
    );
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    setTasks((prev) => [
      ...prev,
      {
        id: `tk-${Date.now()}`,
        title: newTaskTitle.trim(),
        status: "pending",
        dueDate: "",
        assignee: "Unassigned",
        priority: "medium",
      },
    ]);
    setNewTaskTitle("");
  };

  const addNote = () => {
    if (!newNoteContent.trim()) return;
    setNotes((prev) => [
      {
        id: `n-${Date.now()}`,
        content: newNoteContent.trim(),
        author: "You",
        createdAt: new Date().toISOString(),
        isPinned: false,
      },
      ...prev,
    ]);
    setNewNoteContent("");
  };

  const pinnedNotes = notes.filter((n) => n.isPinned);
  const unpinnedNotes = notes.filter((n) => !n.isPinned);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/matters")}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              &larr; Back
            </button>
            <h1 className="text-2xl font-bold tracking-tight">
              {matter.title}
            </h1>
            <Badge className={cn(statusCfg.color, "border-0 font-medium")}>
              {statusCfg.label}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500 font-mono">
            {matter.matterNumber}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit</Button>
          <Button variant="destructive">Close Matter</Button>
        </div>
      </div>

      {/* Info bar */}
      <Card>
        <CardContent className="flex flex-wrap gap-x-8 gap-y-2 p-4 text-sm">
          <div>
            <span className="text-slate-500">Client:</span>{" "}
            <span className="font-medium">{matter.clientName}</span>
          </div>
          <div>
            <span className="text-slate-500">Case Type:</span>{" "}
            <span className="font-medium">
              {IMMIGRATION_CASE_TYPES.find(
                (t) => t.value === matter.immigrationCaseType
              )?.label ?? matter.immigrationCaseType}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Attorney:</span>{" "}
            <span className="font-medium">{matter.assignedAttorney}</span>
          </div>
          <div>
            <span className="text-slate-500">Billing:</span>{" "}
            <span className="font-medium">
              {matter.billingType} @ {formatCurrency(matter.billingRate)}/hr
            </span>
          </div>
          <div>
            <span className="text-slate-500">Opened:</span>{" "}
            <span className="font-medium">{formatDate(matter.openDate)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="immigration">Immigration</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timebilling">Time &amp; Billing</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* ---- OVERVIEW ---- */}
        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Case summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Case Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {matter.description}
                  </p>
                </CardContent>
              </Card>

              {/* Recent activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {DEMO_ACTIVITY.map((a) => (
                      <li key={a.id} className="flex items-start gap-3">
                        <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-slate-400" />
                        <div className="flex-1">
                          <p className="text-sm">{a.action}</p>
                          <p className="text-xs text-slate-400">
                            {formatRelativeTime(a.timestamp)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Key dates */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Dates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Opened</span>
                    <span className="font-medium">
                      {formatDate(matter.openDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Priority Date</span>
                    <span className="font-medium">
                      {matter.priorityDate
                        ? formatDate(matter.priorityDate)
                        : "\u2014"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Next Hearing</span>
                    <span className="font-medium">
                      {matter.nextHearingDate
                        ? formatDate(matter.nextHearingDate)
                        : "\u2014"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Hours</span>
                    <span className="font-medium">{matter.totalHours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Billed</span>
                    <span className="font-medium">
                      {formatCurrency(matter.totalBilled)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Trust Balance</span>
                    <span className="font-medium">
                      {formatCurrency(matter.trustBalance)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ---- IMMIGRATION ---- */}
        <TabsContent value="immigration">
          <div className="space-y-6">
            {/* USCIS Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">USCIS Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                <div>
                  <span className="text-slate-500 block">Receipt Number</span>
                  <span className="font-mono font-medium">
                    {matter.uscisReceiptNumber ?? "\u2014"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Priority Date</span>
                  <span className="font-medium">
                    {matter.priorityDate
                      ? formatDate(matter.priorityDate)
                      : "\u2014"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">
                    Immigration Court
                  </span>
                  <span className="font-medium">
                    {matter.immigrationCourt ?? "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Case Status</span>
                  <Badge
                    className={cn(statusCfg.color, "border-0 font-medium")}
                  >
                    {statusCfg.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Form Status Pipeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Form Status Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="mb-4 flex gap-1">
                    {FORM_STATUSES.map((fs) => (
                      <div
                        key={fs.value}
                        className={cn(
                          "flex-1 min-w-[80px] rounded px-2 py-1 text-center text-[10px] font-medium",
                          fs.color
                        )}
                      >
                        {fs.label}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Immigration Forms List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Immigration Forms</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Form</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Receipt #</TableHead>
                      <TableHead>Filed</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DEMO_FORMS.map((form) => {
                      const fsCfg = getFormStatusConfig(form.status);
                      return (
                        <TableRow key={form.id}>
                          <TableCell className="font-medium text-sm">
                            {form.label}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                fsCfg.color,
                                "border-0 font-medium"
                              )}
                            >
                              {fsCfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {form.receiptNumber ?? "\u2014"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {form.filedDate
                              ? formatDate(form.filedDate)
                              : "\u2014"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {form.receivedDate
                              ? formatDate(form.receivedDate)
                              : "\u2014"}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500 max-w-[200px] truncate">
                            {form.notes}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Filing History Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filing History</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="relative border-l border-slate-200 ml-3">
                  {FILING_HISTORY.map((item, idx) => (
                    <li key={idx} className="mb-6 ml-6">
                      <span className="absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full bg-white border-2 border-slate-300" />
                      <time className="mb-1 text-xs font-medium text-slate-400">
                        {formatDate(item.date)}
                      </time>
                      <p className="text-sm text-slate-700">{item.event}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---- CONTACTS ---- */}
        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Matter Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {DEMO_CONTACTS.map((contact) => (
                  <Card key={contact.id}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{contact.name}</p>
                        <Badge
                          className={cn(
                            ROLE_COLORS[contact.role] ??
                              "bg-slate-100 text-slate-800",
                            "border-0 text-xs"
                          )}
                        >
                          {contact.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">{contact.email}</p>
                      <p className="text-sm text-slate-500">{contact.phone}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- DOCUMENTS ---- */}
        <TabsContent value="documents">
          <div className="space-y-4">
            {/* Upload area */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Drag and drop files here, or click to upload
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      PDF, DOCX, JPG, PNG up to 25MB
                    </p>
                    <Button variant="outline" size="sm" className="mt-3">
                      Browse Files
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document list */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Documents</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Filename</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Size</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DEMO_DOCUMENTS.map((doc) => (
                      <TableRow key={doc.id} className="cursor-pointer">
                        <TableCell className="font-medium text-sm">
                          {doc.filename}
                        </TableCell>
                        <TableCell className="text-sm">{doc.type}</TableCell>
                        <TableCell className="text-sm">
                          {doc.uploadedBy}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(doc.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {doc.size}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---- TIME & BILLING ---- */}
        <TabsContent value="timebilling">
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-slate-500">Total Hours</p>
                  <p className="text-2xl font-bold">{matter.totalHours}h</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-slate-500">Total Billed</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(matter.totalBilled)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-slate-500">Trust Balance</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(matter.trustBalance)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Time entries */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Time Entries</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Attorney</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DEMO_TIME_ENTRIES.map((te) => (
                      <TableRow key={te.id}>
                        <TableCell className="text-sm">
                          {formatDate(te.date)}
                        </TableCell>
                        <TableCell className="text-sm max-w-[250px]">
                          {te.description}
                        </TableCell>
                        <TableCell className="text-sm">
                          {te.activityType}
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          {formatMinutesToHours(te.durationMinutes)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatCurrency(te.rate)}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {formatCurrency((te.durationMinutes / 60) * te.rate)}
                        </TableCell>
                        <TableCell className="text-sm">{te.user}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Invoices */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invoices</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DEMO_INVOICES.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-mono text-sm">
                          {inv.invoiceNumber}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(inv.date)}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {formatCurrency(inv.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              inv.status === "PAID"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800",
                              "border-0 font-medium"
                            )}
                          >
                            {inv.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---- TASKS ---- */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Tasks</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add task */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a new task..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addTask();
                  }}
                  className="flex-1"
                />
                <Button onClick={addTask} size="sm">
                  Add
                </Button>
              </div>

              {/* Task list */}
              <ul className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center gap-3 py-3"
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={cn(
                        "h-5 w-5 flex-shrink-0 rounded border-2 transition-colors flex items-center justify-center",
                        task.status === "completed"
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-slate-300 hover:border-slate-400"
                      )}
                    >
                      {task.status === "completed" && (
                        <span className="text-xs">&#10003;</span>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm",
                          task.status === "completed" &&
                            "line-through text-slate-400"
                        )}
                      >
                        {task.title}
                      </p>
                      <div className="flex gap-3 mt-0.5 text-xs text-slate-400">
                        {task.dueDate && (
                          <span>Due: {formatDate(task.dueDate)}</span>
                        )}
                        <span>{task.assignee}</span>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        task.priority === "high"
                          ? "bg-red-500"
                          : task.priority === "medium"
                            ? "bg-yellow-400"
                            : "bg-green-500"
                      )}
                      title={`${task.priority} priority`}
                    />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- NOTES ---- */}
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add note */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a note..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button onClick={addNote} size="sm">
                    Add Note
                  </Button>
                </div>
              </div>

              {/* Pinned notes */}
              {pinnedNotes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                    Pinned
                  </h3>
                  {pinnedNotes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4"
                    >
                      <p className="text-sm text-slate-700">{note.content}</p>
                      <div className="mt-2 flex gap-2 text-xs text-slate-400">
                        <span>{note.author}</span>
                        <span>&middot;</span>
                        <span>{formatRelativeTime(note.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Other notes */}
              <div className="space-y-3">
                {pinnedNotes.length > 0 && (
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                    All Notes
                  </h3>
                )}
                {unpinnedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg border border-slate-200 p-4"
                  >
                    <p className="text-sm text-slate-700">{note.content}</p>
                    <div className="mt-2 flex gap-2 text-xs text-slate-400">
                      <span>{note.author}</span>
                      <span>&middot;</span>
                      <span>{formatRelativeTime(note.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

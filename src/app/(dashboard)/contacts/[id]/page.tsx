"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Globe, FileText, StickyNote, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const demoContact = {
  id: "ct_1",
  type: "CLIENT",
  firstName: "Maria",
  middleName: "Elena",
  lastName: "Rodriguez",
  suffix: null,
  preferredName: "Maria",
  companyName: null,
  email: "maria.rodriguez@email.com",
  phone: "(305) 555-0142",
  altPhone: "(305) 555-0199",
  fax: null,
  addressLine1: "1234 Brickell Ave",
  addressLine2: "Apt 1502",
  city: "Miami",
  state: "FL",
  zipCode: "33131",
  country: "US",
  language: "Spanish",
  communicationPreference: "email",
  aNumber: "A-098-765-432",
  dateOfBirth: "1988-06-15",
  countryOfBirth: "Colombia",
  countryOfCitizenship: "Colombia",
  currentImmigrationStatus: "lpr",
  immigrationStatusLabel: "Lawful Permanent Resident (Green Card)",
  entryDate: "2018-03-20",
  visaExpirationDate: null,
  workAuthExpiration: null,
  passportNumber: "CC12345678",
  passportExpiration: "2029-06-15",
};

const immigrationTimeline = [
  { date: "2018-03-20", event: "Entered US on K-1 Fiancee Visa", detail: "Port of Entry: Miami International Airport" },
  { date: "2018-06-10", event: "Marriage to USC sponsor", detail: "Miami-Dade County, FL" },
  { date: "2018-09-15", event: "Filed I-485 Adjustment of Status", detail: "Receipt No: MSC-21-123-45678" },
  { date: "2019-01-22", event: "Biometrics appointment completed", detail: "USCIS Field Office, Miami" },
  { date: "2019-04-10", event: "Interview at USCIS Field Office", detail: "Approved - Conditional Green Card issued" },
  { date: "2021-02-15", event: "Filed I-751 Remove Conditions", detail: "Receipt No: MSC-21-987-65432" },
  { date: "2021-08-30", event: "I-751 Approved", detail: "10-year Green Card issued" },
  { date: "2025-11-01", event: "Consultation for N-400 Naturalization", detail: "Eligible based on 3-year rule" },
];

const demoMatters = [
  {
    id: "m_1",
    matterNumber: "IMM-2025-00042",
    title: "Rodriguez - Naturalization (N-400)",
    status: "ACTIVE",
    type: "naturalization",
    openDate: "2025-11-15",
  },
  {
    id: "m_2",
    matterNumber: "IMM-2021-00018",
    title: "Rodriguez - Remove Conditions (I-751)",
    status: "CLOSED",
    type: "adjustment-of-status",
    openDate: "2021-02-01",
  },
  {
    id: "m_3",
    matterNumber: "IMM-2018-00005",
    title: "Rodriguez - Adjustment of Status (I-485)",
    status: "CLOSED",
    type: "adjustment-of-status",
    openDate: "2018-07-01",
  },
];

const demoDocuments = [
  { id: "d_1", name: "Passport - Rodriguez, Maria", type: "identification", uploadedAt: "2025-11-15", size: "2.4 MB" },
  { id: "d_2", name: "Green Card (I-551) - Front & Back", type: "identification", uploadedAt: "2025-11-15", size: "1.8 MB" },
  { id: "d_3", name: "Marriage Certificate", type: "evidence", uploadedAt: "2025-11-15", size: "3.1 MB" },
  { id: "d_4", name: "N-400 Application Draft", type: "government-form", uploadedAt: "2026-01-10", size: "450 KB" },
  { id: "d_5", name: "Tax Returns 2022-2024", type: "financial", uploadedAt: "2026-02-05", size: "8.2 MB" },
  { id: "d_6", name: "I-751 Approval Notice", type: "approval-notice", uploadedAt: "2021-09-01", size: "320 KB" },
];

const demoNotes = [
  {
    id: "n_1",
    author: "Sarah Chen",
    content: "Client eligible for naturalization under 3-year rule (married to USC). All requirements met including physical presence and good moral character. Proceeding with N-400 filing.",
    createdAt: "2025-11-15T10:30:00Z",
  },
  {
    id: "n_2",
    author: "Sarah Chen",
    content: "Reviewed tax returns for 2022-2024. All filed jointly with spouse. No issues identified for naturalization application.",
    createdAt: "2026-02-05T14:15:00Z",
  },
  {
    id: "n_3",
    author: "Maria Lopez",
    content: "Client called to ask about the timeline for N-400 processing. Advised current processing time is approximately 8-12 months. Client is eager to apply before traveling abroad in summer 2026.",
    createdAt: "2026-03-01T09:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

const TABS = ["Overview", "Immigration", "Matters", "Documents", "Notes"] as const;
type Tab = (typeof TABS)[number];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusBadge(status: string) {
  switch (status) {
    case "ACTIVE":
      return <Badge className="bg-green-100 text-green-800 border-0">Active</Badge>;
    case "CLOSED":
      return <Badge className="bg-slate-100 text-slate-600 border-0">Closed</Badge>;
    case "PENDING":
      return <Badge className="bg-yellow-100 text-yellow-800 border-0">Pending</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ContactDetailPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState(demoNotes);

  const contact = demoContact;

  function handleAddNote() {
    if (!newNote.trim()) return;
    setNotes([
      {
        id: `n_${Date.now()}`,
        author: "Current User",
        content: newNote.trim(),
        createdAt: new Date().toISOString(),
      },
      ...notes,
    ]);
    setNewNote("");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/contacts")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {contact.firstName} {contact.middleName ? `${contact.middleName} ` : ""}
            {contact.lastName}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge>{contact.type}</Badge>
            {contact.immigrationStatusLabel && (
              <Badge variant="secondary">{contact.immigrationStatusLabel}</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "Overview" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Contact Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm">{contact.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="text-sm">{contact.phone}</p>
                  {contact.altPhone && (
                    <p className="text-xs text-slate-400">Alt: {contact.altPhone}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Address</p>
                  <p className="text-sm">
                    {contact.addressLine1}
                    {contact.addressLine2 && `, ${contact.addressLine2}`}
                  </p>
                  <p className="text-sm">
                    {contact.city}, {contact.state} {contact.zipCode}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Language / Preference</p>
                  <p className="text-sm">
                    {contact.language} &middot; {contact.communicationPreference}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Immigration Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Immigration Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                {[
                  { label: "A-Number", value: contact.aNumber },
                  { label: "Status", value: contact.immigrationStatusLabel },
                  { label: "Date of Birth", value: contact.dateOfBirth ? formatDate(contact.dateOfBirth) : null },
                  { label: "Country of Birth", value: contact.countryOfBirth },
                  { label: "Country of Citizenship", value: contact.countryOfCitizenship },
                  { label: "Entry Date", value: contact.entryDate ? formatDate(contact.entryDate) : null },
                  { label: "Visa Expiration", value: contact.visaExpirationDate ? formatDate(contact.visaExpirationDate) : "N/A (LPR)" },
                  { label: "Work Auth Expiration", value: contact.workAuthExpiration ?? "N/A (LPR)" },
                  { label: "Passport Number", value: contact.passportNumber },
                  { label: "Passport Expiration", value: contact.passportExpiration ? formatDate(contact.passportExpiration) : null },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <dt className="text-slate-500">{item.label}</dt>
                    <dd className="font-medium text-slate-800">{item.value ?? "-"}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "Immigration" && (
        <div className="space-y-6">
          {/* Detailed fields */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Immigration Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: "A-Number", value: contact.aNumber },
                  { label: "Immigration Status", value: contact.immigrationStatusLabel },
                  { label: "Date of Birth", value: contact.dateOfBirth ? formatDate(contact.dateOfBirth) : "-" },
                  { label: "Country of Birth", value: contact.countryOfBirth },
                  { label: "Country of Citizenship", value: contact.countryOfCitizenship },
                  { label: "Entry Date", value: contact.entryDate ? formatDate(contact.entryDate) : "-" },
                  { label: "Visa Expiration", value: contact.visaExpirationDate ? formatDate(contact.visaExpirationDate) : "N/A" },
                  { label: "Work Auth Expiration", value: contact.workAuthExpiration ?? "N/A" },
                  { label: "Passport Number", value: contact.passportNumber },
                  { label: "Passport Expiration", value: contact.passportExpiration ? formatDate(contact.passportExpiration) : "-" },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-slate-200 p-3">
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className="mt-1 text-sm font-medium text-slate-800">{item.value ?? "-"}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Immigration Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200" />
                <div className="space-y-6">
                  {immigrationTimeline.map((item, idx) => (
                    <div key={idx} className="relative flex gap-4 pl-8">
                      <div className="absolute left-1.5 top-1 h-3 w-3 rounded-full border-2 border-blue-500 bg-white" />
                      <div>
                        <p className="text-xs text-slate-400">{formatDate(item.date)}</p>
                        <p className="text-sm font-medium text-slate-800">{item.event}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "Matters" && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-slate-600" />
              <CardTitle className="text-base">Associated Matters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {demoMatters.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                No matters associated with this contact.
              </p>
            ) : (
              <div className="space-y-3">
                {demoMatters.map((matter) => (
                  <div
                    key={matter.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/matters/${matter.id}`)}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">{matter.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {matter.matterNumber} &middot; Opened {formatDate(matter.openDate)}
                      </p>
                    </div>
                    {statusBadge(matter.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "Documents" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-600" />
                <CardTitle className="text-base">Documents</CardTitle>
              </div>
              <Button variant="outline" size="sm">
                Upload Document
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Size</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demoDocuments.map((doc) => (
                  <TableRow key={doc.id} className="cursor-pointer">
                    <TableCell className="font-medium text-sm">{doc.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {doc.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {formatDate(doc.uploadedAt)}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">{doc.size}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === "Notes" && (
        <div className="space-y-4">
          {/* Add note form */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-slate-600" />
                <CardTitle className="text-base">Add Note</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Write a note about this contact..."
                  className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                />
                <div className="flex justify-end">
                  <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                    Add Note
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes list */}
          {notes.map((note) => (
            <Card key={note.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-700">{note.author}</p>
                  <p className="text-xs text-slate-400">{formatDate(note.createdAt)}</p>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {note.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

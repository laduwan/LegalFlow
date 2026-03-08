"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CONTACT_TYPES = [
  { value: "CLIENT", label: "Client" },
  { value: "OPPOSING_PARTY", label: "Opposing Party" },
  { value: "WITNESS", label: "Witness" },
  { value: "EXPERT", label: "Expert" },
  { value: "COURT", label: "Court" },
  { value: "GOVERNMENT_AGENCY", label: "Government Agency" },
  { value: "OTHER", label: "Other" },
];

const IMMIGRATION_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "h1b", label: "H-1B Worker" },
  { value: "lpr", label: "LPR (Green Card)" },
  { value: "f1", label: "F-1 Student" },
  { value: "asylee", label: "Asylee" },
  { value: "daca", label: "DACA Recipient" },
  { value: "tps", label: "TPS Holder" },
  { value: "undocumented", label: "Undocumented" },
];

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const demoContacts = [
  {
    id: "ct_1",
    firstName: "Maria",
    lastName: "Rodriguez",
    type: "CLIENT",
    email: "maria.rodriguez@email.com",
    phone: "(305) 555-0142",
    currentImmigrationStatus: "lpr",
    immigrationStatusLabel: "Lawful Permanent Resident",
    aNumber: "A-098-765-432",
    visaExpirationDate: null,
  },
  {
    id: "ct_2",
    firstName: "Chen",
    lastName: "Wei",
    type: "CLIENT",
    email: "chen.wei@email.com",
    phone: "(212) 555-0198",
    currentImmigrationStatus: "f1",
    immigrationStatusLabel: "F-1 Student",
    aNumber: null,
    visaExpirationDate: "2026-03-28",
  },
  {
    id: "ct_3",
    firstName: "Amir",
    lastName: "Patel",
    type: "CLIENT",
    email: "amir.patel@email.com",
    phone: "(713) 555-0167",
    currentImmigrationStatus: "h1b",
    immigrationStatusLabel: "H-1B Worker",
    aNumber: "A-012-345-678",
    visaExpirationDate: "2027-09-15",
  },
  {
    id: "ct_4",
    firstName: "Sofia",
    lastName: "Herrera",
    type: "CLIENT",
    email: "sofia.herrera@email.com",
    phone: "(510) 555-0134",
    currentImmigrationStatus: "daca",
    immigrationStatusLabel: "DACA Recipient",
    aNumber: "A-111-222-333",
    visaExpirationDate: "2026-11-20",
  },
  {
    id: "ct_5",
    firstName: "James",
    lastName: "O'Brien",
    type: "OPPOSING_PARTY",
    email: "jobrien@lawfirm.com",
    phone: "(202) 555-0190",
    currentImmigrationStatus: null,
    immigrationStatusLabel: null,
    aNumber: null,
    visaExpirationDate: null,
  },
  {
    id: "ct_6",
    firstName: "Olga",
    lastName: "Petrov",
    type: "CLIENT",
    email: "olga.petrov@email.com",
    phone: "(646) 555-0123",
    currentImmigrationStatus: "tps",
    immigrationStatusLabel: "TPS Holder",
    aNumber: "A-444-555-666",
    visaExpirationDate: "2026-04-05",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function typeBadgeVariant(type: string) {
  switch (type) {
    case "CLIENT":
      return "default" as const;
    case "OPPOSING_PARTY":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

function typeLabel(type: string) {
  return CONTACT_TYPES.find((t) => t.value === type)?.label ?? type;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ContactsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Filter
  const filtered = demoContacts.filter((c) => {
    const matchesSearch =
      search === "" ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "" || c.type === typeFilter;
    const matchesStatus =
      statusFilter === "" || c.currentImmigrationStatus === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
          <p className="text-sm text-slate-500">
            Manage clients, opposing parties, and other contacts.
          </p>
        </div>
        <Button onClick={() => router.push("/contacts/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
        >
          <option value="">All Types</option>
          {CONTACT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
        >
          {IMMIGRATION_STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Immigration Status</TableHead>
              <TableHead>A-Number</TableHead>
              <TableHead>Visa Expiration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-slate-500"
                >
                  No contacts found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((contact) => (
                <TableRow
                  key={contact.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/contacts/${contact.id}`)}
                >
                  <TableCell className="font-medium">
                    {contact.firstName} {contact.lastName}
                  </TableCell>
                  <TableCell>
                    <Badge variant={typeBadgeVariant(contact.type)}>
                      {typeLabel(contact.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {contact.email ?? "-"}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {contact.phone ?? "-"}
                  </TableCell>
                  <TableCell>
                    {contact.immigrationStatusLabel ? (
                      <Badge variant="secondary">
                        {contact.immigrationStatusLabel}
                      </Badge>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600">
                    {contact.aNumber ?? "-"}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {contact.visaExpirationDate
                      ? formatDate(contact.visaExpirationDate)
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing {(page - 1) * perPage + 1} to{" "}
          {Math.min(page * perPage, filtered.length)} of {filtered.length}{" "}
          contacts
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

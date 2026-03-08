"use client";

import { useState, useMemo } from "react";
import { cn, formatDate } from "@/lib/utils";
import { IMMIGRATION_STATUSES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VisaRecord {
  id: string;
  clientName: string;
  currentStatus: string;
  visaType: string;
  expirationDate: string;
  workAuthExpiration: string | null;
  matterTitle: string;
  aNumber: string | null;
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_VISAS: VisaRecord[] = [
  {
    id: "v-001",
    clientName: "Thi Nguyen",
    currentStatus: "ead",
    visaType: "C09 (Adjustment Pending)",
    expirationDate: "2026-04-01",
    workAuthExpiration: "2026-04-01",
    matterTitle: "Nguyen Work Authorization",
    aNumber: "A-111-222-333",
  },
  {
    id: "v-002",
    clientName: "Wei Chen",
    currentStatus: "h1b",
    visaType: "H-1B",
    expirationDate: "2026-03-25",
    workAuthExpiration: "2026-03-25",
    matterTitle: "Chen EB-2 Petition",
    aNumber: null,
  },
  {
    id: "v-003",
    clientName: "Priya Patel",
    currentStatus: "lpr",
    visaType: "Green Card",
    expirationDate: "2030-08-15",
    workAuthExpiration: null,
    matterTitle: "Patel Naturalization",
    aNumber: "A-444-555-666",
  },
  {
    id: "v-004",
    clientName: "Olga Petrov",
    currentStatus: "h4",
    visaType: "H-4 Dependent",
    expirationDate: "2026-03-15",
    workAuthExpiration: null,
    matterTitle: "Petrov H-4 EAD Application",
    aNumber: null,
  },
  {
    id: "v-005",
    clientName: "Ricardo Fuentes",
    currentStatus: "f1",
    visaType: "F-1 OPT",
    expirationDate: "2026-06-30",
    workAuthExpiration: "2026-06-30",
    matterTitle: "Fuentes OPT Extension",
    aNumber: null,
  },
  {
    id: "v-006",
    clientName: "Fatima Al-Rashid",
    currentStatus: "asylee",
    visaType: "Asylee",
    expirationDate: "2027-05-10",
    workAuthExpiration: "2027-05-10",
    matterTitle: "Al-Rashid Asylum Case",
    aNumber: "A-777-888-999",
  },
  {
    id: "v-007",
    clientName: "Koji Tanaka",
    currentStatus: "l1",
    visaType: "L-1A Intracompany",
    expirationDate: "2026-05-20",
    workAuthExpiration: "2026-05-20",
    matterTitle: "Tanaka L-1 to EB-1C",
    aNumber: null,
  },
  {
    id: "v-008",
    clientName: "Maria Santos",
    currentStatus: "tps",
    visaType: "TPS (El Salvador)",
    expirationDate: "2026-09-09",
    workAuthExpiration: "2026-09-09",
    matterTitle: "Santos TPS Renewal",
    aNumber: "A-222-333-444",
  },
  {
    id: "v-009",
    clientName: "Ahmed Hassan",
    currentStatus: "daca",
    visaType: "DACA",
    expirationDate: "2026-03-20",
    workAuthExpiration: "2026-03-20",
    matterTitle: "Hassan DACA Renewal",
    aNumber: "A-555-666-777",
  },
  {
    id: "v-010",
    clientName: "Ling Zhou",
    currentStatus: "conditional-resident",
    visaType: "Conditional Green Card",
    expirationDate: "2026-04-12",
    workAuthExpiration: null,
    matterTitle: "Zhou I-751 Petition",
    aNumber: "A-888-999-000",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getStatusLabel(value: string): string {
  return IMMIGRATION_STATUSES.find((s) => s.value === value)?.label ?? value;
}

function daysRemainingColor(days: number): string {
  if (days < 0) return "text-red-900 bg-red-100";
  if (days <= 30) return "text-red-700 bg-red-50";
  if (days <= 90) return "text-amber-700 bg-amber-50";
  return "text-green-700 bg-green-50";
}

function daysRemainingTextColor(days: number): string {
  if (days < 0) return "text-red-700";
  if (days <= 30) return "text-red-600 font-bold";
  if (days <= 90) return "text-amber-600 font-semibold";
  return "text-green-600";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function VisaTrackingPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRange, setFilterRange] = useState("");

  const visas = DEMO_VISAS;

  // Computed days remaining for each record
  const enriched = useMemo(() => {
    return visas.map((v) => ({
      ...v,
      daysRemaining: daysUntil(v.expirationDate),
      workAuthDaysRemaining: v.workAuthExpiration
        ? daysUntil(v.workAuthExpiration)
        : null,
    }));
  }, [visas]);

  // Filter
  const filtered = useMemo(() => {
    return enriched.filter((v) => {
      if (search) {
        const q = search.toLowerCase();
        const matches =
          v.clientName.toLowerCase().includes(q) ||
          v.visaType.toLowerCase().includes(q) ||
          v.matterTitle.toLowerCase().includes(q) ||
          (v.aNumber && v.aNumber.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (filterStatus && v.currentStatus !== filterStatus) return false;
      if (filterRange) {
        if (filterRange === "30" && v.daysRemaining > 30) return false;
        if (filterRange === "90" && v.daysRemaining > 90) return false;
        if (filterRange === "180" && v.daysRemaining > 180) return false;
      }
      return true;
    });
  }, [enriched, search, filterStatus, filterRange]);

  // Alert buckets
  const critical = enriched.filter((v) => v.daysRemaining >= 0 && v.daysRemaining <= 30);
  const warning = enriched.filter((v) => v.daysRemaining > 30 && v.daysRemaining <= 90);
  const upcoming = enriched.filter((v) => v.daysRemaining > 90 && v.daysRemaining <= 180);

  // Summary stats
  const totalTracked = visas.length;
  const expiring30 = critical.length;
  const expiring90 = warning.length;
  const activeEads = visas.filter(
    (v) => v.currentStatus === "ead" || v.workAuthExpiration !== null
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Visa & Status Tracking</h1>
        <p className="text-sm text-slate-500">
          Monitor visa expirations, work authorization, and immigration status deadlines
        </p>
      </div>

      {/* Alert Sections */}
      {critical.length > 0 && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4">
          <h3 className="font-semibold text-red-800">
            CRITICAL — {critical.length} expiration{critical.length > 1 ? "s" : ""} within 30 days
          </h3>
          <ul className="mt-2 space-y-1">
            {critical.map((v) => (
              <li key={v.id} className="text-sm text-red-700">
                <span className="font-medium">{v.clientName}</span> — {v.visaType}:{" "}
                <span className="font-bold">
                  {v.daysRemaining <= 0
                    ? "EXPIRED"
                    : `${v.daysRemaining} days remaining`}
                </span>{" "}
                (expires {formatDate(v.expirationDate)})
              </li>
            ))}
          </ul>
        </div>
      )}

      {warning.length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
          <h3 className="font-semibold text-amber-800">
            WARNING — {warning.length} expiration{warning.length > 1 ? "s" : ""} within 90 days
          </h3>
          <ul className="mt-2 space-y-1">
            {warning.map((v) => (
              <li key={v.id} className="text-sm text-amber-700">
                <span className="font-medium">{v.clientName}</span> — {v.visaType}:{" "}
                {v.daysRemaining} days remaining (expires {formatDate(v.expirationDate)})
              </li>
            ))}
          </ul>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="rounded-lg border border-blue-300 bg-blue-50 p-4">
          <h3 className="font-semibold text-blue-800">
            UPCOMING — {upcoming.length} expiration{upcoming.length > 1 ? "s" : ""} within 180 days
          </h3>
          <ul className="mt-2 space-y-1">
            {upcoming.map((v) => (
              <li key={v.id} className="text-sm text-blue-700">
                <span className="font-medium">{v.clientName}</span> — {v.visaType}:{" "}
                {v.daysRemaining} days remaining (expires {formatDate(v.expirationDate)})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Tracked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTracked}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Expiring &lt;30 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{expiring30}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Expiring &lt;90 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{expiring90}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Active EADs / Work Auth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{activeEads}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <Label className="mb-1 block text-xs text-slate-500">Search</Label>
          <Input
            placeholder="Search client, visa type, matter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-[200px]">
          <Label className="mb-1 block text-xs text-slate-500">Status Type</Label>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {IMMIGRATION_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-[180px]">
          <Label className="mb-1 block text-xs text-slate-500">Expiration Range</Label>
          <Select value={filterRange} onChange={(e) => setFilterRange(e.target.value)}>
            <option value="">All</option>
            <option value="30">Within 30 days</option>
            <option value="90">Within 90 days</option>
            <option value="180">Within 180 days</option>
          </Select>
        </div>
      </div>

      {/* Main Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Current Status</TableHead>
                <TableHead>Visa Type</TableHead>
                <TableHead>Expiration Date</TableHead>
                <TableHead>Work Auth Expiration</TableHead>
                <TableHead>Days Remaining</TableHead>
                <TableHead>Associated Matter</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No visa records match the current filters.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.clientName}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="border-0 bg-slate-100 text-slate-800"
                    >
                      {getStatusLabel(v.currentStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{v.visaType}</TableCell>
                  <TableCell className="text-sm">
                    {formatDate(v.expirationDate)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {v.workAuthExpiration ? (
                      formatDate(v.workAuthExpiration)
                    ) : (
                      <span className="text-slate-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
                        daysRemainingColor(v.daysRemaining)
                      )}
                    >
                      {v.daysRemaining <= 0
                        ? "EXPIRED"
                        : `${v.daysRemaining} days`}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {v.matterTitle}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* External Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">External Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  "https://egov.uscis.gov/casestatus/landing.do",
                  "_blank",
                  "noopener"
                )
              }
            >
              Check USCIS Case Status
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html",
                  "_blank",
                  "noopener"
                )
              }
            >
              Visa Bulletin
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  "https://egov.uscis.gov/processing-times/",
                  "_blank",
                  "noopener"
                )
              }
            >
              USCIS Processing Times
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

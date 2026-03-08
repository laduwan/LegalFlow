"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { MATTER_STATUSES, IMMIGRATION_CASE_TYPES } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MatterStatus = (typeof MATTER_STATUSES)[number]["value"];

interface DemoMatter {
  id: string;
  matterNumber: string;
  title: string;
  clientName: string;
  type: string;
  status: MatterStatus;
  immigrationCaseType: string;
  uscisReceiptNumber: string | null;
  assignedTo: string;
  openDate: string;
  billingType: string;
  priority: "high" | "medium" | "low";
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_MATTERS: DemoMatter[] = [
  {
    id: "m1",
    matterNumber: "IMM-2025-00001",
    title: "Rodriguez - Asylum Application",
    clientName: "Maria Rodriguez",
    type: "IMMIGRATION",
    status: "ACTIVE",
    immigrationCaseType: "asylum",
    uscisReceiptNumber: "ZAR2501234567",
    assignedTo: "Sarah Chen",
    openDate: "2025-01-15",
    billingType: "FLAT_FEE",
    priority: "high",
  },
  {
    id: "m2",
    matterNumber: "IMM-2025-00002",
    title: "Patel Family - I-130 / I-485 Adjustment",
    clientName: "Raj Patel",
    type: "IMMIGRATION",
    status: "PENDING",
    immigrationCaseType: "family-based",
    uscisReceiptNumber: "IOE9202345678",
    assignedTo: "Michael Torres",
    openDate: "2025-02-03",
    billingType: "HOURLY",
    priority: "medium",
  },
  {
    id: "m3",
    matterNumber: "IMM-2025-00003",
    title: "Nguyen - H-1B Visa Petition",
    clientName: "Linh Nguyen",
    type: "IMMIGRATION",
    status: "ACTIVE",
    immigrationCaseType: "h1b",
    uscisReceiptNumber: "EAC2590012345",
    assignedTo: "Sarah Chen",
    openDate: "2025-03-10",
    billingType: "FLAT_FEE",
    priority: "high",
  },
  {
    id: "m4",
    matterNumber: "IMM-2025-00004",
    title: "Garcia - Removal Defense / Cancellation",
    clientName: "Carlos Garcia",
    type: "IMMIGRATION",
    status: "ACTIVE",
    immigrationCaseType: "removal-defense",
    uscisReceiptNumber: null,
    assignedTo: "Michael Torres",
    openDate: "2025-04-22",
    billingType: "HOURLY",
    priority: "high",
  },
  {
    id: "m5",
    matterNumber: "IMM-2025-00005",
    title: "Kim - Naturalization Application",
    clientName: "Jin-Soo Kim",
    type: "IMMIGRATION",
    status: "INTAKE",
    immigrationCaseType: "naturalization",
    uscisReceiptNumber: null,
    assignedTo: "Sarah Chen",
    openDate: "2025-06-01",
    billingType: "FLAT_FEE",
    priority: "low",
  },
  {
    id: "m6",
    matterNumber: "IMM-2025-00006",
    title: "Hernandez - DACA Renewal",
    clientName: "Ana Hernandez",
    type: "IMMIGRATION",
    status: "PENDING",
    immigrationCaseType: "daca",
    uscisReceiptNumber: "IOE9304567890",
    assignedTo: "Michael Torres",
    openDate: "2025-05-18",
    billingType: "FLAT_FEE",
    priority: "medium",
  },
  {
    id: "m7",
    matterNumber: "IMM-2025-00007",
    title: "Okafor - EB-5 Investor Petition",
    clientName: "Chidi Okafor",
    type: "IMMIGRATION",
    status: "ON_HOLD",
    immigrationCaseType: "eb5",
    uscisReceiptNumber: "IOE9205678901",
    assignedTo: "Sarah Chen",
    openDate: "2025-07-02",
    billingType: "HOURLY",
    priority: "medium",
  },
  {
    id: "m8",
    matterNumber: "IMM-2024-00098",
    title: "Santos - TPS Extension",
    clientName: "Luis Santos",
    type: "IMMIGRATION",
    status: "CLOSED",
    immigrationCaseType: "tps",
    uscisReceiptNumber: "IOE9101234567",
    assignedTo: "Michael Torres",
    openDate: "2024-11-05",
    billingType: "PRO_BONO",
    priority: "low",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStatusConfig(status: string) {
  return MATTER_STATUSES.find((s) => s.value === status) ?? MATTER_STATUSES[0];
}

function getCaseTypeLabel(value: string) {
  return (
    IMMIGRATION_CASE_TYPES.find((t) => t.value === value)?.label ?? value
  );
}

const BILLING_TYPES = [
  { value: "HOURLY", label: "Hourly" },
  { value: "FLAT_FEE", label: "Flat Fee" },
  { value: "CONTINGENCY", label: "Contingency" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "PRO_BONO", label: "Pro Bono" },
];

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-yellow-400",
  low: "bg-green-500",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MattersPage() {
  const router = useRouter();

  // View toggle
  const [view, setView] = useState<"list" | "kanban">("list");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [caseTypeFilter, setCaseTypeFilter] = useState("");
  const [billingFilter, setBillingFilter] = useState("");

  const filtered = useMemo(() => {
    return DEMO_MATTERS.filter((m) => {
      if (
        search &&
        !m.title.toLowerCase().includes(search.toLowerCase()) &&
        !m.clientName.toLowerCase().includes(search.toLowerCase()) &&
        !m.matterNumber.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      if (statusFilter && m.status !== statusFilter) return false;
      if (caseTypeFilter && m.immigrationCaseType !== caseTypeFilter)
        return false;
      if (billingFilter && m.billingType !== billingFilter) return false;
      return true;
    });
  }, [search, statusFilter, caseTypeFilter, billingFilter]);

  // Group by status for Kanban
  const kanbanColumns = useMemo(() => {
    return MATTER_STATUSES.map((s) => ({
      ...s,
      matters: filtered.filter((m) => m.status === s.value),
    }));
  }, [filtered]);

  const navigateToMatter = (id: string) => {
    router.push(`/matters/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Matters</h1>
        <Button onClick={() => router.push("/matters/new")}>
          + New Matter
        </Button>
      </div>

      {/* View toggle + Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        {/* Filters */}
        <div className="flex flex-1 flex-wrap items-end gap-3">
          <div className="w-64">
            <Input
              placeholder="Search matters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-40"
          >
            <option value="">All Statuses</option>
            {MATTER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>

          <Select
            value={caseTypeFilter}
            onChange={(e) => setCaseTypeFilter(e.target.value)}
            className="w-52"
          >
            <option value="">All Case Types</option>
            {IMMIGRATION_CASE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>

          <Select
            value={billingFilter}
            onChange={(e) => setBillingFilter(e.target.value)}
            className="w-40"
          >
            <option value="">All Billing</option>
            {BILLING_TYPES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </Select>
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg border border-slate-200 bg-white">
          <button
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-l-lg transition-colors",
              view === "list"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-50"
            )}
            onClick={() => setView("list")}
          >
            List
          </button>
          <button
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-r-lg transition-colors",
              view === "kanban"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-50"
            )}
            onClick={() => setView("kanban")}
          >
            Kanban
          </button>
        </div>
      </div>

      {/* List view */}
      {view === "list" && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matter #</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Immigration Type</TableHead>
                  <TableHead>USCIS Receipt #</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Opened</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                      No matters found.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((matter) => {
                  const statusCfg = getStatusConfig(matter.status);
                  return (
                    <TableRow
                      key={matter.id}
                      className="cursor-pointer"
                      onClick={() => navigateToMatter(matter.id)}
                    >
                      <TableCell className="font-mono text-xs">
                        {matter.matterNumber}
                      </TableCell>
                      <TableCell className="font-medium">
                        {matter.title}
                      </TableCell>
                      <TableCell>{matter.clientName}</TableCell>
                      <TableCell>{matter.type}</TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            statusCfg.color,
                            "border-0 font-medium"
                          )}
                        >
                          {statusCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {getCaseTypeLabel(matter.immigrationCaseType)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {matter.uscisReceiptNumber ?? "\u2014"}
                      </TableCell>
                      <TableCell>{matter.assignedTo}</TableCell>
                      <TableCell className="text-sm">
                        {formatDate(matter.openDate)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Kanban view */}
      {view === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map((col) => (
            <div
              key={col.value}
              className="flex w-72 flex-shrink-0 flex-col rounded-lg border border-slate-200 bg-slate-50"
            >
              {/* Column header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
                <span className="text-sm font-semibold">{col.label}</span>
                <Badge
                  variant="secondary"
                  className="text-xs"
                >
                  {col.matters.length}
                </Badge>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 p-2">
                {col.matters.length === 0 && (
                  <p className="py-6 text-center text-xs text-slate-400">
                    No matters
                  </p>
                )}
                {col.matters.map((matter) => (
                  <Card
                    key={matter.id}
                    className="cursor-pointer transition-shadow hover:shadow-md"
                    onClick={() => navigateToMatter(matter.id)}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">
                          {matter.title}
                        </p>
                        <span
                          className={cn(
                            "mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full",
                            PRIORITY_COLORS[matter.priority]
                          )}
                          title={`${matter.priority} priority`}
                        />
                      </div>
                      <p className="text-xs text-slate-500">
                        {matter.clientName}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          {getCaseTypeLabel(matter.immigrationCaseType)}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {matter.matterNumber}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

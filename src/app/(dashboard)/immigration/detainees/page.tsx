"use client";

import { useState, useMemo, Fragment } from "react";
import { cn, formatDate, formatCurrency } from "@/lib/utils";
import { BOND_STATUSES, IMMIGRATION_STATUSES } from "@/lib/constants";
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

interface Communication {
  id: string;
  date: string;
  type: string;
  summary: string;
  contactedBy: string;
}

interface Transfer {
  id: string;
  date: string;
  fromFacility: string;
  toFacility: string;
  notes: string | null;
}

interface DetaineeRecord {
  id: string;
  firstName: string;
  lastName: string;
  aNumber: string;
  email: string | null;
  phone: string | null;
  facilityName: string;
  facilityCity: string;
  facilityState: string;
  legalStatus: string;
  bondStatus: string;
  bondAmount: number | null;
  bondConditions: string | null;
  nextHearingDate: string | null;
  matterTitle: string | null;
  communications: Communication[];
  transfers: Transfer[];
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_DETAINEES: DetaineeRecord[] = [
  {
    id: "det-001",
    firstName: "Carlos",
    lastName: "Mendez",
    aNumber: "A-098-765-432",
    email: null,
    phone: "555-0101",
    facilityName: "Stewart Detention Center",
    facilityCity: "Lumpkin",
    facilityState: "GA",
    legalStatus: "removal-proceedings",
    bondStatus: "set",
    bondAmount: 15000,
    bondConditions: "Must check in with ICE bi-weekly, surrender passport",
    nextHearingDate: "2026-03-12",
    matterTitle: "Mendez Removal Defense",
    communications: [
      { id: "c1", date: "2026-03-05", type: "Phone Call", summary: "Discussed bond hearing prep and evidence needed", contactedBy: "Atty. Sarah Mitchell" },
      { id: "c2", date: "2026-02-28", type: "Legal Visit", summary: "Reviewed declaration and signed forms", contactedBy: "Atty. Sarah Mitchell" },
      { id: "c3", date: "2026-02-20", type: "Phone Call", summary: "Client informed about upcoming bond hearing date", contactedBy: "Paralegal Rosa Torres" },
      { id: "c4", date: "2026-02-10", type: "Letter", summary: "Sent copy of filed documents for review", contactedBy: "Paralegal Rosa Torres" },
      { id: "c5", date: "2026-01-30", type: "Legal Visit", summary: "Initial intake and case assessment", contactedBy: "Atty. Sarah Mitchell" },
    ],
    transfers: [
      { id: "t1", date: "2026-01-15", fromFacility: "Irwin County Detention Center", toFacility: "Stewart Detention Center", notes: "Transferred due to facility capacity" },
    ],
  },
  {
    id: "det-002",
    firstName: "Jean",
    lastName: "Baptiste",
    aNumber: "A-087-654-321",
    email: null,
    phone: null,
    facilityName: "Krome Processing Center",
    facilityCity: "Miami",
    facilityState: "FL",
    legalStatus: "detained",
    bondStatus: "denied",
    bondAmount: null,
    bondConditions: null,
    nextHearingDate: "2026-03-20",
    matterTitle: "Baptiste Asylum Claim",
    communications: [
      { id: "c6", date: "2026-03-02", type: "Phone Call", summary: "Discussed asylum interview preparation", contactedBy: "Atty. James Okafor" },
      { id: "c7", date: "2026-02-18", type: "Legal Visit", summary: "Took detailed declaration for asylum application", contactedBy: "Atty. James Okafor" },
      { id: "c8", date: "2026-02-05", type: "Phone Call", summary: "Initial contact, explained legal process", contactedBy: "Paralegal Maria Santos" },
    ],
    transfers: [],
  },
  {
    id: "det-003",
    firstName: "Miguel",
    lastName: "Ramirez",
    aNumber: "A-076-543-210",
    email: "mramirez.family@email.com",
    phone: "555-0303",
    facilityName: "Adelanto ICE Processing Center",
    facilityCity: "Adelanto",
    facilityState: "CA",
    legalStatus: "removal-proceedings",
    bondStatus: "posted",
    bondAmount: 10000,
    bondConditions: "GPS ankle monitor, weekly check-ins",
    nextHearingDate: "2026-04-15",
    matterTitle: "Ramirez Cancellation of Removal",
    communications: [
      { id: "c9", date: "2026-03-01", type: "Phone Call", summary: "Confirmed bond posted, arranging release logistics", contactedBy: "Paralegal Rosa Torres" },
      { id: "c10", date: "2026-02-25", type: "Legal Visit", summary: "Bond posted, pending release processing", contactedBy: "Atty. Sarah Mitchell" },
      { id: "c11", date: "2026-02-15", type: "Phone Call", summary: "Bond reduced on appeal, family raising funds", contactedBy: "Atty. Sarah Mitchell" },
    ],
    transfers: [
      { id: "t2", date: "2025-12-20", fromFacility: "Imperial Regional Detention", toFacility: "Adelanto ICE Processing Center", notes: null },
    ],
  },
  {
    id: "det-004",
    firstName: "Amara",
    lastName: "Diallo",
    aNumber: "A-065-432-109",
    email: null,
    phone: "555-0404",
    facilityName: "Elizabeth Detention Facility",
    facilityCity: "Elizabeth",
    facilityState: "NJ",
    legalStatus: "detained",
    bondStatus: "none",
    bondAmount: null,
    bondConditions: null,
    nextHearingDate: "2026-03-25",
    matterTitle: "Diallo Asylum — Withholding of Removal",
    communications: [
      { id: "c12", date: "2026-03-03", type: "Legal Visit", summary: "Prepared client for individual merits hearing", contactedBy: "Atty. James Okafor" },
      { id: "c13", date: "2026-02-20", type: "Phone Call", summary: "Discussed country conditions evidence from Guinea", contactedBy: "Paralegal Maria Santos" },
    ],
    transfers: [],
  },
  {
    id: "det-005",
    firstName: "Andrei",
    lastName: "Volkov",
    aNumber: "A-054-321-098",
    email: "a.volkov@email.com",
    phone: "555-0505",
    facilityName: "Otay Mesa Detention Center",
    facilityCity: "San Diego",
    facilityState: "CA",
    legalStatus: "removal-proceedings",
    bondStatus: "set",
    bondAmount: 25000,
    bondConditions: "Must surrender all travel documents",
    nextHearingDate: "2026-03-10",
    matterTitle: "Volkov Removal Defense",
    communications: [
      { id: "c14", date: "2026-03-06", type: "Phone Call", summary: "Final prep before master calendar hearing", contactedBy: "Atty. Sarah Mitchell" },
      { id: "c15", date: "2026-02-28", type: "Legal Visit", summary: "Reviewed all evidence and prepared testimony outline", contactedBy: "Atty. Sarah Mitchell" },
      { id: "c16", date: "2026-02-10", type: "Letter", summary: "Sent translated court documents in Russian", contactedBy: "Paralegal Rosa Torres" },
    ],
    transfers: [
      { id: "t3", date: "2026-01-05", fromFacility: "GEO Aurora Facility", toFacility: "Otay Mesa Detention Center", notes: "Transfer for hearing jurisdiction" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getBondStatusBadge(status: string) {
  const found = BOND_STATUSES.find((b) => b.value === status);
  const label = found?.label ?? status;
  const colorMap: Record<string, string> = {
    none: "bg-gray-100 text-gray-800",
    set: "bg-amber-100 text-amber-800",
    posted: "bg-green-100 text-green-800",
    denied: "bg-red-100 text-red-800",
    revoked: "bg-red-200 text-red-900",
  };
  return (
    <Badge className={cn(colorMap[status] || "bg-gray-100 text-gray-800", "border-0")}>
      {label}
    </Badge>
  );
}

function getLegalStatusLabel(status: string) {
  return IMMIGRATION_STATUSES.find((s) => s.value === status)?.label ?? status;
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DetaineeTrackingPage() {
  const [detainees, setDetainees] = useState<DetaineeRecord[]>(DEMO_DETAINEES);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Log communication dialog
  const [commDialogOpen, setCommDialogOpen] = useState(false);
  const [commDetaineeId, setCommDetaineeId] = useState<string | null>(null);
  const [commType, setCommType] = useState("Phone Call");
  const [commSummary, setCommSummary] = useState("");

  // Transfer dialog
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferDetaineeId, setTransferDetaineeId] = useState<string | null>(null);
  const [transferFacility, setTransferFacility] = useState("");
  const [transferNotes, setTransferNotes] = useState("");

  // New detainee dialog state
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newANumber, setNewANumber] = useState("");
  const [newFacility, setNewFacility] = useState("");
  const [newBondStatus, setNewBondStatus] = useState("none");

  // Upcoming hearings (next 7 days)
  const upcomingHearings = useMemo(() => {
    return detainees.filter((d) => {
      if (!d.nextHearingDate) return false;
      const days = daysUntil(d.nextHearingDate);
      return days >= 0 && days <= 7;
    });
  }, [detainees]);

  // Summary stats
  const totalDetainees = detainees.length;
  const pendingBondHearings = detainees.filter(
    (d) => d.bondStatus === "set" || d.bondStatus === "none"
  ).length;
  const upcomingHearingsCount = detainees.filter((d) => {
    if (!d.nextHearingDate) return false;
    const days = daysUntil(d.nextHearingDate);
    return days >= 0 && days <= 30;
  }).length;
  const recentTransfers = detainees.filter((d) => d.transfers.length > 0).length;

  // Filter
  const filtered = useMemo(() => {
    if (!search) return detainees;
    const q = search.toLowerCase();
    return detainees.filter(
      (d) =>
        `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
        d.aNumber.toLowerCase().includes(q) ||
        d.facilityName.toLowerCase().includes(q)
    );
  }, [detainees, search]);

  function handleAddDetainee() {
    if (!newFirstName || !newLastName) return;
    const rec: DetaineeRecord = {
      id: `det-${Date.now()}`,
      firstName: newFirstName,
      lastName: newLastName,
      aNumber: newANumber || "A-000-000-000",
      email: null,
      phone: null,
      facilityName: newFacility || "Unknown Facility",
      facilityCity: "",
      facilityState: "",
      legalStatus: "detained",
      bondStatus: newBondStatus,
      bondAmount: null,
      bondConditions: null,
      nextHearingDate: null,
      matterTitle: null,
      communications: [],
      transfers: [],
    };
    setDetainees((prev) => [rec, ...prev]);
    setDialogOpen(false);
    setNewFirstName("");
    setNewLastName("");
    setNewANumber("");
    setNewFacility("");
    setNewBondStatus("none");
  }

  function handleLogCommunication() {
    if (!commDetaineeId || !commSummary) return;
    setDetainees((prev) =>
      prev.map((d) => {
        if (d.id !== commDetaineeId) return d;
        return {
          ...d,
          communications: [
            {
              id: `c-${Date.now()}`,
              date: new Date().toISOString().split("T")[0],
              type: commType,
              summary: commSummary,
              contactedBy: "Current User",
            },
            ...d.communications,
          ],
        };
      })
    );
    setCommDialogOpen(false);
    setCommSummary("");
  }

  function handleRecordTransfer() {
    if (!transferDetaineeId || !transferFacility) return;
    setDetainees((prev) =>
      prev.map((d) => {
        if (d.id !== transferDetaineeId) return d;
        return {
          ...d,
          facilityName: transferFacility,
          transfers: [
            {
              id: `t-${Date.now()}`,
              date: new Date().toISOString().split("T")[0],
              fromFacility: d.facilityName,
              toFacility: transferFacility,
              notes: transferNotes || null,
            },
            ...d.transfers,
          ],
        };
      })
    );
    setTransferDialogOpen(false);
    setTransferFacility("");
    setTransferNotes("");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Detainee Tracking</h1>
          <p className="text-sm text-slate-500">
            Manage detained clients, bond hearings, and facility communications
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              window.open(
                "https://locator.ice.gov/odls/#/index",
                "_blank",
                "noopener"
              )
            }
          >
            ICE Online Detainee Locator System
          </Button>
          <Button onClick={() => setDialogOpen(true)}>Add Detainee</Button>
        </div>
      </div>

      {/* Upcoming Hearings Alert */}
      {upcomingHearings.length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
          <h3 className="font-semibold text-amber-800">
            {upcomingHearings.length} detainee{upcomingHearings.length > 1 ? "s" : ""} with hearings in the next 7 days
          </h3>
          <ul className="mt-2 space-y-1">
            {upcomingHearings.map((d) => (
              <li key={d.id} className="text-sm text-amber-700">
                <span className="font-medium">
                  {d.firstName} {d.lastName}
                </span>{" "}
                ({d.aNumber}) — Hearing on{" "}
                <span className="font-semibold">{formatDate(d.nextHearingDate!)}</span> (
                {daysUntil(d.nextHearingDate!)} days)
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
              Total Detainees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalDetainees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Pending Bond Hearings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{pendingBondHearings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Upcoming Hearings (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{upcomingHearingsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Recent Transfers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{recentTransfers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search by name, A-Number, or facility..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Detainee Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>A-Number</TableHead>
                <TableHead>Facility</TableHead>
                <TableHead>Legal Status</TableHead>
                <TableHead>Bond Status</TableHead>
                <TableHead>Bond Amount</TableHead>
                <TableHead>Next Hearing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No detainees found.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((det) => {
                const isExpanded = expandedId === det.id;
                const hearingDays = det.nextHearingDate
                  ? daysUntil(det.nextHearingDate)
                  : null;

                return (
                  <Fragment key={det.id}>
                    <TableRow
                      className="cursor-pointer"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : det.id)
                      }
                    >
                      <TableCell className="font-medium">
                        {det.firstName} {det.lastName}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {det.aNumber}
                      </TableCell>
                      <TableCell>
                        <div>{det.facilityName}</div>
                        <div className="text-xs text-slate-500">
                          {det.facilityCity}
                          {det.facilityState ? `, ${det.facilityState}` : ""}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {getLegalStatusLabel(det.legalStatus)}
                      </TableCell>
                      <TableCell>{getBondStatusBadge(det.bondStatus)}</TableCell>
                      <TableCell>
                        {det.bondAmount ? (
                          formatCurrency(det.bondAmount)
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {det.nextHearingDate ? (
                          <div>
                            <div className="text-sm">
                              {formatDate(det.nextHearingDate)}
                            </div>
                            <div
                              className={cn(
                                "text-xs font-semibold",
                                hearingDays !== null && hearingDays <= 7
                                  ? "text-red-600"
                                  : hearingDays !== null && hearingDays <= 14
                                  ? "text-amber-600"
                                  : "text-slate-500"
                              )}
                            >
                              {hearingDays} days
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Expanded Detail Row */}
                    {isExpanded && (
                      <TableRow className="bg-slate-50">
                        <TableCell colSpan={7} className="p-4">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Contact & Status */}
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Contact Info</h4>
                                <dl className="space-y-1 text-sm">
                                  <div className="flex gap-2">
                                    <dt className="text-slate-500 w-24">Phone:</dt>
                                    <dd>{det.phone ?? "N/A"}</dd>
                                  </div>
                                  <div className="flex gap-2">
                                    <dt className="text-slate-500 w-24">Email:</dt>
                                    <dd>{det.email ?? "N/A"}</dd>
                                  </div>
                                  <div className="flex gap-2">
                                    <dt className="text-slate-500 w-24">Matter:</dt>
                                    <dd>{det.matterTitle ?? "Unlinked"}</dd>
                                  </div>
                                </dl>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">Bond Details</h4>
                                <dl className="space-y-1 text-sm">
                                  <div className="flex gap-2">
                                    <dt className="text-slate-500 w-24">Status:</dt>
                                    <dd>{getBondStatusBadge(det.bondStatus)}</dd>
                                  </div>
                                  <div className="flex gap-2">
                                    <dt className="text-slate-500 w-24">Amount:</dt>
                                    <dd>
                                      {det.bondAmount
                                        ? formatCurrency(det.bondAmount)
                                        : "N/A"}
                                    </dd>
                                  </div>
                                  {det.bondConditions && (
                                    <div className="flex gap-2">
                                      <dt className="text-slate-500 w-24">Conditions:</dt>
                                      <dd>{det.bondConditions}</dd>
                                    </div>
                                  )}
                                </dl>
                              </div>

                              {/* Quick Actions */}
                              <div className="flex flex-wrap gap-2 pt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCommDetaineeId(det.id);
                                    setCommDialogOpen(true);
                                  }}
                                >
                                  Log Communication
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTransferDetaineeId(det.id);
                                    setTransferDialogOpen(true);
                                  }}
                                >
                                  Record Transfer
                                </Button>
                              </div>
                            </div>

                            {/* Communication Log */}
                            <div>
                              <h4 className="font-semibold mb-2">
                                Communication Log (Last 5)
                              </h4>
                              {det.communications.length === 0 ? (
                                <p className="text-sm text-slate-400">
                                  No communications recorded.
                                </p>
                              ) : (
                                <ol className="space-y-3">
                                  {det.communications.slice(0, 5).map((comm) => (
                                    <li
                                      key={comm.id}
                                      className="border-l-2 border-slate-300 pl-3"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {comm.type}
                                        </Badge>
                                        <span className="text-xs text-slate-500">
                                          {formatDate(comm.date)}
                                        </span>
                                      </div>
                                      <p className="text-sm mt-0.5">{comm.summary}</p>
                                      <p className="text-xs text-slate-400">
                                        {comm.contactedBy}
                                      </p>
                                    </li>
                                  ))}
                                </ol>
                              )}
                            </div>

                            {/* Transfer History */}
                            <div>
                              <h4 className="font-semibold mb-2">Transfer History</h4>
                              {det.transfers.length === 0 ? (
                                <p className="text-sm text-slate-400">
                                  No transfers recorded.
                                </p>
                              ) : (
                                <ol className="space-y-3">
                                  {det.transfers.map((tr) => (
                                    <li
                                      key={tr.id}
                                      className="border-l-2 border-purple-300 pl-3"
                                    >
                                      <div className="text-xs text-slate-500">
                                        {formatDate(tr.date)}
                                      </div>
                                      <p className="text-sm">
                                        <span className="text-slate-500">
                                          {tr.fromFacility}
                                        </span>{" "}
                                        &rarr;{" "}
                                        <span className="font-medium">
                                          {tr.toFacility}
                                        </span>
                                      </p>
                                      {tr.notes && (
                                        <p className="text-xs text-slate-400">
                                          {tr.notes}
                                        </p>
                                      )}
                                    </li>
                                  ))}
                                </ol>
                              )}
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

      {/* Add Detainee Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Detainee</DialogTitle>
            <DialogDescription>
              Register a new detained client in the system.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="nd-first">First Name</Label>
                <Input
                  id="nd-first"
                  className="mt-1"
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="nd-last">Last Name</Label>
                <Input
                  id="nd-last"
                  className="mt-1"
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="nd-anum">A-Number</Label>
              <Input
                id="nd-anum"
                className="mt-1"
                placeholder="A-XXX-XXX-XXX"
                value={newANumber}
                onChange={(e) => setNewANumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="nd-facility">Facility</Label>
              <Input
                id="nd-facility"
                className="mt-1"
                placeholder="Detention facility name"
                value={newFacility}
                onChange={(e) => setNewFacility(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="nd-bond">Bond Status</Label>
              <Select
                id="nd-bond"
                className="mt-1"
                value={newBondStatus}
                onChange={(e) => setNewBondStatus(e.target.value)}
              >
                {BOND_STATUSES.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddDetainee}
              disabled={!newFirstName || !newLastName}
            >
              Add Detainee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Communication Dialog */}
      <Dialog open={commDialogOpen} onOpenChange={setCommDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Communication</DialogTitle>
            <DialogDescription>
              Record a communication with the detained client.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="comm-type">Type</Label>
              <Select
                id="comm-type"
                className="mt-1"
                value={commType}
                onChange={(e) => setCommType(e.target.value)}
              >
                <option value="Phone Call">Phone Call</option>
                <option value="Legal Visit">Legal Visit</option>
                <option value="Letter">Letter</option>
                <option value="Email">Email</option>
                <option value="Video Call">Video Call</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="comm-summary">Summary</Label>
              <Textarea
                id="comm-summary"
                className="mt-1"
                placeholder="Describe the communication..."
                value={commSummary}
                onChange={(e) => setCommSummary(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCommDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogCommunication} disabled={!commSummary}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Transfer Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Transfer</DialogTitle>
            <DialogDescription>
              Record a facility transfer for this detainee.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="tr-facility">New Facility</Label>
              <Input
                id="tr-facility"
                className="mt-1"
                placeholder="Destination facility name"
                value={transferFacility}
                onChange={(e) => setTransferFacility(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tr-notes">Notes</Label>
              <Textarea
                id="tr-notes"
                className="mt-1"
                placeholder="Optional notes..."
                value={transferNotes}
                onChange={(e) => setTransferNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTransferDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRecordTransfer}
              disabled={!transferFacility}
            >
              Save Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

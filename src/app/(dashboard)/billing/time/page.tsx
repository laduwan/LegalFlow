"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Clock,
  Plus,
  Play,
  Square,
  Filter,
  CheckSquare,
  Edit3,
  Check,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { cn, formatCurrency, formatDate, formatMinutesToHours } from "@/lib/utils";
import { ACTIVITY_TYPES } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TimeEntry {
  id: string;
  date: string;
  matter: string;
  matterId: string;
  description: string;
  activityType: string;
  durationMinutes: number;
  rate: number;
  billable: boolean;
  status: "Draft" | "Approved" | "Billed";
  user: string;
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const matters = [
  { id: "m1", name: "Rodriguez - AOS" },
  { id: "m2", name: "Wei - H-1B Transfer" },
  { id: "m3", name: "Patel - H-1B Extension" },
  { id: "m4", name: "Herrera - Family Based" },
  { id: "m5", name: "Garcia - Asylum" },
  { id: "m6", name: "Petrov - L-1 Visa" },
  { id: "m7", name: "Al-Rashid - EB-5" },
];

const users = [
  { id: "u1", name: "Sarah Chen" },
  { id: "u2", name: "James Wilson" },
  { id: "u3", name: "Maria Lopez" },
];

const initialEntries: TimeEntry[] = [
  {
    id: "te-1",
    date: "2026-03-08",
    matter: "Rodriguez - AOS",
    matterId: "m1",
    description: "Research case law on AOS eligibility for overstay waiver",
    activityType: "research",
    durationMinutes: 150,
    rate: 350,
    billable: true,
    status: "Draft",
    user: "Sarah Chen",
  },
  {
    id: "te-2",
    date: "2026-03-08",
    matter: "Patel - H-1B Extension",
    matterId: "m3",
    description: "Draft H-1B extension petition cover letter",
    activityType: "drafting",
    durationMinutes: 90,
    rate: 350,
    billable: true,
    status: "Draft",
    user: "Sarah Chen",
  },
  {
    id: "te-3",
    date: "2026-03-07",
    matter: "Garcia - Asylum",
    matterId: "m5",
    description: "Prepare country conditions evidence packet for Guatemala",
    activityType: "hearing-prep",
    durationMinutes: 240,
    rate: 350,
    billable: true,
    status: "Approved",
    user: "James Wilson",
  },
  {
    id: "te-4",
    date: "2026-03-07",
    matter: "Herrera - Family Based",
    matterId: "m4",
    description: "Client phone call to discuss RFE response strategy",
    activityType: "client-call",
    durationMinutes: 45,
    rate: 350,
    billable: true,
    status: "Draft",
    user: "Sarah Chen",
  },
  {
    id: "te-5",
    date: "2026-03-07",
    matter: "Wei - H-1B Transfer",
    matterId: "m2",
    description: "Review supporting documentation and employment verification letters",
    activityType: "review",
    durationMinutes: 120,
    rate: 300,
    billable: true,
    status: "Draft",
    user: "Maria Lopez",
  },
  {
    id: "te-6",
    date: "2026-03-06",
    matter: "Al-Rashid - EB-5",
    matterId: "m7",
    description: "Draft business plan summary for EB-5 petition",
    activityType: "drafting",
    durationMinutes: 180,
    rate: 350,
    billable: true,
    status: "Approved",
    user: "Sarah Chen",
  },
  {
    id: "te-7",
    date: "2026-03-06",
    matter: "Garcia - Asylum",
    matterId: "m5",
    description: "Court appearance - Master Calendar Hearing",
    activityType: "court-appearance",
    durationMinutes: 180,
    rate: 400,
    billable: true,
    status: "Billed",
    user: "James Wilson",
  },
  {
    id: "te-8",
    date: "2026-03-06",
    matter: "Petrov - L-1 Visa",
    matterId: "m6",
    description: "Prepare L-1 visa petition forms and supporting evidence",
    activityType: "immigration-forms",
    durationMinutes: 210,
    rate: 300,
    billable: true,
    status: "Draft",
    user: "Maria Lopez",
  },
  {
    id: "te-9",
    date: "2026-03-05",
    matter: "Rodriguez - AOS",
    matterId: "m1",
    description: "Client meeting to review I-485 application and gather documents",
    activityType: "client-meeting",
    durationMinutes: 60,
    rate: 350,
    billable: true,
    status: "Approved",
    user: "Sarah Chen",
  },
  {
    id: "te-10",
    date: "2026-03-05",
    matter: "Herrera - Family Based",
    matterId: "m4",
    description: "Draft RFE response for I-130 petition",
    activityType: "drafting",
    durationMinutes: 300,
    rate: 350,
    billable: true,
    status: "Draft",
    user: "James Wilson",
  },
  {
    id: "te-11",
    date: "2026-03-05",
    matter: "Patel - H-1B Extension",
    matterId: "m3",
    description: "Internal team meeting on case strategy",
    activityType: "case-strategy",
    durationMinutes: 30,
    rate: 350,
    billable: false,
    status: "Draft",
    user: "Sarah Chen",
  },
  {
    id: "te-12",
    date: "2026-03-04",
    matter: "Wei - H-1B Transfer",
    matterId: "m2",
    description: "Correspondence with USCIS re: case status inquiry",
    activityType: "uscis-inquiry",
    durationMinutes: 45,
    rate: 300,
    billable: true,
    status: "Billed",
    user: "Maria Lopez",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusBadgeClass(status: string) {
  switch (status) {
    case "Draft":
      return "bg-gray-100 text-gray-700";
    case "Approved":
      return "bg-green-100 text-green-700";
    case "Billed":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getActivityLabel(value: string) {
  return ACTIVITY_TYPES.find((a) => a.value === value)?.label ?? value;
}

function formatTimerDisplay(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TimeEntriesPage() {
  const [entries, setEntries] = useState<TimeEntry[]>(initialEntries);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ description: "", duration: "" });
  const [showNewDialog, setShowNewDialog] = useState(false);

  // Filters
  const [filterMatter, setFilterMatter] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterBillable, setFilterBillable] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerMatter, setTimerMatter] = useState("");
  const [timerDescription, setTimerDescription] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // New entry form
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split("T")[0],
    matterId: "",
    activityType: "",
    description: "",
    hours: "0",
    minutes: "0",
    rate: "350",
    billable: true,
  });

  // Timer logic
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  const handleStartTimer = () => {
    if (!timerMatter) return;
    setTimerRunning(true);
  };

  const handleStopTimer = () => {
    setTimerRunning(false);
    if (timerSeconds > 0 && timerMatter) {
      const matterObj = matters.find((m) => m.id === timerMatter);
      const durationMinutes = Math.max(1, Math.round(timerSeconds / 60));
      const newId = `te-${Date.now()}`;
      setEntries((prev) => [
        {
          id: newId,
          date: new Date().toISOString().split("T")[0],
          matter: matterObj?.name ?? "",
          matterId: timerMatter,
          description: timerDescription || "Timer entry",
          activityType: "other",
          durationMinutes,
          rate: 350,
          billable: true,
          status: "Draft",
          user: "Sarah Chen",
        },
        ...prev,
      ]);
    }
    setTimerSeconds(0);
    setTimerDescription("");
  };

  // Inline editing
  const startEditing = (entry: TimeEntry) => {
    setEditingId(entry.id);
    setEditValues({
      description: entry.description,
      duration: formatMinutesToHours(entry.durationMinutes),
    });
  };

  const saveEditing = () => {
    if (!editingId) return;
    const [h, m] = editValues.duration.split(":").map(Number);
    const durationMinutes = (h || 0) * 60 + (m || 0);
    setEntries((prev) =>
      prev.map((e) =>
        e.id === editingId
          ? { ...e, description: editValues.description, durationMinutes }
          : e
      )
    );
    setEditingId(null);
  };

  const cancelEditing = () => setEditingId(null);

  // Selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredEntries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEntries.map((e) => e.id)));
    }
  };

  // Bulk actions
  const bulkApprove = () => {
    setEntries((prev) =>
      prev.map((e) =>
        selectedIds.has(e.id) && e.status === "Draft"
          ? { ...e, status: "Approved" }
          : e
      )
    );
    setSelectedIds(new Set());
  };

  const bulkMarkBilled = () => {
    setEntries((prev) =>
      prev.map((e) =>
        selectedIds.has(e.id) && e.status === "Approved"
          ? { ...e, status: "Billed" }
          : e
      )
    );
    setSelectedIds(new Set());
  };

  // New entry
  const handleCreateEntry = () => {
    const matterObj = matters.find((m) => m.id === newEntry.matterId);
    if (!matterObj) return;
    const durationMinutes =
      (parseInt(newEntry.hours) || 0) * 60 + (parseInt(newEntry.minutes) || 0);
    const id = `te-${Date.now()}`;
    setEntries((prev) => [
      {
        id,
        date: newEntry.date,
        matter: matterObj.name,
        matterId: newEntry.matterId,
        description: newEntry.description,
        activityType: newEntry.activityType,
        durationMinutes,
        rate: parseFloat(newEntry.rate) || 350,
        billable: newEntry.billable,
        status: "Draft",
        user: "Sarah Chen",
      },
      ...prev,
    ]);
    setShowNewDialog(false);
    setNewEntry({
      date: new Date().toISOString().split("T")[0],
      matterId: "",
      activityType: "",
      description: "",
      hours: "0",
      minutes: "0",
      rate: "350",
      billable: true,
    });
  };

  // Filtering
  const filteredEntries = entries.filter((e) => {
    if (filterMatter && e.matterId !== filterMatter) return false;
    if (filterUser && e.user !== filterUser) return false;
    if (filterBillable === "billable" && !e.billable) return false;
    if (filterBillable === "non-billable" && e.billable) return false;
    if (filterStatus && e.status !== filterStatus) return false;
    if (filterDateFrom && e.date < filterDateFrom) return false;
    if (filterDateTo && e.date > filterDateTo) return false;
    return true;
  });

  // Summaries
  const todayStr = "2026-03-08";
  const dailyTotal = filteredEntries
    .filter((e) => e.date === todayStr)
    .reduce((sum, e) => sum + e.durationMinutes, 0);

  const weekStart = "2026-03-02";
  const weeklyTotal = filteredEntries
    .filter((e) => e.date >= weekStart && e.date <= todayStr)
    .reduce((sum, e) => sum + e.durationMinutes, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Time Entries</h1>
          <p className="text-sm text-slate-500">
            Track and manage billable time
          </p>
        </div>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Entry
        </Button>
      </div>

      {/* Timer Widget */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Timer</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="timer-matter">Matter</Label>
              <Select
                id="timer-matter"
                value={timerMatter}
                onChange={(e) => setTimerMatter(e.target.value)}
                disabled={timerRunning}
              >
                <option value="">Select matter...</option>
                {matters.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex-[2] min-w-[300px]">
              <Label htmlFor="timer-desc">Description</Label>
              <Input
                id="timer-desc"
                placeholder="What are you working on?"
                value={timerDescription}
                onChange={(e) => setTimerDescription(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-mono font-bold text-slate-900 tabular-nums min-w-[130px] text-center">
                {formatTimerDisplay(timerSeconds)}
              </div>
              {!timerRunning ? (
                <Button
                  onClick={handleStartTimer}
                  disabled={!timerMatter}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start
                </Button>
              ) : (
                <Button
                  onClick={handleStopTimer}
                  variant="destructive"
                >
                  <Square className="mr-2 h-4 w-4" />
                  Stop
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <Label className="text-xs">Date From</Label>
              <Input
                type="date"
                className="w-[150px]"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Date To</Label>
              <Input
                type="date"
                className="w-[150px]"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Matter</Label>
              <Select
                className="w-[200px]"
                value={filterMatter}
                onChange={(e) => setFilterMatter(e.target.value)}
              >
                <option value="">All Matters</option>
                {matters.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="text-xs">User</Label>
              <Select
                className="w-[160px]"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
              >
                <option value="">All Users</option>
                {users.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="text-xs">Billable</Label>
              <Select
                className="w-[150px]"
                value={filterBillable}
                onChange={(e) => setFilterBillable(e.target.value)}
              >
                <option value="">All</option>
                <option value="billable">Billable</option>
                <option value="non-billable">Non-Billable</option>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select
                className="w-[140px]"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All</option>
                <option value="Draft">Draft</option>
                <option value="Approved">Approved</option>
                <option value="Billed">Billed</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary + Bulk Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-sm">
          <span className="text-slate-600">
            Today: <strong>{formatMinutesToHours(dailyTotal)}</strong>
          </span>
          <span className="text-slate-600">
            This Week: <strong>{formatMinutesToHours(weeklyTotal)}</strong>
          </span>
          <span className="text-slate-500">
            {filteredEntries.length} entries shown
          </span>
        </div>
        {selectedIds.size > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={bulkApprove}>
              <CheckSquare className="mr-1 h-3 w-3" />
              Approve Selected ({selectedIds.size})
            </Button>
            <Button variant="outline" size="sm" onClick={bulkMarkBilled}>
              Mark as Billed ({selectedIds.size})
            </Button>
          </div>
        )}
      </div>

      {/* Time Entries Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300"
                    checked={
                      filteredEntries.length > 0 &&
                      selectedIds.size === filteredEntries.length
                    }
                    onChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Matter</TableHead>
                <TableHead className="min-w-[250px]">Description</TableHead>
                <TableHead>Activity Type</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Billable</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => {
                const isEditing = editingId === entry.id;
                const amount = (entry.durationMinutes / 60) * entry.rate;
                return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        className="rounded border-slate-300"
                        checked={selectedIds.has(entry.id)}
                        onChange={() => toggleSelect(entry.id)}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(entry.date)}
                    </TableCell>
                    <TableCell className="text-slate-700 font-medium whitespace-nowrap">
                      {entry.matter}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editValues.description}
                          onChange={(e) =>
                            setEditValues((v) => ({
                              ...v,
                              description: e.target.value,
                            }))
                          }
                          className="h-8 text-sm"
                        />
                      ) : (
                        <span className="text-sm text-slate-600">
                          {entry.description}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-slate-500 text-xs">
                      {getActivityLabel(entry.activityType)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {isEditing ? (
                        <Input
                          value={editValues.duration}
                          onChange={(e) =>
                            setEditValues((v) => ({
                              ...v,
                              duration: e.target.value,
                            }))
                          }
                          className="h-8 text-sm w-20 text-right"
                          placeholder="h:mm"
                        />
                      ) : (
                        formatMinutesToHours(entry.durationMinutes)
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(entry.rate)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300"
                        checked={entry.billable}
                        onChange={() =>
                          setEntries((prev) =>
                            prev.map((e) =>
                              e.id === entry.id
                                ? { ...e, billable: !e.billable }
                                : e
                            )
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          statusBadgeClass(entry.status)
                        )}
                      >
                        {entry.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex gap-1">
                          <button
                            onClick={saveEditing}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(entry)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Entry Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Time Entry</DialogTitle>
            <DialogDescription>
              Record a new time entry for a matter.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) =>
                    setNewEntry((v) => ({ ...v, date: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Matter</Label>
                <Select
                  value={newEntry.matterId}
                  onChange={(e) =>
                    setNewEntry((v) => ({ ...v, matterId: e.target.value }))
                  }
                >
                  <option value="">Select matter...</option>
                  {matters.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <Label>Activity Type</Label>
              <Select
                value={newEntry.activityType}
                onChange={(e) =>
                  setNewEntry((v) => ({ ...v, activityType: e.target.value }))
                }
              >
                <option value="">Select type...</option>
                {ACTIVITY_TYPES.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={newEntry.description}
                onChange={(e) =>
                  setNewEntry((v) => ({ ...v, description: e.target.value }))
                }
                placeholder="Describe the work performed..."
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Hours</Label>
                <Input
                  type="number"
                  min="0"
                  value={newEntry.hours}
                  onChange={(e) =>
                    setNewEntry((v) => ({ ...v, hours: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Minutes</Label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={newEntry.minutes}
                  onChange={(e) =>
                    setNewEntry((v) => ({ ...v, minutes: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Rate ($/hr)</Label>
                <Input
                  type="number"
                  min="0"
                  value={newEntry.rate}
                  onChange={(e) =>
                    setNewEntry((v) => ({ ...v, rate: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="new-billable"
                className="rounded border-slate-300"
                checked={newEntry.billable}
                onChange={(e) =>
                  setNewEntry((v) => ({ ...v, billable: e.target.checked }))
                }
              />
              <Label htmlFor="new-billable">Billable</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateEntry}
              disabled={!newEntry.matterId || !newEntry.description}
            >
              Create Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

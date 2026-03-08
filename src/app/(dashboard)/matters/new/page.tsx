"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IMMIGRATION_CASE_TYPES } from "@/lib/constants";
import { cn, generateMatterNumber } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FormState {
  title: string;
  description: string;
  type: string;
  immigrationCaseType: string;
  clientSearch: string;
  selectedClientId: string;
  selectedClientName: string;
  uscisReceiptNumber: string;
  priorityDate: string;
  immigrationCourt: string;
  billingType: string;
  billingRate: string;
  flatFeeAmount: string;
  contingencyPct: string;
  assignedAttorneys: string[];
  openDate: string;
  solDate: string;
}

// ---------------------------------------------------------------------------
// Demo existing contacts for search
// ---------------------------------------------------------------------------

const DEMO_CONTACTS = [
  { id: "c1", name: "Raj Patel", email: "raj.patel@email.com", type: "CLIENT" },
  {
    id: "c2",
    name: "Maria Rodriguez",
    email: "maria.rodriguez@email.com",
    type: "CLIENT",
  },
  {
    id: "c3",
    name: "Linh Nguyen",
    email: "linh.nguyen@email.com",
    type: "CLIENT",
  },
  {
    id: "c4",
    name: "Carlos Garcia",
    email: "carlos.garcia@email.com",
    type: "CLIENT",
  },
  {
    id: "c5",
    name: "Jin-Soo Kim",
    email: "jinsoo.kim@email.com",
    type: "CLIENT",
  },
  {
    id: "c6",
    name: "Ana Hernandez",
    email: "ana.hernandez@email.com",
    type: "CLIENT",
  },
];

const DEMO_ATTORNEYS = [
  { id: "u1", name: "Sarah Chen" },
  { id: "u2", name: "Michael Torres" },
  { id: "u3", name: "David Kim" },
];

const MATTER_TYPES = [
  { value: "IMMIGRATION", label: "Immigration" },
  { value: "CRIMINAL", label: "Criminal" },
  { value: "PERSONAL_INJURY", label: "Personal Injury" },
  { value: "GENERAL", label: "General" },
];

const BILLING_TYPES = [
  { value: "HOURLY", label: "Hourly" },
  { value: "FLAT_FEE", label: "Flat Fee" },
  { value: "CONTINGENCY", label: "Contingency" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "PRO_BONO", label: "Pro Bono" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function NewMatterPage() {
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    type: "IMMIGRATION",
    immigrationCaseType: "",
    clientSearch: "",
    selectedClientId: "",
    selectedClientName: "",
    uscisReceiptNumber: "",
    priorityDate: "",
    immigrationCourt: "",
    billingType: "HOURLY",
    billingRate: "350",
    flatFeeAmount: "",
    contingencyPct: "",
    assignedAttorneys: [],
    openDate: today,
    solDate: "",
  });

  const [showClientResults, setShowClientResults] = useState(false);
  const [conflictCheckResult, setConflictCheckResult] = useState<
    null | "clear" | "found"
  >(null);
  const [conflictChecking, setConflictChecking] = useState(false);
  const [saving, setSaving] = useState(false);

  // Auto-generated matter number preview
  const matterNumberPreview = generateMatterNumber("IMM", 42);

  const update = (field: keyof FormState, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Filter contacts based on search
  const filteredContacts = DEMO_CONTACTS.filter(
    (c) =>
      form.clientSearch.length >= 2 &&
      (c.name.toLowerCase().includes(form.clientSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(form.clientSearch.toLowerCase()))
  );

  const selectClient = (contact: (typeof DEMO_CONTACTS)[number]) => {
    setForm((prev) => ({
      ...prev,
      selectedClientId: contact.id,
      selectedClientName: contact.name,
      clientSearch: "",
    }));
    setShowClientResults(false);
    setConflictCheckResult(null);
  };

  const clearClient = () => {
    setForm((prev) => ({
      ...prev,
      selectedClientId: "",
      selectedClientName: "",
    }));
    setConflictCheckResult(null);
  };

  const runConflictCheck = () => {
    setConflictChecking(true);
    setConflictCheckResult(null);
    // Simulate async conflict check
    setTimeout(() => {
      setConflictChecking(false);
      setConflictCheckResult("clear");
    }, 1500);
  };

  const toggleAttorney = (id: string) => {
    setForm((prev) => {
      const current = prev.assignedAttorneys;
      if (current.includes(id)) {
        return {
          ...prev,
          assignedAttorneys: current.filter((a) => a !== id),
        };
      }
      return { ...prev, assignedAttorneys: [...current, id] };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    setTimeout(() => {
      setSaving(false);
      router.push("/matters");
    }, 1000);
  };

  const isImmigration = form.type === "IMMIGRATION";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push("/matters")}
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            &larr; Back to Matters
          </button>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            New Matter
          </h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Matter Number Preview</p>
          <p className="font-mono text-sm font-medium">{matterNumberPreview}</p>
        </div>
      </div>

      {/* Section: Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g. Patel - I-485 Adjustment of Status"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief case description..."
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="type">Matter Type *</Label>
              <Select
                id="type"
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
              >
                {MATTER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>

            {isImmigration && (
              <div className="space-y-1.5">
                <Label htmlFor="immigrationCaseType">
                  Immigration Case Type
                </Label>
                <Select
                  id="immigrationCaseType"
                  value={form.immigrationCaseType}
                  onChange={(e) => update("immigrationCaseType", e.target.value)}
                >
                  <option value="">Select type...</option>
                  {IMMIGRATION_CASE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section: Client Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Client</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.selectedClientId ? (
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <div>
                <p className="font-medium">{form.selectedClientName}</p>
                <p className="text-xs text-slate-500">
                  {DEMO_CONTACTS.find((c) => c.id === form.selectedClientId)
                    ?.email ?? ""}
                </p>
              </div>
              <div className="flex gap-2">
                {/* Conflict check */}
                {conflictCheckResult === null && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={runConflictCheck}
                    disabled={conflictChecking}
                  >
                    {conflictChecking
                      ? "Checking..."
                      : "Conflict Check"}
                  </Button>
                )}
                {conflictCheckResult === "clear" && (
                  <Badge className="bg-green-100 text-green-800 border-0">
                    No Conflicts Found
                  </Badge>
                )}
                {conflictCheckResult === "found" && (
                  <Badge className="bg-red-100 text-red-800 border-0">
                    Potential Conflict
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearClient}>
                  Change
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <Label htmlFor="clientSearch">Search Existing Contacts</Label>
              <Input
                id="clientSearch"
                placeholder="Type at least 2 characters to search..."
                value={form.clientSearch}
                onChange={(e) => {
                  update("clientSearch", e.target.value);
                  setShowClientResults(true);
                }}
                onFocus={() => setShowClientResults(true)}
              />
              {showClientResults && filteredContacts.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                  {filteredContacts.map((contact) => (
                    <button
                      key={contact.id}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 text-sm"
                      onClick={() => selectClient(contact)}
                    >
                      <span className="font-medium">{contact.name}</span>
                      <span className="ml-2 text-slate-400">
                        {contact.email}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {showClientResults &&
                form.clientSearch.length >= 2 &&
                filteredContacts.length === 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg p-3 text-center">
                    <p className="text-sm text-slate-500">No contacts found</p>
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-1"
                      onClick={() => {
                        setShowClientResults(false);
                        // In production, open a quick-add dialog
                      }}
                    >
                      + Quick Add New Contact
                    </Button>
                  </div>
                )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section: Immigration Details (conditional) */}
      {isImmigration && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Immigration Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="uscisReceiptNumber">USCIS Receipt Number</Label>
                <Input
                  id="uscisReceiptNumber"
                  placeholder="e.g. IOE9202345678"
                  value={form.uscisReceiptNumber}
                  onChange={(e) =>
                    update("uscisReceiptNumber", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="priorityDate">Priority Date</Label>
                <Input
                  id="priorityDate"
                  type="date"
                  value={form.priorityDate}
                  onChange={(e) => update("priorityDate", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="immigrationCourt">Immigration Court</Label>
              <Input
                id="immigrationCourt"
                placeholder="e.g. Newark Immigration Court"
                value={form.immigrationCourt}
                onChange={(e) => update("immigrationCourt", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section: Billing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Billing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="billingType">Billing Type *</Label>
              <Select
                id="billingType"
                value={form.billingType}
                onChange={(e) => update("billingType", e.target.value)}
              >
                {BILLING_TYPES.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </Select>
            </div>

            {form.billingType === "HOURLY" && (
              <div className="space-y-1.5">
                <Label htmlFor="billingRate">Hourly Rate ($)</Label>
                <Input
                  id="billingRate"
                  type="number"
                  placeholder="350"
                  value={form.billingRate}
                  onChange={(e) => update("billingRate", e.target.value)}
                />
              </div>
            )}

            {form.billingType === "FLAT_FEE" && (
              <div className="space-y-1.5">
                <Label htmlFor="flatFeeAmount">Flat Fee Amount ($)</Label>
                <Input
                  id="flatFeeAmount"
                  type="number"
                  placeholder="5000"
                  value={form.flatFeeAmount}
                  onChange={(e) => update("flatFeeAmount", e.target.value)}
                />
              </div>
            )}

            {form.billingType === "CONTINGENCY" && (
              <div className="space-y-1.5">
                <Label htmlFor="contingencyPct">Contingency %</Label>
                <Input
                  id="contingencyPct"
                  type="number"
                  placeholder="33"
                  value={form.contingencyPct}
                  onChange={(e) => update("contingencyPct", e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Assign attorneys */}
          <div className="space-y-2">
            <Label>Assigned Attorneys</Label>
            <div className="flex flex-wrap gap-2">
              {DEMO_ATTORNEYS.map((atty) => {
                const selected = form.assignedAttorneys.includes(atty.id);
                return (
                  <button
                    key={atty.id}
                    type="button"
                    onClick={() => toggleAttorney(atty.id)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-sm transition-colors",
                      selected
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    {atty.name}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section: Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="openDate">Open Date *</Label>
              <Input
                id="openDate"
                type="date"
                value={form.openDate}
                onChange={(e) => update("openDate", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="solDate">
                Statute of Limitations Date
              </Label>
              <Input
                id="solDate"
                type="date"
                value={form.solDate}
                onChange={(e) => update("solDate", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3 pb-8">
        <Button
          variant="outline"
          onClick={() => router.push("/matters")}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving || !form.title}>
          {saving ? "Saving..." : "Create Matter"}
        </Button>
      </div>
    </div>
  );
}

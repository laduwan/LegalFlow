"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Building2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn, formatCurrency, formatDate } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ClientLedger {
  id: string;
  clientName: string;
  matter: string;
  balance: number;
  transactions: LedgerTransaction[];
}

interface LedgerTransaction {
  id: string;
  date: string;
  type: string;
  description: string;
  amount: number;
  reference: string;
}

interface TrustTransaction {
  id: string;
  date: string;
  type: "Deposit" | "Disbursement to Client" | "Disbursement to Firm" | "Third Party";
  clientName: string;
  matter: string;
  description: string;
  amount: number;
  runningBalance: number;
  reference: string;
  approvedBy: string;
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const accountInfo = {
  id: "trust-1",
  name: "IOLTA Trust Account",
  bank: "First National Bank",
  accountNumber: "****7842",
  state: "Florida",
  totalBalance: 328750.0,
  lastReconciled: "2026-02-28",
};

const clientLedgers: ClientLedger[] = [
  {
    id: "cl-1",
    clientName: "Maria Rodriguez",
    matter: "Rodriguez - AOS",
    balance: 85000.0,
    transactions: [
      { id: "lt-1", date: "2026-03-06", type: "Disbursement to Firm", description: "Invoice INV-2026-001 payment", amount: -4500, reference: "DIS-20260306-001" },
      { id: "lt-2", date: "2026-03-04", type: "Third Party", description: "USCIS I-485 filing fee", amount: -1225, reference: "TP-20260304-001" },
      { id: "lt-3", date: "2026-02-28", type: "Deposit", description: "Additional retainer", amount: 10000, reference: "DEP-20260228-001" },
      { id: "lt-4", date: "2026-02-15", type: "Deposit", description: "Initial retainer deposit", amount: 80725, reference: "DEP-20260215-001" },
    ],
  },
  {
    id: "cl-2",
    clientName: "Amir Patel",
    matter: "Patel - H-1B Extension",
    balance: 45250.0,
    transactions: [
      { id: "lt-5", date: "2026-03-07", type: "Deposit", description: "Retainer deposit for H-1B extension", amount: 5000, reference: "DEP-20260307-001" },
      { id: "lt-6", date: "2026-03-02", type: "Disbursement to Firm", description: "Invoice partial payment", amount: -1900, reference: "DIS-20260302-001" },
      { id: "lt-7", date: "2026-02-25", type: "Deposit", description: "Initial retainer deposit", amount: 42150, reference: "DEP-20260225-001" },
    ],
  },
  {
    id: "cl-3",
    clientName: "Fatima Al-Rashid",
    matter: "Al-Rashid - EB-5",
    balance: 150000.0,
    transactions: [
      { id: "lt-8", date: "2026-03-04", type: "Deposit", description: "EB-5 retainer deposit", amount: 50000, reference: "DEP-20260304-001" },
      { id: "lt-9", date: "2026-02-24", type: "Disbursement to Firm", description: "Invoice payment", amount: -3500, reference: "DIS-20260224-001" },
      { id: "lt-10", date: "2026-02-10", type: "Deposit", description: "Initial retainer", amount: 103500, reference: "DEP-20260210-001" },
    ],
  },
  {
    id: "cl-4",
    clientName: "Carlos Garcia",
    matter: "Garcia - Asylum",
    balance: 12500.0,
    transactions: [
      { id: "lt-11", date: "2026-03-05", type: "Deposit", description: "Additional retainer for hearing prep", amount: 2500, reference: "DEP-20260305-001" },
      { id: "lt-12", date: "2026-03-01", type: "Disbursement to Client", description: "Refund of unused retainer", amount: -500, reference: "REF-20260301-001" },
      { id: "lt-13", date: "2026-02-20", type: "Deposit", description: "Initial retainer deposit", amount: 10500, reference: "DEP-20260220-001" },
    ],
  },
  {
    id: "cl-5",
    clientName: "Olga Petrov",
    matter: "Petrov - L-1 Visa",
    balance: 36000.0,
    transactions: [
      { id: "lt-14", date: "2026-03-03", type: "Deposit", description: "Initial retainer deposit", amount: 15000, reference: "DEP-20260303-001" },
      { id: "lt-15", date: "2026-02-27", type: "Third Party", description: "Translation service payment", amount: -850, reference: "TP-20260227-001" },
      { id: "lt-16", date: "2026-02-20", type: "Deposit", description: "Retainer deposit", amount: 21850, reference: "DEP-20260220-002" },
    ],
  },
];

const allTransactions: TrustTransaction[] = [
  { id: "tt-1", date: "2026-03-07", type: "Deposit", clientName: "Amir Patel", matter: "Patel - H-1B Extension", description: "Retainer deposit for H-1B extension", amount: 5000, runningBalance: 328750, reference: "DEP-20260307-001", approvedBy: "Sarah Chen" },
  { id: "tt-2", date: "2026-03-06", type: "Disbursement to Firm", clientName: "Maria Rodriguez", matter: "Rodriguez - AOS", description: "Invoice INV-2026-001 payment from trust", amount: -4500, runningBalance: 323750, reference: "DIS-20260306-001", approvedBy: "Sarah Chen" },
  { id: "tt-3", date: "2026-03-05", type: "Deposit", clientName: "Carlos Garcia", matter: "Garcia - Asylum", description: "Additional retainer for asylum hearing preparation", amount: 2500, runningBalance: 328250, reference: "DEP-20260305-001", approvedBy: "James Wilson" },
  { id: "tt-4", date: "2026-03-04", type: "Deposit", clientName: "Fatima Al-Rashid", matter: "Al-Rashid - EB-5", description: "EB-5 retainer deposit", amount: 50000, runningBalance: 325750, reference: "DEP-20260304-001", approvedBy: "Sarah Chen" },
  { id: "tt-5", date: "2026-03-04", type: "Third Party", clientName: "Maria Rodriguez", matter: "Rodriguez - AOS", description: "USCIS I-485 filing fee", amount: -1225, runningBalance: 275750, reference: "TP-20260304-001", approvedBy: "Sarah Chen" },
  { id: "tt-6", date: "2026-03-03", type: "Deposit", clientName: "Olga Petrov", matter: "Petrov - L-1 Visa", description: "Initial retainer deposit", amount: 15000, runningBalance: 276975, reference: "DEP-20260303-001", approvedBy: "Maria Lopez" },
  { id: "tt-7", date: "2026-03-02", type: "Disbursement to Firm", clientName: "Amir Patel", matter: "Patel - H-1B Extension", description: "Invoice partial payment", amount: -1900, runningBalance: 261975, reference: "DIS-20260302-001", approvedBy: "Sarah Chen" },
  { id: "tt-8", date: "2026-03-01", type: "Disbursement to Client", clientName: "Carlos Garcia", matter: "Garcia - Asylum", description: "Refund of unused retainer", amount: -500, runningBalance: 263875, reference: "REF-20260301-001", approvedBy: "James Wilson" },
  { id: "tt-9", date: "2026-02-28", type: "Deposit", clientName: "Maria Rodriguez", matter: "Rodriguez - AOS", description: "Additional retainer for AOS case", amount: 10000, runningBalance: 264375, reference: "DEP-20260228-001", approvedBy: "Sarah Chen" },
  { id: "tt-10", date: "2026-02-27", type: "Third Party", clientName: "Olga Petrov", matter: "Petrov - L-1 Visa", description: "Translation service payment", amount: -850, runningBalance: 254375, reference: "TP-20260227-001", approvedBy: "Maria Lopez" },
  { id: "tt-11", date: "2026-02-25", type: "Deposit", clientName: "Amir Patel", matter: "Patel - H-1B Extension", description: "Initial retainer deposit", amount: 42150, runningBalance: 255225, reference: "DEP-20260225-001", approvedBy: "Sarah Chen" },
  { id: "tt-12", date: "2026-02-24", type: "Disbursement to Firm", clientName: "Fatima Al-Rashid", matter: "Al-Rashid - EB-5", description: "Invoice for initial consultation", amount: -3500, runningBalance: 213075, reference: "DIS-20260224-001", approvedBy: "Sarah Chen" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function transactionTypeBadge(type: string) {
  switch (type) {
    case "Deposit":
      return "bg-green-100 text-green-700";
    case "Disbursement to Client":
      return "bg-blue-100 text-blue-700";
    case "Disbursement to Firm":
      return "bg-purple-100 text-purple-700";
    case "Third Party":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TrustAccountDetailPage() {
  const [bankStatementBalance, setBankStatementBalance] = useState("");
  const [isReconciled, setIsReconciled] = useState(false);
  const [expandedLedger, setExpandedLedger] = useState<string | null>(null);

  // Filters for transaction log
  const [filterType, setFilterType] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Reconciliation values
  const bookBalance = accountInfo.totalBalance;
  const sumClientLedgers = clientLedgers.reduce((sum, l) => sum + l.balance, 0);
  const bankBalance = bankStatementBalance ? parseFloat(bankStatementBalance) : null;

  const bookVsLedgerDiff = bookBalance - sumClientLedgers;
  const bankVsBookDiff = bankBalance !== null ? bankBalance - bookBalance : null;
  const allBalanced =
    bankBalance !== null &&
    bankVsBookDiff !== null &&
    Math.abs(bookVsLedgerDiff) < 0.01 &&
    Math.abs(bankVsBookDiff) < 0.01;

  const handleMarkReconciled = () => {
    if (allBalanced) {
      setIsReconciled(true);
    }
  };

  // Filter transactions
  const filteredTransactions = allTransactions.filter((txn) => {
    if (filterType && txn.type !== filterType) return false;
    if (filterClient && txn.clientName !== filterClient) return false;
    if (filterDateFrom && txn.date < filterDateFrom) return false;
    if (filterDateTo && txn.date > filterDateTo) return false;
    return true;
  });

  const uniqueClients = Array.from(
    new Set(allTransactions.map((t) => t.clientName))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/trust"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Trust Accounting
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            {accountInfo.name}
          </h1>
          <p className="text-sm text-slate-500">
            <Building2 className="inline-block h-4 w-4 mr-1" />
            {accountInfo.bank} &middot; {accountInfo.accountNumber} &middot;{" "}
            {accountInfo.state}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Account Balance</p>
          <p className="text-2xl font-bold text-green-700">
            {formatCurrency(accountInfo.totalBalance)}
          </p>
        </div>
      </div>

      {/* Reconciliation Success Banner */}
      {isReconciled && (
        <div className="rounded-lg border border-green-300 bg-green-50 p-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-green-800">
              Account Reconciled Successfully
            </h3>
            <p className="text-sm text-green-700 mt-1">
              Three-way reconciliation completed. All balances match.
            </p>
          </div>
        </div>
      )}

      {/* Three-Way Reconciliation Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Three-Way Reconciliation</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Bank Statement Balance */}
            <div className="rounded-lg border-2 border-slate-200 p-5">
              <p className="text-sm font-medium text-slate-500 mb-2">
                1. Bank Statement Balance
              </p>
              <Input
                type="number"
                step="0.01"
                placeholder="Enter bank statement balance..."
                value={bankStatementBalance}
                onChange={(e) => {
                  setBankStatementBalance(e.target.value);
                  setIsReconciled(false);
                }}
                className="text-lg font-semibold"
              />
              {bankBalance !== null && (
                <p className="text-sm text-slate-600 mt-2">
                  {formatCurrency(bankBalance)}
                </p>
              )}
            </div>

            {/* Book/Ledger Balance */}
            <div className="rounded-lg border-2 border-slate-200 p-5">
              <p className="text-sm font-medium text-slate-500 mb-2">
                2. Book / Ledger Balance
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(bookBalance)}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Calculated from account records
              </p>
            </div>

            {/* Sum of Client Ledgers */}
            <div className="rounded-lg border-2 border-slate-200 p-5">
              <p className="text-sm font-medium text-slate-500 mb-2">
                3. Sum of Client Ledgers
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(sumClientLedgers)}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                {clientLedgers.length} individual client ledgers
              </p>
            </div>
          </div>

          {/* Discrepancy Indicators */}
          <div className="mt-6 space-y-3">
            <div
              className={cn(
                "rounded-lg border p-3 flex items-center justify-between",
                Math.abs(bookVsLedgerDiff) < 0.01
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              )}
            >
              <span className="text-sm font-medium">
                Book Balance vs Client Ledgers
              </span>
              <span
                className={cn(
                  "text-sm font-semibold flex items-center gap-1",
                  Math.abs(bookVsLedgerDiff) < 0.01
                    ? "text-green-700"
                    : "text-red-700"
                )}
              >
                {Math.abs(bookVsLedgerDiff) < 0.01 ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Balanced
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4" /> Discrepancy:{" "}
                    {formatCurrency(Math.abs(bookVsLedgerDiff))}
                  </>
                )}
              </span>
            </div>

            {bankBalance !== null && (
              <div
                className={cn(
                  "rounded-lg border p-3 flex items-center justify-between",
                  bankVsBookDiff !== null && Math.abs(bankVsBookDiff) < 0.01
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                )}
              >
                <span className="text-sm font-medium">
                  Bank Statement vs Book Balance
                </span>
                <span
                  className={cn(
                    "text-sm font-semibold flex items-center gap-1",
                    bankVsBookDiff !== null && Math.abs(bankVsBookDiff) < 0.01
                      ? "text-green-700"
                      : "text-red-700"
                  )}
                >
                  {bankVsBookDiff !== null &&
                  Math.abs(bankVsBookDiff) < 0.01 ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Balanced
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4" /> Discrepancy:{" "}
                      {bankVsBookDiff !== null
                        ? formatCurrency(Math.abs(bankVsBookDiff))
                        : "--"}
                    </>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Mark Reconciled Button */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleMarkReconciled}
              disabled={!allBalanced || isReconciled}
              className={cn(
                allBalanced && !isReconciled
                  ? "bg-green-600 hover:bg-green-700"
                  : ""
              )}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {isReconciled ? "Reconciled" : "Mark Reconciled"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Client Ledger Detail */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Client Ledger Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {clientLedgers.map((ledger) => {
              const isExpanded = expandedLedger === ledger.id;
              return (
                <div key={ledger.id} className="border border-slate-200 rounded-lg">
                  <button
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                    onClick={() =>
                      setExpandedLedger(isExpanded ? null : ledger.id)
                    }
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {ledger.clientName}
                        </p>
                        <p className="text-xs text-slate-500">{ledger.matter}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        ledger.balance < 0 ? "text-red-600" : "text-slate-900"
                      )}
                    >
                      {formatCurrency(ledger.balance)}
                      {ledger.balance < 0 && (
                        <AlertTriangle className="inline-block ml-1 h-4 w-4 text-red-500" />
                      )}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-200 p-4 bg-slate-50">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500">
                            <th className="text-left py-2 font-medium">Date</th>
                            <th className="text-left py-2 font-medium">Type</th>
                            <th className="text-left py-2 font-medium">
                              Description
                            </th>
                            <th className="text-right py-2 font-medium">
                              Amount
                            </th>
                            <th className="text-left py-2 font-medium">
                              Reference
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {ledger.transactions.map((txn) => (
                            <tr
                              key={txn.id}
                              className="border-b border-slate-100 last:border-0"
                            >
                              <td className="py-2">{formatDate(txn.date)}</td>
                              <td className="py-2">
                                <span
                                  className={cn(
                                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                                    transactionTypeBadge(txn.type)
                                  )}
                                >
                                  {txn.type}
                                </span>
                              </td>
                              <td className="py-2 text-slate-600">
                                {txn.description}
                              </td>
                              <td
                                className={cn(
                                  "py-2 text-right font-medium",
                                  txn.amount >= 0
                                    ? "text-green-700"
                                    : "text-red-700"
                                )}
                              >
                                {txn.amount >= 0 ? "+" : ""}
                                {formatCurrency(Math.abs(txn.amount))}
                              </td>
                              <td className="py-2 font-mono text-xs text-slate-500">
                                {txn.reference}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Full Transaction Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Full Transaction Log</CardTitle>
            <span className="text-sm text-slate-500">
              {filteredTransactions.length} transactions
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap items-end gap-3 mb-4">
            <div>
              <Label className="text-xs">Type</Label>
              <Select
                className="w-[200px]"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Deposit">Deposit</option>
                <option value="Disbursement to Client">
                  Disbursement to Client
                </option>
                <option value="Disbursement to Firm">
                  Disbursement to Firm
                </option>
                <option value="Third Party">Third Party</option>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Client</Label>
              <Select
                className="w-[180px]"
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
              >
                <option value="">All Clients</option>
                {uniqueClients.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
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
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Client / Matter</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Running Balance</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Approved By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(txn.date)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
                        transactionTypeBadge(txn.type)
                      )}
                    >
                      {txn.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{txn.clientName}</div>
                    <div className="text-xs text-slate-500">{txn.matter}</div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 max-w-[250px]">
                    {txn.description}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-semibold whitespace-nowrap",
                      txn.amount >= 0 ? "text-green-700" : "text-red-700"
                    )}
                  >
                    {txn.amount >= 0 ? "+" : ""}
                    {formatCurrency(Math.abs(txn.amount))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(txn.runningBalance)}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 font-mono">
                    {txn.reference}
                  </TableCell>
                  <TableCell className="text-sm">{txn.approvedBy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

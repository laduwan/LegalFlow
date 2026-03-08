"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  AlertTriangle,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Building2,
  Users,
  Calendar,
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
import { cn, formatCurrency, formatDate } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ClientLedger {
  id: string;
  clientName: string;
  matter: string;
  balance: number;
  lastTransactionDate: string;
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

interface TrustAccount {
  id: string;
  name: string;
  bank: string;
  accountNumber: string;
  state: string;
  totalBalance: number;
  clientLedgerCount: number;
  lastReconciled: string;
  hasDiscrepancy: boolean;
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const trustAccount: TrustAccount = {
  id: "trust-1",
  name: "IOLTA Trust Account",
  bank: "First National Bank",
  accountNumber: "****7842",
  state: "Florida",
  totalBalance: 328750.0,
  clientLedgerCount: 5,
  lastReconciled: "2026-02-28",
  hasDiscrepancy: true,
};

const clientLedgers: ClientLedger[] = [
  {
    id: "cl-1",
    clientName: "Maria Rodriguez",
    matter: "Rodriguez - AOS",
    balance: 85000.0,
    lastTransactionDate: "2026-03-06",
  },
  {
    id: "cl-2",
    clientName: "Amir Patel",
    matter: "Patel - H-1B Extension",
    balance: 45250.0,
    lastTransactionDate: "2026-03-07",
  },
  {
    id: "cl-3",
    clientName: "Fatima Al-Rashid",
    matter: "Al-Rashid - EB-5",
    balance: 150000.0,
    lastTransactionDate: "2026-03-04",
  },
  {
    id: "cl-4",
    clientName: "Carlos Garcia",
    matter: "Garcia - Asylum",
    balance: 12500.0,
    lastTransactionDate: "2026-03-05",
  },
  {
    id: "cl-5",
    clientName: "Olga Petrov",
    matter: "Petrov - L-1 Visa",
    balance: 36000.0,
    lastTransactionDate: "2026-03-03",
  },
];

const initialTransactions: TrustTransaction[] = [
  {
    id: "tt-1",
    date: "2026-03-07",
    type: "Deposit",
    clientName: "Amir Patel",
    matter: "Patel - H-1B Extension",
    description: "Retainer deposit for H-1B extension",
    amount: 5000.0,
    runningBalance: 328750.0,
    reference: "DEP-20260307-001",
    approvedBy: "Sarah Chen",
  },
  {
    id: "tt-2",
    date: "2026-03-06",
    type: "Disbursement to Firm",
    clientName: "Maria Rodriguez",
    matter: "Rodriguez - AOS",
    description: "Invoice INV-2026-001 payment from trust",
    amount: -4500.0,
    runningBalance: 323750.0,
    reference: "DIS-20260306-001",
    approvedBy: "Sarah Chen",
  },
  {
    id: "tt-3",
    date: "2026-03-05",
    type: "Deposit",
    clientName: "Carlos Garcia",
    matter: "Garcia - Asylum",
    description: "Additional retainer for asylum hearing preparation",
    amount: 2500.0,
    runningBalance: 328250.0,
    reference: "DEP-20260305-001",
    approvedBy: "James Wilson",
  },
  {
    id: "tt-4",
    date: "2026-03-04",
    type: "Deposit",
    clientName: "Fatima Al-Rashid",
    matter: "Al-Rashid - EB-5",
    description: "EB-5 retainer deposit",
    amount: 50000.0,
    runningBalance: 325750.0,
    reference: "DEP-20260304-001",
    approvedBy: "Sarah Chen",
  },
  {
    id: "tt-5",
    date: "2026-03-04",
    type: "Third Party",
    clientName: "Maria Rodriguez",
    matter: "Rodriguez - AOS",
    description: "Payment to USCIS for I-485 filing fee",
    amount: -1225.0,
    runningBalance: 275750.0,
    reference: "TP-20260304-001",
    approvedBy: "Sarah Chen",
  },
  {
    id: "tt-6",
    date: "2026-03-03",
    type: "Deposit",
    clientName: "Olga Petrov",
    matter: "Petrov - L-1 Visa",
    description: "Initial retainer deposit",
    amount: 15000.0,
    runningBalance: 276975.0,
    reference: "DEP-20260303-001",
    approvedBy: "Maria Lopez",
  },
  {
    id: "tt-7",
    date: "2026-03-02",
    type: "Disbursement to Firm",
    clientName: "Amir Patel",
    matter: "Patel - H-1B Extension",
    description: "Invoice INV-2026-003 partial payment from trust",
    amount: -1900.0,
    runningBalance: 261975.0,
    reference: "DIS-20260302-001",
    approvedBy: "Sarah Chen",
  },
  {
    id: "tt-8",
    date: "2026-03-01",
    type: "Disbursement to Client",
    clientName: "Carlos Garcia",
    matter: "Garcia - Asylum",
    description: "Refund of unused retainer balance",
    amount: -500.0,
    runningBalance: 263875.0,
    reference: "REF-20260301-001",
    approvedBy: "James Wilson",
  },
  {
    id: "tt-9",
    date: "2026-02-28",
    type: "Deposit",
    clientName: "Maria Rodriguez",
    matter: "Rodriguez - AOS",
    description: "Additional retainer for AOS case",
    amount: 10000.0,
    runningBalance: 264375.0,
    reference: "DEP-20260228-001",
    approvedBy: "Sarah Chen",
  },
  {
    id: "tt-10",
    date: "2026-02-27",
    type: "Third Party",
    clientName: "Olga Petrov",
    matter: "Petrov - L-1 Visa",
    description: "Payment to translation service",
    amount: -850.0,
    runningBalance: 254375.0,
    reference: "TP-20260227-001",
    approvedBy: "Maria Lopez",
  },
  {
    id: "tt-11",
    date: "2026-02-25",
    type: "Deposit",
    clientName: "Amir Patel",
    matter: "Patel - H-1B Extension",
    description: "Initial retainer deposit",
    amount: 10000.0,
    runningBalance: 255225.0,
    reference: "DEP-20260225-001",
    approvedBy: "Sarah Chen",
  },
  {
    id: "tt-12",
    date: "2026-02-24",
    type: "Disbursement to Firm",
    clientName: "Fatima Al-Rashid",
    matter: "Al-Rashid - EB-5",
    description: "Invoice payment for initial consultation",
    amount: -3500.0,
    runningBalance: 245225.0,
    reference: "DIS-20260224-001",
    approvedBy: "Sarah Chen",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function transactionTypeBadge(type: TrustTransaction["type"]) {
  switch (type) {
    case "Deposit":
      return "bg-green-100 text-green-700";
    case "Disbursement to Client":
      return "bg-blue-100 text-blue-700";
    case "Disbursement to Firm":
      return "bg-purple-100 text-purple-700";
    case "Third Party":
      return "bg-orange-100 text-orange-700";
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TrustAccountingPage() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [ledgers, setLedgers] = useState(clientLedgers);
  const [account, setAccount] = useState(trustAccount);
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showDisbursementDialog, setShowDisbursementDialog] = useState(false);

  // Deposit form
  const [depositForm, setDepositForm] = useState({
    clientLedgerId: "",
    amount: "",
    description: "",
  });

  // Disbursement form
  const [disbursementForm, setDisbursementForm] = useState({
    clientLedgerId: "",
    type: "Disbursement to Firm" as TrustTransaction["type"],
    amount: "",
    description: "",
  });

  // Negative balance warnings
  const negativeLedgers = ledgers.filter((l) => l.balance < 0);

  // Sum of client ledgers for reconciliation check
  const sumClientLedgers = ledgers.reduce((sum, l) => sum + l.balance, 0);
  const discrepancy = account.totalBalance - sumClientLedgers;

  const handleDeposit = () => {
    const ledger = ledgers.find((l) => l.id === depositForm.clientLedgerId);
    if (!ledger || !depositForm.amount) return;
    const amount = parseFloat(depositForm.amount);
    if (amount <= 0) return;

    const today = new Date().toISOString().split("T")[0];
    const newTxn: TrustTransaction = {
      id: `tt-${Date.now()}`,
      date: today,
      type: "Deposit",
      clientName: ledger.clientName,
      matter: ledger.matter,
      description: depositForm.description || "Trust deposit",
      amount,
      runningBalance: account.totalBalance + amount,
      reference: `DEP-${today.replace(/-/g, "")}-${Date.now().toString().slice(-3)}`,
      approvedBy: "Sarah Chen",
    };

    setTransactions((prev) => [newTxn, ...prev]);
    setLedgers((prev) =>
      prev.map((l) =>
        l.id === depositForm.clientLedgerId
          ? { ...l, balance: l.balance + amount, lastTransactionDate: today }
          : l
      )
    );
    setAccount((prev) => ({
      ...prev,
      totalBalance: prev.totalBalance + amount,
    }));
    setShowDepositDialog(false);
    setDepositForm({ clientLedgerId: "", amount: "", description: "" });
  };

  const handleDisbursement = () => {
    const ledger = ledgers.find((l) => l.id === disbursementForm.clientLedgerId);
    if (!ledger || !disbursementForm.amount) return;
    const amount = parseFloat(disbursementForm.amount);
    if (amount <= 0) return;

    // CRITICAL: Check for negative balance
    if (ledger.balance - amount < 0) {
      alert(
        `Cannot process disbursement: This would create a negative balance of ${formatCurrency(
          ledger.balance - amount
        )} on ${ledger.clientName}'s ledger. Current balance: ${formatCurrency(
          ledger.balance
        )}`
      );
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const newTxn: TrustTransaction = {
      id: `tt-${Date.now()}`,
      date: today,
      type: disbursementForm.type,
      clientName: ledger.clientName,
      matter: ledger.matter,
      description: disbursementForm.description || "Trust disbursement",
      amount: -amount,
      runningBalance: account.totalBalance - amount,
      reference: `DIS-${today.replace(/-/g, "")}-${Date.now().toString().slice(-3)}`,
      approvedBy: "Sarah Chen",
    };

    setTransactions((prev) => [newTxn, ...prev]);
    setLedgers((prev) =>
      prev.map((l) =>
        l.id === disbursementForm.clientLedgerId
          ? { ...l, balance: l.balance - amount, lastTransactionDate: today }
          : l
      )
    );
    setAccount((prev) => ({
      ...prev,
      totalBalance: prev.totalBalance - amount,
    }));
    setShowDisbursementDialog(false);
    setDisbursementForm({
      clientLedgerId: "",
      type: "Disbursement to Firm",
      amount: "",
      description: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Trust Accounting
          </h1>
          <p className="text-sm text-slate-500">
            IOLTA trust account management and reconciliation
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowDepositDialog(true)}
          >
            <ArrowDownLeft className="mr-2 h-4 w-4" />
            New Deposit
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDisbursementDialog(true)}
          >
            <ArrowUpRight className="mr-2 h-4 w-4" />
            New Disbursement
          </Button>
          <Link href={`/trust/${account.id}`}>
            <Button>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reconcile
            </Button>
          </Link>
        </div>
      </div>

      {/* Reconciliation Discrepancy Alert */}
      {(account.hasDiscrepancy || Math.abs(discrepancy) > 0.01) && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-800">
              Reconciliation Discrepancy Detected
            </h3>
            <p className="text-sm text-red-700 mt-1">
              There is a {formatCurrency(Math.abs(discrepancy))} discrepancy
              between the trust account balance and the sum of client ledgers.
              Last reconciled: {formatDate(account.lastReconciled)}. Please
              reconcile immediately.
            </p>
          </div>
        </div>
      )}

      {/* Negative Balance Warnings */}
      {negativeLedgers.length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-amber-800">
              Warning: Negative Client Ledger Balance
            </h3>
            <ul className="text-sm text-amber-700 mt-1 list-disc list-inside">
              {negativeLedgers.map((l) => (
                <li key={l.id}>
                  {l.clientName} ({l.matter}): {formatCurrency(l.balance)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Trust Account Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Trust Account Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500 font-medium">Account Name</p>
              <p className="text-sm font-semibold mt-1">{account.name}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Building2 className="h-3 w-3" /> Bank
              </p>
              <p className="text-sm font-semibold mt-1">
                {account.bank} ({account.accountNumber})
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500 font-medium">Total Balance</p>
              <p className="text-xl font-bold mt-1 text-green-700">
                {formatCurrency(account.totalBalance)}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Users className="h-3 w-3" /> Client Ledgers
              </p>
              <p className="text-sm font-semibold mt-1">
                {account.clientLedgerCount}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Last Reconciled
              </p>
              <p className="text-sm font-semibold mt-1">
                {formatDate(account.lastReconciled)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Ledger Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Client Ledgers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Matter</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Last Transaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledgers.map((ledger) => (
                <TableRow key={ledger.id}>
                  <TableCell className="font-medium">
                    {ledger.clientName}
                    {ledger.balance < 0 && (
                      <AlertTriangle className="inline-block ml-2 h-4 w-4 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {ledger.matter}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-semibold",
                      ledger.balance < 0 ? "text-red-600" : "text-slate-900"
                    )}
                  >
                    {formatCurrency(ledger.balance)}
                  </TableCell>
                  <TableCell>{formatDate(ledger.lastTransactionDate)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold border-t-2 border-slate-300">
                <TableCell colSpan={2} className="text-right">
                  Total Client Ledgers:
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(sumClientLedgers)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Client / Matter</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Running Balance</TableHead>
                <TableHead>Reference #</TableHead>
                <TableHead>Approved By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((txn) => (
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

      {/* Deposit Dialog */}
      <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Trust Deposit</DialogTitle>
            <DialogDescription>
              Record a deposit into a client trust ledger.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Client Ledger</Label>
              <Select
                value={depositForm.clientLedgerId}
                onChange={(e) =>
                  setDepositForm((v) => ({
                    ...v,
                    clientLedgerId: e.target.value,
                  }))
                }
              >
                <option value="">Select client...</option>
                {ledgers.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.clientName} - {l.matter} ({formatCurrency(l.balance)})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={depositForm.amount}
                onChange={(e) =>
                  setDepositForm((v) => ({ ...v, amount: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                rows={2}
                value={depositForm.description}
                onChange={(e) =>
                  setDepositForm((v) => ({
                    ...v,
                    description: e.target.value,
                  }))
                }
                placeholder="Reason for deposit..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDepositDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeposit}
              disabled={!depositForm.clientLedgerId || !depositForm.amount}
            >
              Record Deposit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disbursement Dialog */}
      <Dialog
        open={showDisbursementDialog}
        onOpenChange={setShowDisbursementDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Trust Disbursement</DialogTitle>
            <DialogDescription>
              Record a disbursement from a client trust ledger. The system will
              prevent disbursements that would create a negative balance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Client Ledger</Label>
              <Select
                value={disbursementForm.clientLedgerId}
                onChange={(e) =>
                  setDisbursementForm((v) => ({
                    ...v,
                    clientLedgerId: e.target.value,
                  }))
                }
              >
                <option value="">Select client...</option>
                {ledgers.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.clientName} - {l.matter} ({formatCurrency(l.balance)})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Disbursement Type</Label>
              <Select
                value={disbursementForm.type}
                onChange={(e) =>
                  setDisbursementForm((v) => ({
                    ...v,
                    type: e.target.value as TrustTransaction["type"],
                  }))
                }
              >
                <option value="Disbursement to Firm">
                  Disbursement to Firm
                </option>
                <option value="Disbursement to Client">
                  Disbursement to Client
                </option>
                <option value="Third Party">Third Party Payment</option>
              </Select>
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={disbursementForm.amount}
                onChange={(e) =>
                  setDisbursementForm((v) => ({
                    ...v,
                    amount: e.target.value,
                  }))
                }
              />
              {disbursementForm.clientLedgerId && disbursementForm.amount && (
                (() => {
                  const ledger = ledgers.find(
                    (l) => l.id === disbursementForm.clientLedgerId
                  );
                  const amt = parseFloat(disbursementForm.amount) || 0;
                  if (ledger && amt > ledger.balance) {
                    return (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        This would create a negative balance of{" "}
                        {formatCurrency(ledger.balance - amt)}
                      </p>
                    );
                  }
                  return null;
                })()
              )}
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                rows={2}
                value={disbursementForm.description}
                onChange={(e) =>
                  setDisbursementForm((v) => ({
                    ...v,
                    description: e.target.value,
                  }))
                }
                placeholder="Reason for disbursement..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDisbursementDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDisbursement}
              disabled={
                !disbursementForm.clientLedgerId || !disbursementForm.amount
              }
            >
              Record Disbursement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

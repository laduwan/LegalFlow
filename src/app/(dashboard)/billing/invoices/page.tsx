"use client";

import { useState } from "react";
import {
  FileText,
  Plus,
  ChevronDown,
  ChevronRight,
  Send,
  DollarSign,
  Ban,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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

interface LineItem {
  id: string;
  description: string;
  type: "time" | "expense";
  quantity: number;
  rate: number;
  amount: number;
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
  reference: string;
}

interface Invoice {
  id: string;
  client: string;
  matter: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  paid: number;
  status: "Draft" | "Sent" | "Viewed" | "Paid" | "Partial" | "Overdue" | "Void";
  lineItems: LineItem[];
  payments: Payment[];
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const invoices: Invoice[] = [
  {
    id: "INV-2026-001",
    client: "Maria Rodriguez",
    matter: "Rodriguez - AOS",
    issueDate: "2026-03-01",
    dueDate: "2026-03-31",
    amount: 4500.0,
    paid: 4500.0,
    status: "Paid",
    lineItems: [
      { id: "li-1", description: "Legal research - AOS eligibility", type: "time", quantity: 5.0, rate: 350, amount: 1750 },
      { id: "li-2", description: "Document drafting - I-485 packet", type: "time", quantity: 4.0, rate: 350, amount: 1400 },
      { id: "li-3", description: "Client meeting and document review", type: "time", quantity: 2.5, rate: 350, amount: 875 },
      { id: "li-4", description: "USCIS filing fee", type: "expense", quantity: 1, rate: 475, amount: 475 },
    ],
    payments: [
      { id: "p-1", date: "2026-03-10", amount: 4500, method: "Trust Account", reference: "TXN-8834" },
    ],
  },
  {
    id: "INV-2026-002",
    client: "Chen Wei",
    matter: "Wei - H-1B Transfer",
    issueDate: "2026-03-02",
    dueDate: "2026-04-01",
    amount: 6200.0,
    paid: 0,
    status: "Sent",
    lineItems: [
      { id: "li-5", description: "H-1B transfer petition preparation", type: "time", quantity: 8.0, rate: 350, amount: 2800 },
      { id: "li-6", description: "Employment verification review", type: "time", quantity: 3.0, rate: 300, amount: 900 },
      { id: "li-7", description: "USCIS inquiry and correspondence", type: "time", quantity: 2.0, rate: 300, amount: 600 },
      { id: "li-8", description: "Premium processing fee", type: "expense", quantity: 1, rate: 1900, amount: 1900 },
    ],
    payments: [],
  },
  {
    id: "INV-2026-003",
    client: "Amir Patel",
    matter: "Patel - H-1B Extension",
    issueDate: "2026-02-15",
    dueDate: "2026-03-15",
    amount: 3800.0,
    paid: 1900.0,
    status: "Partial",
    lineItems: [
      { id: "li-9", description: "H-1B extension petition drafting", type: "time", quantity: 6.0, rate: 350, amount: 2100 },
      { id: "li-10", description: "Case strategy meeting", type: "time", quantity: 1.5, rate: 350, amount: 525 },
      { id: "li-11", description: "Document review and compilation", type: "time", quantity: 2.5, rate: 300, amount: 750 },
      { id: "li-12", description: "Filing fee", type: "expense", quantity: 1, rate: 425, amount: 425 },
    ],
    payments: [
      { id: "p-2", date: "2026-02-28", amount: 1900, method: "Check", reference: "CHK-4412" },
    ],
  },
  {
    id: "INV-2026-004",
    client: "Sofia Herrera",
    matter: "Herrera - Family Based",
    issueDate: "2026-02-20",
    dueDate: "2026-03-22",
    amount: 5500.0,
    paid: 0,
    status: "Overdue",
    lineItems: [
      { id: "li-13", description: "I-130 petition preparation", type: "time", quantity: 7.0, rate: 350, amount: 2450 },
      { id: "li-14", description: "RFE response drafting", type: "time", quantity: 5.0, rate: 350, amount: 1750 },
      { id: "li-15", description: "Client calls and correspondence", type: "time", quantity: 2.0, rate: 350, amount: 700 },
      { id: "li-16", description: "Translation services", type: "expense", quantity: 1, rate: 600, amount: 600 },
    ],
    payments: [],
  },
  {
    id: "INV-2026-005",
    client: "Olga Petrov",
    matter: "Petrov - L-1 Visa",
    issueDate: "2026-03-05",
    dueDate: "2026-04-04",
    amount: 7800.0,
    paid: 0,
    status: "Viewed",
    lineItems: [
      { id: "li-17", description: "L-1 visa petition preparation", type: "time", quantity: 10.0, rate: 350, amount: 3500 },
      { id: "li-18", description: "Corporate documentation review", type: "time", quantity: 5.0, rate: 300, amount: 1500 },
      { id: "li-19", description: "Immigration forms preparation", type: "time", quantity: 4.5, rate: 300, amount: 1350 },
      { id: "li-20", description: "USCIS filing fee", type: "expense", quantity: 1, rate: 1450, amount: 1450 },
    ],
    payments: [],
  },
  {
    id: "INV-2026-006",
    client: "Carlos Garcia",
    matter: "Garcia - Asylum",
    issueDate: "2026-03-07",
    dueDate: "2026-04-06",
    amount: 3200.0,
    paid: 0,
    status: "Draft",
    lineItems: [
      { id: "li-21", description: "Asylum hearing preparation", type: "time", quantity: 4.0, rate: 350, amount: 1400 },
      { id: "li-22", description: "Country conditions research", type: "time", quantity: 3.0, rate: 350, amount: 1050 },
      { id: "li-23", description: "Court appearance", type: "time", quantity: 1.5, rate: 400, amount: 600 },
      { id: "li-24", description: "Expert witness fee", type: "expense", quantity: 1, rate: 150, amount: 150 },
    ],
    payments: [],
  },
  {
    id: "INV-2026-007",
    client: "Fatima Al-Rashid",
    matter: "Al-Rashid - EB-5",
    issueDate: "2026-03-04",
    dueDate: "2026-04-03",
    amount: 12000.0,
    paid: 0,
    status: "Sent",
    lineItems: [
      { id: "li-25", description: "EB-5 petition drafting", type: "time", quantity: 15.0, rate: 350, amount: 5250 },
      { id: "li-26", description: "Business plan review and analysis", type: "time", quantity: 8.0, rate: 350, amount: 2800 },
      { id: "li-27", description: "Financial documentation review", type: "time", quantity: 5.0, rate: 300, amount: 1500 },
      { id: "li-28", description: "USCIS filing fee", type: "expense", quantity: 1, rate: 2450, amount: 2450 },
    ],
    payments: [],
  },
  {
    id: "INV-2026-008",
    client: "David Okonkwo",
    matter: "Okonkwo - Naturalization",
    issueDate: "2026-02-10",
    dueDate: "2026-03-12",
    amount: 2500.0,
    paid: 2500.0,
    status: "Paid",
    lineItems: [
      { id: "li-29", description: "N-400 application preparation", type: "time", quantity: 3.0, rate: 350, amount: 1050 },
      { id: "li-30", description: "Interview preparation session", type: "time", quantity: 2.0, rate: 350, amount: 700 },
      { id: "li-31", description: "Document review", type: "time", quantity: 1.0, rate: 300, amount: 300 },
      { id: "li-32", description: "USCIS filing fee", type: "expense", quantity: 1, rate: 450, amount: 450 },
    ],
    payments: [
      { id: "p-3", date: "2026-02-25", amount: 2500, method: "Credit Card", reference: "CC-9921" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusBadgeClass(status: string) {
  switch (status) {
    case "Draft":
      return "bg-gray-100 text-gray-700";
    case "Sent":
      return "bg-blue-100 text-blue-700";
    case "Viewed":
      return "bg-purple-100 text-purple-700";
    case "Paid":
      return "bg-green-100 text-green-700";
    case "Partial":
      return "bg-yellow-100 text-yellow-700";
    case "Overdue":
      return "bg-red-100 text-red-700";
    case "Void":
      return "bg-gray-200 text-gray-500";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function InvoicesPage() {
  const [invoiceList, setInvoiceList] = useState<Invoice[]>(invoices);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Check");

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const uniqueClients = Array.from(new Set(invoiceList.map((i) => i.client)));

  const filteredInvoices = invoiceList.filter((inv) => {
    if (filterStatus && inv.status !== filterStatus) return false;
    if (filterClient && inv.client !== filterClient) return false;
    if (filterDateFrom && inv.issueDate < filterDateFrom) return false;
    if (filterDateTo && inv.issueDate > filterDateTo) return false;
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleSend = (id: string) => {
    setInvoiceList((prev) =>
      prev.map((inv) =>
        inv.id === id && inv.status === "Draft" ? { ...inv, status: "Sent" } : inv
      )
    );
  };

  const handleVoid = (id: string) => {
    setInvoiceList((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, status: "Void" } : inv
      )
    );
  };

  const openPaymentDialog = (id: string) => {
    setPaymentInvoiceId(id);
    const inv = invoiceList.find((i) => i.id === id);
    setPaymentAmount(inv ? (inv.amount - inv.paid).toFixed(2) : "0");
    setShowPaymentDialog(true);
  };

  const handleRecordPayment = () => {
    if (!paymentInvoiceId) return;
    const amount = parseFloat(paymentAmount) || 0;
    if (amount <= 0) return;

    setInvoiceList((prev) =>
      prev.map((inv) => {
        if (inv.id !== paymentInvoiceId) return inv;
        const newPaid = inv.paid + amount;
        const newPayment: Payment = {
          id: `p-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          amount,
          method: paymentMethod,
          reference: `PAY-${Date.now().toString().slice(-6)}`,
        };
        const newStatus: Invoice["status"] =
          newPaid >= inv.amount ? "Paid" : "Partial";
        return {
          ...inv,
          paid: Math.min(newPaid, inv.amount),
          status: newStatus,
          payments: [...inv.payments, newPayment],
        };
      })
    );
    setShowPaymentDialog(false);
    setPaymentInvoiceId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="text-sm text-slate-500">
            Manage client invoices and payments
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <Label className="text-xs">Status</Label>
              <Select
                className="w-[150px]"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Viewed">Viewed</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Overdue">Overdue</option>
                <option value="Void">Void</option>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Client</Label>
              <Select
                className="w-[200px]"
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
        </CardContent>
      </Card>

      {/* Invoice Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Matter</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((inv) => {
                const isExpanded = expandedId === inv.id;
                const balance = inv.amount - inv.paid;
                return (
                  <>
                    <TableRow
                      key={inv.id}
                      className="cursor-pointer"
                      onClick={() => toggleExpand(inv.id)}
                    >
                      <TableCell>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{inv.id}</TableCell>
                      <TableCell>{inv.client}</TableCell>
                      <TableCell className="text-slate-500">
                        {inv.matter}
                      </TableCell>
                      <TableCell>{formatDate(inv.issueDate)}</TableCell>
                      <TableCell>{formatDate(inv.dueDate)}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(inv.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(inv.paid)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(balance)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                            statusBadgeClass(inv.status)
                          )}
                        >
                          {inv.status}
                        </span>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <TableRow key={`${inv.id}-detail`}>
                        <TableCell colSpan={10} className="bg-slate-50 p-0">
                          <div className="p-6 space-y-6">
                            {/* Line Items */}
                            <div>
                              <h4 className="text-sm font-semibold text-slate-700 mb-3">
                                Line Items
                              </h4>
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-slate-200 text-slate-500">
                                    <th className="text-left py-2 font-medium">
                                      Description
                                    </th>
                                    <th className="text-left py-2 font-medium">
                                      Type
                                    </th>
                                    <th className="text-right py-2 font-medium">
                                      Qty/Hours
                                    </th>
                                    <th className="text-right py-2 font-medium">
                                      Rate
                                    </th>
                                    <th className="text-right py-2 font-medium">
                                      Amount
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {inv.lineItems.map((li) => (
                                    <tr
                                      key={li.id}
                                      className="border-b border-slate-100"
                                    >
                                      <td className="py-2 text-slate-700">
                                        {li.description}
                                      </td>
                                      <td className="py-2">
                                        <span
                                          className={cn(
                                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                                            li.type === "time"
                                              ? "bg-blue-50 text-blue-700"
                                              : "bg-amber-50 text-amber-700"
                                          )}
                                        >
                                          {li.type === "time"
                                            ? "Time"
                                            : "Expense"}
                                        </span>
                                      </td>
                                      <td className="py-2 text-right">
                                        {li.type === "time"
                                          ? `${li.quantity}h`
                                          : li.quantity}
                                      </td>
                                      <td className="py-2 text-right">
                                        {formatCurrency(li.rate)}
                                      </td>
                                      <td className="py-2 text-right font-medium">
                                        {formatCurrency(li.amount)}
                                      </td>
                                    </tr>
                                  ))}
                                  <tr className="font-semibold">
                                    <td colSpan={4} className="py-2 text-right">
                                      Total:
                                    </td>
                                    <td className="py-2 text-right">
                                      {formatCurrency(inv.amount)}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            {/* Payment History */}
                            {inv.payments.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-3">
                                  Payment History
                                </h4>
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-slate-200 text-slate-500">
                                      <th className="text-left py-2 font-medium">
                                        Date
                                      </th>
                                      <th className="text-left py-2 font-medium">
                                        Method
                                      </th>
                                      <th className="text-left py-2 font-medium">
                                        Reference
                                      </th>
                                      <th className="text-right py-2 font-medium">
                                        Amount
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {inv.payments.map((pmt) => (
                                      <tr
                                        key={pmt.id}
                                        className="border-b border-slate-100"
                                      >
                                        <td className="py-2">
                                          {formatDate(pmt.date)}
                                        </td>
                                        <td className="py-2">{pmt.method}</td>
                                        <td className="py-2 text-slate-500">
                                          {pmt.reference}
                                        </td>
                                        <td className="py-2 text-right font-medium text-green-700">
                                          {formatCurrency(pmt.amount)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-2 border-t border-slate-200">
                              {inv.status === "Draft" && (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSend(inv.id);
                                  }}
                                >
                                  <Send className="mr-2 h-3 w-3" />
                                  Send Invoice
                                </Button>
                              )}
                              {inv.status !== "Paid" &&
                                inv.status !== "Void" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openPaymentDialog(inv.id);
                                    }}
                                  >
                                    <DollarSign className="mr-2 h-3 w-3" />
                                    Record Payment
                                  </Button>
                                )}
                              {inv.status !== "Void" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVoid(inv.id);
                                  }}
                                >
                                  <Ban className="mr-2 h-3 w-3" />
                                  Void
                                </Button>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for invoice {paymentInvoiceId}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Check">Check</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Wire Transfer">Wire Transfer</option>
                <option value="Trust Account">Trust Account</option>
                <option value="Cash">Cash</option>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRecordPayment}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

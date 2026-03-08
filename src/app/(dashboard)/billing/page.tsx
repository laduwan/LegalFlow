"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  Clock,
  AlertCircle,
  TrendingUp,
  Plus,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
// Demo data
// ---------------------------------------------------------------------------

const kpis = {
  totalBilled: 87450.0,
  outstandingBalance: 32175.0,
  unbilledTime: 24650.0,
  collectionsRate: 91.3,
};

const recentInvoices = [
  {
    id: "INV-2026-001",
    client: "Maria Rodriguez",
    matter: "Rodriguez - AOS",
    issueDate: "2026-03-01",
    dueDate: "2026-03-31",
    amount: 4500.0,
    paid: 4500.0,
    status: "Paid" as const,
  },
  {
    id: "INV-2026-002",
    client: "Chen Wei",
    matter: "Wei - H-1B Transfer",
    issueDate: "2026-03-02",
    dueDate: "2026-04-01",
    amount: 6200.0,
    paid: 0,
    status: "Sent" as const,
  },
  {
    id: "INV-2026-003",
    client: "Amir Patel",
    matter: "Patel - H-1B Extension",
    issueDate: "2026-02-15",
    dueDate: "2026-03-15",
    amount: 3800.0,
    paid: 1900.0,
    status: "Partial" as const,
  },
  {
    id: "INV-2026-004",
    client: "Sofia Herrera",
    matter: "Herrera - Family Based",
    issueDate: "2026-02-20",
    dueDate: "2026-03-22",
    amount: 5500.0,
    paid: 0,
    status: "Overdue" as const,
  },
  {
    id: "INV-2026-005",
    client: "Olga Petrov",
    matter: "Petrov - L-1 Visa",
    issueDate: "2026-03-05",
    dueDate: "2026-04-04",
    amount: 7800.0,
    paid: 0,
    status: "Sent" as const,
  },
  {
    id: "INV-2026-006",
    client: "Carlos Garcia",
    matter: "Garcia - Asylum",
    issueDate: "2026-03-07",
    dueDate: "2026-04-06",
    amount: 3200.0,
    paid: 0,
    status: "Draft" as const,
  },
  {
    id: "INV-2026-007",
    client: "Yuki Yamamoto",
    matter: "Yamamoto - Consultation",
    issueDate: "2026-02-01",
    dueDate: "2026-03-01",
    amount: 1500.0,
    paid: 1500.0,
    status: "Paid" as const,
  },
  {
    id: "INV-2026-008",
    client: "Fatima Al-Rashid",
    matter: "Al-Rashid - EB-5",
    issueDate: "2026-03-04",
    dueDate: "2026-04-03",
    amount: 12000.0,
    paid: 0,
    status: "Viewed" as const,
  },
  {
    id: "INV-2026-009",
    client: "David Okonkwo",
    matter: "Okonkwo - Naturalization",
    issueDate: "2026-02-10",
    dueDate: "2026-03-12",
    amount: 2500.0,
    paid: 2500.0,
    status: "Paid" as const,
  },
  {
    id: "INV-2026-010",
    client: "Priya Sharma",
    matter: "Sharma - H-4 EAD",
    issueDate: "2026-03-06",
    dueDate: "2026-04-05",
    amount: 1800.0,
    paid: 0,
    status: "Sent" as const,
  },
];

const unbilledByMatter = [
  { matter: "Patel - H-1B Extension", hours: 12.5, amount: 4375.0 },
  { matter: "Herrera - Family Based", hours: 8.25, amount: 2887.5 },
  { matter: "Garcia - Asylum", hours: 18.0, amount: 6300.0 },
  { matter: "Wei - H-1B Transfer", hours: 6.75, amount: 2362.5 },
  { matter: "Al-Rashid - EB-5", hours: 15.0, amount: 5250.0 },
  { matter: "Petrov - L-1 Visa", hours: 10.5, amount: 3675.0 },
];

const monthlyRevenue = [
  { month: "Oct", amount: 62000 },
  { month: "Nov", amount: 71000 },
  { month: "Dec", amount: 58000 },
  { month: "Jan", amount: 74000 },
  { month: "Feb", amount: 81000 },
  { month: "Mar", amount: 87450 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function invoiceStatusBadge(status: string) {
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
    default:
      return "bg-gray-100 text-gray-700";
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BillingPage() {
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.amount));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing Overview</h1>
          <p className="text-sm text-slate-500">
            Financial summary for March 2026
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/billing/time">
            <Button variant="outline" size="sm">
              <Clock className="mr-2 h-4 w-4" />
              New Time Entry
            </Button>
          </Link>
          <Link href="/billing/invoices">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Billed (Month)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(kpis.totalBilled)}
            </div>
            <p className="text-xs text-green-600 mt-1">+7.9% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Outstanding Balance
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(kpis.outstandingBalance)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Across 5 invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Unbilled Time
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(kpis.unbilledTime)}
            </div>
            <p className="text-xs text-slate-500 mt-1">71.0 hours across 6 matters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Collections Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.collectionsRate}%</div>
            <p className="text-xs text-green-600 mt-1">+2.1% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-slate-600" />
              <CardTitle className="text-lg">Monthly Revenue</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-48">
              {monthlyRevenue.map((m) => (
                <div key={m.month} className="flex flex-col items-center flex-1 gap-1">
                  <span className="text-xs font-medium text-slate-600">
                    {formatCurrency(m.amount)}
                  </span>
                  <div
                    className="w-full rounded-t bg-slate-800 hover:bg-slate-700 transition-colors"
                    style={{
                      height: `${(m.amount / maxRevenue) * 160}px`,
                    }}
                  />
                  <span className="text-xs text-slate-500">{m.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Unbilled Time by Matter */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Unbilled Time</CardTitle>
              </div>
              <Link href="/billing/time">
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unbilledByMatter.map((item) => (
                <div
                  key={item.matter}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {item.matter}
                    </p>
                    <p className="text-xs text-slate-500">{item.hours}h unbilled</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-600" />
              <CardTitle className="text-lg">Recent Invoices</CardTitle>
            </div>
            <Link href="/billing/invoices">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Matter</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.id}</TableCell>
                  <TableCell>{inv.client}</TableCell>
                  <TableCell className="text-slate-500">{inv.matter}</TableCell>
                  <TableCell>{formatDate(inv.issueDate)}</TableCell>
                  <TableCell>{formatDate(inv.dueDate)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(inv.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(inv.paid)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        invoiceStatusBadge(inv.status)
                      )}
                    >
                      {inv.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

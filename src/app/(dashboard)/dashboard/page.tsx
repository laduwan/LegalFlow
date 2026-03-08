"use client";

import {
  Briefcase,
  Clock,
  DollarSign,
  AlertTriangle,
  Globe,
  Calendar,
  CheckSquare,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Demo / placeholder data
// ---------------------------------------------------------------------------

const kpiData = {
  activeCases: 47,
  upcomingDeadlines: 12,
  unbilledHours: 164.5,
  trustBalance: 328750.0,
  pendingRFEs: 5,
};

const immigrationAlerts = [
  {
    id: "1",
    type: "visa_expiration",
    clientName: "Maria Rodriguez",
    detail: "H-1B visa expires Apr 2, 2026",
    daysLeft: 25,
    severity: "high" as const,
  },
  {
    id: "2",
    type: "visa_expiration",
    clientName: "Chen Wei",
    detail: "F-1 OPT expires Mar 28, 2026",
    daysLeft: 20,
    severity: "high" as const,
  },
  {
    id: "3",
    type: "work_auth",
    clientName: "Amir Patel",
    detail: "EAD expires Mar 22, 2026",
    daysLeft: 14,
    severity: "critical" as const,
  },
  {
    id: "4",
    type: "rfe_deadline",
    clientName: "Sofia Herrera",
    detail: "RFE response due Mar 18, 2026",
    daysLeft: 10,
    severity: "critical" as const,
  },
  {
    id: "5",
    type: "visa_expiration",
    clientName: "Olga Petrov",
    detail: "L-1 visa expires Apr 5, 2026",
    daysLeft: 28,
    severity: "medium" as const,
  },
];

const recentActivity = [
  {
    id: "1",
    action: "Filed I-485 for Maria Rodriguez",
    user: "Sarah Chen",
    timestamp: "2026-03-08T09:15:00Z",
    icon: "filing",
  },
  {
    id: "2",
    action: "Added time entry - 2.5 hrs research for Patel case",
    user: "James Wilson",
    timestamp: "2026-03-08T08:45:00Z",
    icon: "time",
  },
  {
    id: "3",
    action: "Uploaded RFE response documents for Sofia Herrera",
    user: "Maria Lopez",
    timestamp: "2026-03-07T16:30:00Z",
    icon: "document",
  },
  {
    id: "4",
    action: "Created new matter: Chen Wei - H-1B Transfer",
    user: "Sarah Chen",
    timestamp: "2026-03-07T14:20:00Z",
    icon: "case",
  },
  {
    id: "5",
    action: "Trust deposit received - $5,000 from Amir Patel",
    user: "System",
    timestamp: "2026-03-07T11:00:00Z",
    icon: "payment",
  },
  {
    id: "6",
    action: "Court hearing scheduled for Garcia removal defense",
    user: "James Wilson",
    timestamp: "2026-03-06T15:10:00Z",
    icon: "court",
  },
];

const myTasks = [
  {
    id: "1",
    title: "Prepare RFE response for Herrera I-130",
    dueDate: "2026-03-18",
    priority: "high" as const,
    matter: "Herrera - Family Based",
  },
  {
    id: "2",
    title: "Review I-485 evidence packet - Rodriguez",
    dueDate: "2026-03-12",
    priority: "medium" as const,
    matter: "Rodriguez - AOS",
  },
  {
    id: "3",
    title: "Draft cover letter for Patel H-1B extension",
    dueDate: "2026-03-15",
    priority: "medium" as const,
    matter: "Patel - H-1B Extension",
  },
  {
    id: "4",
    title: "Compile country conditions report for Garcia asylum",
    dueDate: "2026-03-20",
    priority: "high" as const,
    matter: "Garcia - Asylum",
  },
  {
    id: "5",
    title: "Send retainer agreement to new client Yamamoto",
    dueDate: "2026-03-10",
    priority: "low" as const,
    matter: "Yamamoto - Consultation",
  },
];

const upcomingEvents = [
  {
    id: "1",
    title: "Master Calendar Hearing - Garcia",
    date: "2026-03-09T09:00:00Z",
    type: "COURT_HEARING",
    location: "Immigration Court, Room 3B",
  },
  {
    id: "2",
    title: "Client Consultation - Yamamoto",
    date: "2026-03-10T10:30:00Z",
    type: "CONSULTATION",
    location: "Office - Conference Room A",
  },
  {
    id: "3",
    title: "USCIS Biometrics Appt - Rodriguez",
    date: "2026-03-11T13:00:00Z",
    type: "DEADLINE",
    location: "USCIS Field Office, Miami",
  },
  {
    id: "4",
    title: "RFE Response Deadline - Herrera",
    date: "2026-03-18T23:59:00Z",
    type: "FILING_DEADLINE",
    location: "USCIS",
  },
  {
    id: "5",
    title: "Team Meeting - Case Review",
    date: "2026-03-12T14:00:00Z",
    type: "INTERNAL_MEETING",
    location: "Office - Main Conference Room",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function severityColor(severity: "critical" | "high" | "medium") {
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-800 border-red-200";
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }
}

function priorityBadge(priority: "high" | "medium" | "low") {
  switch (priority) {
    case "high":
      return "destructive" as const;
    case "medium":
      return "secondary" as const;
    case "low":
      return "outline" as const;
  }
}

function eventTypeColor(type: string) {
  switch (type) {
    case "COURT_HEARING":
      return "bg-red-50 border-l-4 border-l-red-500";
    case "FILING_DEADLINE":
      return "bg-orange-50 border-l-4 border-l-orange-500";
    case "CONSULTATION":
      return "bg-green-50 border-l-4 border-l-green-500";
    case "DEADLINE":
      return "bg-amber-50 border-l-4 border-l-amber-500";
    case "INTERNAL_MEETING":
      return "bg-slate-50 border-l-4 border-l-slate-400";
    default:
      return "bg-blue-50 border-l-4 border-l-blue-500";
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Welcome back. Here is an overview of your firm today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Active Cases
            </CardTitle>
            <Briefcase className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.activeCases}</div>
            <p className="text-xs text-slate-500 mt-1">
              +3 this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Upcoming Deadlines
            </CardTitle>
            <Clock className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.upcomingDeadlines}</div>
            <p className="text-xs text-slate-500 mt-1">
              Next 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Unbilled Hours
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.unbilledHours}h</div>
            <p className="text-xs text-slate-500 mt-1">
              Across all matters
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Trust Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(kpiData.trustBalance)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              All trust accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Pending RFEs
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {kpiData.pendingRFEs}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Require response
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Immigration Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Immigration Alerts</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {immigrationAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between rounded-lg border p-3 ${severityColor(
                  alert.severity
                )}`}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{alert.clientName}</p>
                    <p className="text-xs opacity-80">{alert.detail}</p>
                  </div>
                </div>
                <Badge
                  variant={
                    alert.severity === "critical" ? "destructive" : "secondary"
                  }
                >
                  {alert.daysLeft} days
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Three-column layout: Activity, Tasks, Events */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-slate-600" />
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100">
                    <Activity className="h-3 w-3 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-700 leading-snug">
                      {item.action}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.user} &middot;{" "}
                      {formatRelativeTime(item.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* My Tasks */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-lg">My Tasks</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-800 leading-snug">
                      {task.title}
                    </p>
                    <Badge variant={priorityBadge(task.priority)} className="flex-shrink-0 text-[10px]">
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
                    <Briefcase className="h-3 w-3" />
                    <span className="truncate">{task.matter}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Due {formatDate(task.dueDate)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal-600" />
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className={`rounded-lg p-3 ${eventTypeColor(event.type)}`}
                >
                  <p className="text-sm font-medium text-slate-800">
                    {event.title}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {event.location}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

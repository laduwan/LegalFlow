"use client";

import { useState } from "react";
import {
  Users,
  FileText,
  MessageSquare,
  Shield,
  ShieldOff,
  KeyRound,
  Send,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PortalUser {
  id: string;
  clientName: string;
  email: string;
  status: "active" | "invited" | "disabled";
  lastLogin: string | null;
  matterName: string;
}

interface DocumentRequest {
  id: string;
  clientName: string;
  documentName: string;
  requestedAt: string;
  status: "pending" | "uploaded" | "reviewed";
  matterName: string;
}

interface PortalMessage {
  id: string;
  clientName: string;
  message: string;
  sentAt: string;
  isRead: boolean;
  matterName: string;
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const demoPortalUsers: PortalUser[] = [
  {
    id: "1",
    clientName: "Maria Rodriguez",
    email: "maria.rodriguez@email.com",
    status: "active",
    lastLogin: "2026-03-08T08:30:00Z",
    matterName: "Rodriguez - Adjustment of Status",
  },
  {
    id: "2",
    clientName: "Amir Patel",
    email: "amir.patel@email.com",
    status: "active",
    lastLogin: "2026-03-07T14:20:00Z",
    matterName: "Patel - H-1B Extension",
  },
  {
    id: "3",
    clientName: "Sofia Herrera",
    email: "sofia.herrera@email.com",
    status: "invited",
    lastLogin: null,
    matterName: "Herrera - Family Based",
  },
  {
    id: "4",
    clientName: "Chen Wei",
    email: "chen.wei@email.com",
    status: "active",
    lastLogin: "2026-03-05T16:45:00Z",
    matterName: "Wei - H-1B Transfer",
  },
  {
    id: "5",
    clientName: "Ricardo Garcia",
    email: "ricardo.garcia@email.com",
    status: "disabled",
    lastLogin: "2026-02-15T10:00:00Z",
    matterName: "Garcia - Asylum",
  },
  {
    id: "6",
    clientName: "Olga Petrov",
    email: "olga.petrov@email.com",
    status: "invited",
    lastLogin: null,
    matterName: "Petrov - L-1 Extension",
  },
];

const demoDocumentRequests: DocumentRequest[] = [
  {
    id: "1",
    clientName: "Maria Rodriguez",
    documentName: "Tax Returns (2023, 2024, 2025)",
    requestedAt: "2026-03-06T10:00:00Z",
    status: "uploaded",
    matterName: "Rodriguez - AOS",
  },
  {
    id: "2",
    clientName: "Maria Rodriguez",
    documentName: "Employment Verification Letter",
    requestedAt: "2026-03-06T10:00:00Z",
    status: "reviewed",
    matterName: "Rodriguez - AOS",
  },
  {
    id: "3",
    clientName: "Amir Patel",
    documentName: "Updated Resume / CV",
    requestedAt: "2026-03-05T14:00:00Z",
    status: "pending",
    matterName: "Patel - H-1B Extension",
  },
  {
    id: "4",
    clientName: "Amir Patel",
    documentName: "Degree Evaluation",
    requestedAt: "2026-03-05T14:00:00Z",
    status: "pending",
    matterName: "Patel - H-1B Extension",
  },
  {
    id: "5",
    clientName: "Chen Wei",
    documentName: "Current Passport Copy (all pages)",
    requestedAt: "2026-03-04T09:00:00Z",
    status: "uploaded",
    matterName: "Wei - H-1B Transfer",
  },
  {
    id: "6",
    clientName: "Chen Wei",
    documentName: "Pay Stubs (last 3 months)",
    requestedAt: "2026-03-04T09:00:00Z",
    status: "pending",
    matterName: "Wei - H-1B Transfer",
  },
  {
    id: "7",
    clientName: "Maria Rodriguez",
    documentName: "Passport-Style Photos (2x2)",
    requestedAt: "2026-03-07T11:00:00Z",
    status: "pending",
    matterName: "Rodriguez - AOS",
  },
];

const demoMessages: PortalMessage[] = [
  {
    id: "1",
    clientName: "Maria Rodriguez",
    message:
      "Hi, I uploaded the tax returns you requested. I included 3 years as asked. Please let me know if you need anything else.",
    sentAt: "2026-03-08T08:45:00Z",
    isRead: false,
    matterName: "Rodriguez - AOS",
  },
  {
    id: "2",
    clientName: "Amir Patel",
    message:
      "I am having trouble getting the degree evaluation. The agency said it will take 2 more weeks. Is that okay?",
    sentAt: "2026-03-07T15:30:00Z",
    isRead: false,
    matterName: "Patel - H-1B Extension",
  },
  {
    id: "3",
    clientName: "Chen Wei",
    message:
      "I uploaded my passport. I noticed it expires in 8 months - will that be an issue for the H-1B transfer?",
    sentAt: "2026-03-06T17:00:00Z",
    isRead: true,
    matterName: "Wei - H-1B Transfer",
  },
  {
    id: "4",
    clientName: "Maria Rodriguez",
    message:
      "When is my biometrics appointment? I want to make sure I don't miss it.",
    sentAt: "2026-03-05T09:20:00Z",
    isRead: true,
    matterName: "Rodriguez - AOS",
  },
  {
    id: "5",
    clientName: "Amir Patel",
    message:
      "Thank you for the update on my case. I feel much better knowing the timeline.",
    sentAt: "2026-03-04T11:10:00Z",
    isRead: true,
    matterName: "Patel - H-1B Extension",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusBadge(status: PortalUser["status"]) {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Active
        </Badge>
      );
    case "invited":
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          Invited
        </Badge>
      );
    case "disabled":
      return (
        <Badge className="bg-slate-100 text-slate-500 border-slate-200">
          Disabled
        </Badge>
      );
  }
}

function docRequestStatusBadge(status: DocumentRequest["status"]) {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
          <Clock className="h-3 w-3" />
          Pending
        </span>
      );
    case "uploaded":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700">
          <AlertCircle className="h-3 w-3" />
          Uploaded
        </span>
      );
    case "reviewed":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
          <CheckCircle className="h-3 w-3" />
          Reviewed
        </span>
      );
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ClientPortalManagementPage() {
  const [portalUsers, setPortalUsers] = useState(demoPortalUsers);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Stats
  const activeUsers = portalUsers.filter((u) => u.status === "active").length;
  const pendingRequests = demoDocumentRequests.filter(
    (r) => r.status === "pending"
  ).length;
  const unreadMessages = demoMessages.filter((m) => !m.isRead).length;

  function togglePortalAccess(userId: string) {
    setPortalUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        if (u.status === "active") return { ...u, status: "disabled" as const };
        if (u.status === "disabled") return { ...u, status: "active" as const };
        return u;
      })
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Client Portal Management
        </h1>
        <p className="text-sm text-slate-500">
          Manage client portal access, document requests, and messages
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Active Portal Users
            </CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-slate-500 mt-1">
              of {portalUsers.length} total clients
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Pending Document Requests
            </CardTitle>
            <FileText className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {pendingRequests}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Awaiting client upload
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Unread Messages
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {unreadMessages}
            </div>
            <p className="text-xs text-slate-500 mt-1">From portal clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Portal Users</TabsTrigger>
          <TabsTrigger value="documents">Document Requests</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        {/* Portal Users Tab */}
        <TabsContent value="users">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Matter</TableHead>
                  <TableHead>Portal Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portalUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-slate-800">
                      {user.clientName}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {user.matterName}
                    </TableCell>
                    <TableCell>{statusBadge(user.status)}</TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {user.lastLogin
                        ? formatRelativeTime(user.lastLogin)
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {user.status === "active" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePortalAccess(user.id)}
                            className="text-xs text-slate-600"
                          >
                            <ShieldOff className="mr-1 h-3.5 w-3.5" />
                            Disable
                          </Button>
                        )}
                        {user.status === "disabled" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePortalAccess(user.id)}
                            className="text-xs text-green-600"
                          >
                            <Shield className="mr-1 h-3.5 w-3.5" />
                            Enable
                          </Button>
                        )}
                        {user.status === "invited" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-blue-600"
                          >
                            <Send className="mr-1 h-3.5 w-3.5" />
                            Resend Invite
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-slate-600"
                        >
                          <KeyRound className="mr-1 h-3.5 w-3.5" />
                          Reset Password
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Document Requests Tab */}
        <TabsContent value="documents">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Document Requested</TableHead>
                  <TableHead>Matter</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demoDocumentRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium text-slate-800">
                      {req.clientName}
                    </TableCell>
                    <TableCell className="text-sm text-slate-700">
                      {req.documentName}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {req.matterName}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {formatDate(req.requestedAt)}
                    </TableCell>
                    <TableCell>{docRequestStatusBadge(req.status)}</TableCell>
                    <TableCell className="text-right">
                      {req.status === "uploaded" && (
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          Review
                        </Button>
                      )}
                      {req.status === "pending" && (
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Send className="mr-1 h-3.5 w-3.5" />
                          Remind
                        </Button>
                      )}
                      {req.status === "reviewed" && (
                        <span className="text-xs text-green-600 flex items-center justify-end gap-1">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Complete
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages">
          <div className="space-y-3">
            {demoMessages.map((msg) => (
              <Card
                key={msg.id}
                className={cn(!msg.isRead && "border-l-4 border-l-blue-500")}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-800">
                          {msg.clientName}
                        </span>
                        <span className="text-xs text-slate-400">
                          {msg.matterName}
                        </span>
                        {!msg.isRead && (
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {msg.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        {formatRelativeTime(msg.sentAt)}
                      </p>

                      {/* Reply area */}
                      {replyingTo === msg.id ? (
                        <div className="mt-3 space-y-2">
                          <Textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your reply..."
                            className="text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText("");
                              }}
                            >
                              <Send className="mr-1 h-3 w-3" />
                              Send Reply
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-xs"
                          onClick={() => setReplyingTo(msg.id)}
                        >
                          <MessageSquare className="mr-1 h-3 w-3" />
                          Reply
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

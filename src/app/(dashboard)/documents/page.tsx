"use client";

import { useState } from "react";
import {
  Search,
  Upload,
  FileText,
  File,
  FileImage,
  Grid3X3,
  List,
  Eye,
  Download,
  MoreHorizontal,
  X,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { DOCUMENT_TYPES } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Document {
  id: string;
  filename: string;
  type: string;
  matterName: string;
  matterId: string;
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  tags: string[];
  clientVisible: boolean;
  description: string;
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const demoDocuments: Document[] = [
  {
    id: "1",
    filename: "I-797C_Receipt_Notice_Rodriguez.pdf",
    type: "receipt-notice",
    matterName: "Rodriguez - Adjustment of Status",
    matterId: "m1",
    uploadedBy: "Sarah Chen",
    uploadedAt: "2026-03-07T14:30:00Z",
    size: "245 KB",
    tags: ["USCIS", "I-485"],
    clientVisible: true,
    description: "Receipt notice for I-485 filing",
  },
  {
    id: "2",
    filename: "Passport_Scan_Patel.pdf",
    type: "identification",
    matterName: "Patel - H-1B Extension",
    matterId: "m2",
    uploadedBy: "Maria Lopez",
    uploadedAt: "2026-03-06T10:15:00Z",
    size: "1.2 MB",
    tags: ["Passport", "Identity"],
    clientVisible: false,
    description: "Indian passport bio page scan",
  },
  {
    id: "3",
    filename: "I-130_Petition_Herrera.pdf",
    type: "government-form",
    matterName: "Herrera - Family Based",
    matterId: "m3",
    uploadedBy: "Sarah Chen",
    uploadedAt: "2026-03-05T16:00:00Z",
    size: "890 KB",
    tags: ["I-130", "Family"],
    clientVisible: true,
    description: "Completed I-130 petition for review",
  },
  {
    id: "4",
    filename: "Employer_Support_Letter_Wei.pdf",
    type: "support-letter",
    matterName: "Wei - H-1B Transfer",
    matterId: "m4",
    uploadedBy: "James Wilson",
    uploadedAt: "2026-03-04T09:45:00Z",
    size: "156 KB",
    tags: ["Employment", "Support"],
    clientVisible: true,
    description: "Employer support letter for H-1B transfer",
  },
  {
    id: "5",
    filename: "Birth_Certificate_Translation_Garcia.pdf",
    type: "translation",
    matterName: "Garcia - Asylum",
    matterId: "m5",
    uploadedBy: "Maria Lopez",
    uploadedAt: "2026-03-03T11:20:00Z",
    size: "320 KB",
    tags: ["Translation", "Certified", "Spanish"],
    clientVisible: false,
    description: "Certified English translation of birth certificate",
  },
  {
    id: "6",
    filename: "I-765_EAD_Application_Patel.pdf",
    type: "government-form",
    matterName: "Patel - H-1B Extension",
    matterId: "m2",
    uploadedBy: "Sarah Chen",
    uploadedAt: "2026-03-02T15:30:00Z",
    size: "675 KB",
    tags: ["EAD", "I-765"],
    clientVisible: true,
    description: "Employment authorization document application",
  },
  {
    id: "7",
    filename: "Country_Conditions_Report_Garcia.pdf",
    type: "evidence",
    matterName: "Garcia - Asylum",
    matterId: "m5",
    uploadedBy: "James Wilson",
    uploadedAt: "2026-03-01T13:00:00Z",
    size: "2.4 MB",
    tags: ["Evidence", "Country Conditions", "Guatemala"],
    clientVisible: false,
    description: "Country conditions expert report for asylum case",
  },
  {
    id: "8",
    filename: "Financial_Affidavit_Rodriguez.pdf",
    type: "financial",
    matterName: "Rodriguez - Adjustment of Status",
    matterId: "m1",
    uploadedBy: "Maria Lopez",
    uploadedAt: "2026-02-28T10:00:00Z",
    size: "430 KB",
    tags: ["I-864", "Financial"],
    clientVisible: true,
    description: "Affidavit of support with tax returns",
  },
  {
    id: "9",
    filename: "RFE_Response_Herrera.pdf",
    type: "correspondence",
    matterName: "Herrera - Family Based",
    matterId: "m3",
    uploadedBy: "Sarah Chen",
    uploadedAt: "2026-02-27T16:45:00Z",
    size: "1.8 MB",
    tags: ["RFE", "Response"],
    clientVisible: true,
    description: "Complete RFE response package",
  },
  {
    id: "10",
    filename: "Medical_Exam_I693_Petrov.pdf",
    type: "medical",
    matterName: "Petrov - L-1 Extension",
    matterId: "m6",
    uploadedBy: "Maria Lopez",
    uploadedAt: "2026-02-25T09:30:00Z",
    size: "520 KB",
    tags: ["I-693", "Medical"],
    clientVisible: false,
    description: "Sealed medical examination form",
  },
];

const demoMatters = [
  { id: "m1", name: "Rodriguez - Adjustment of Status" },
  { id: "m2", name: "Patel - H-1B Extension" },
  { id: "m3", name: "Herrera - Family Based" },
  { id: "m4", name: "Wei - H-1B Transfer" },
  { id: "m5", name: "Garcia - Asylum" },
  { id: "m6", name: "Petrov - L-1 Extension" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDocTypeLabel(value: string): string {
  return DOCUMENT_TYPES.find((t) => t.value === value)?.label ?? value;
}

function getDocTypeBadgeColor(value: string): string {
  const map: Record<string, string> = {
    "receipt-notice": "bg-teal-100 text-teal-800",
    "approval-notice": "bg-green-100 text-green-800",
    "government-form": "bg-blue-100 text-blue-800",
    identification: "bg-purple-100 text-purple-800",
    evidence: "bg-amber-100 text-amber-800",
    "support-letter": "bg-indigo-100 text-indigo-800",
    translation: "bg-cyan-100 text-cyan-800",
    correspondence: "bg-slate-100 text-slate-800",
    financial: "bg-emerald-100 text-emerald-800",
    medical: "bg-pink-100 text-pink-800",
    pleading: "bg-red-100 text-red-800",
    rfe: "bg-orange-100 text-orange-800",
  };
  return map[value] ?? "bg-slate-100 text-slate-800";
}

function fileIcon(filename: string) {
  if (filename.match(/\.(jpg|jpeg|png|gif|webp)$/i))
    return <FileImage className="h-5 w-5 text-purple-500" />;
  if (filename.match(/\.pdf$/i))
    return <FileText className="h-5 w-5 text-red-500" />;
  return <File className="h-5 w-5 text-slate-400" />;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [matterFilter, setMatterFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>(demoDocuments);

  // Upload form state
  const [uploadMatter, setUploadMatter] = useState("");
  const [uploadType, setUploadType] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadTags, setUploadTags] = useState("");
  const [uploadClientVisible, setUploadClientVisible] = useState(false);

  // Filters
  const filteredDocuments = documents.filter((doc) => {
    if (
      searchQuery &&
      !doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !doc.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    if (typeFilter && doc.type !== typeFilter) return false;
    if (matterFilter && doc.matterId !== matterFilter) return false;
    if (dateFrom && doc.uploadedAt < dateFrom) return false;
    if (dateTo && doc.uploadedAt > dateTo + "T23:59:59Z") return false;
    return true;
  });

  function toggleClientVisible(docId: string) {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId ? { ...d, clientVisible: !d.clientVisible } : d
      )
    );
  }

  function resetUploadForm() {
    setUploadMatter("");
    setUploadType("");
    setUploadDescription("");
    setUploadTags("");
    setUploadClientVisible(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
          <p className="text-sm text-slate-500">
            Manage case documents and files
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs text-slate-500 mb-1 block">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-48">
              <Label className="text-xs text-slate-500 mb-1 block">
                Document Type
              </Label>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-48">
              <Label className="text-xs text-slate-500 mb-1 block">
                Matter
              </Label>
              <Select
                value={matterFilter}
                onChange={(e) => setMatterFilter(e.target.value)}
              >
                <option value="">All Matters</option>
                {demoMatters.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-36">
              <Label className="text-xs text-slate-500 mb-1 block">
                Date From
              </Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="w-36">
              <Label className="text-xs text-slate-500 mb-1 block">
                Date To
              </Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            {/* View toggle */}
            <div className="flex rounded-md border border-slate-200">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-l-md transition-colors",
                  viewMode === "list"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                <List className="h-3.5 w-3.5" />
                List
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-r-md transition-colors",
                  viewMode === "grid"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                <Grid3X3 className="h-3.5 w-3.5" />
                Grid
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <p className="text-sm text-slate-500">
        Showing {filteredDocuments.length} of {documents.length} documents
      </p>

      {/* List view */}
      {viewMode === "list" && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filename</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Matter</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-center">Client Visible</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {fileIcon(doc.filename)}
                      <span className="font-medium text-slate-800 truncate max-w-[250px]">
                        {doc.filename}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        getDocTypeBadgeColor(doc.type)
                      )}
                    >
                      {getDocTypeLabel(doc.type)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 max-w-[180px] truncate">
                    {doc.matterName}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {doc.uploadedBy}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                    {formatDate(doc.uploadedAt)}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {doc.size}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => toggleClientVisible(doc.id)}
                      className={cn(
                        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                        doc.clientVisible ? "bg-green-500" : "bg-slate-300"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
                          doc.clientVisible
                            ? "translate-x-[18px]"
                            : "translate-x-[3px]"
                        )}
                      />
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button className="p-1 hover:bg-slate-100 rounded">
                        <Eye className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                      <button className="p-1 hover:bg-slate-100 rounded">
                        <Download className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredDocuments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <p className="text-sm text-slate-500">
                      No documents match your filters.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Grid view */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDocuments.map((doc) => (
            <Card
              key={doc.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-slate-50">
                    {fileIcon(doc.filename)}
                  </div>
                  <p className="text-sm font-medium text-slate-800 truncate w-full">
                    {doc.filename}
                  </p>
                  <span
                    className={cn(
                      "mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      getDocTypeBadgeColor(doc.type)
                    )}
                  >
                    {getDocTypeLabel(doc.type)}
                  </span>
                  <p className="mt-2 text-xs text-slate-500">
                    {formatDate(doc.uploadedAt)}
                  </p>
                  <p className="text-xs text-slate-400">{doc.size}</p>
                  <div className="mt-2 flex flex-wrap justify-center gap-1">
                    {doc.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredDocuments.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-sm text-slate-500">
                No documents match your filters.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Upload dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a new document and attach it to a matter.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* File input */}
            <div>
              <Label htmlFor="file">Select File</Label>
              <Input id="file" type="file" className="mt-1" />
            </div>
            {/* Matter */}
            <div>
              <Label htmlFor="upload-matter">Matter</Label>
              <Select
                id="upload-matter"
                value={uploadMatter}
                onChange={(e) => setUploadMatter(e.target.value)}
                className="mt-1"
              >
                <option value="">Select matter...</option>
                {demoMatters.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </div>
            {/* Document type */}
            <div>
              <Label htmlFor="upload-type">Document Type</Label>
              <Select
                id="upload-type"
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
                className="mt-1"
              >
                <option value="">Select type...</option>
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>
            {/* Description */}
            <div>
              <Label htmlFor="upload-desc">Description</Label>
              <Textarea
                id="upload-desc"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Brief description of the document..."
                className="mt-1"
              />
            </div>
            {/* Tags */}
            <div>
              <Label htmlFor="upload-tags">Tags</Label>
              <Input
                id="upload-tags"
                value={uploadTags}
                onChange={(e) => setUploadTags(e.target.value)}
                placeholder="Comma-separated tags (e.g. USCIS, I-485)"
                className="mt-1"
              />
            </div>
            {/* Client visible toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setUploadClientVisible(!uploadClientVisible)}
                className={cn(
                  "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                  uploadClientVisible ? "bg-green-500" : "bg-slate-300"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
                    uploadClientVisible
                      ? "translate-x-[18px]"
                      : "translate-x-[3px]"
                  )}
                />
              </button>
              <Label className="text-sm cursor-pointer">
                Visible to client on portal
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUploadDialogOpen(false);
                resetUploadForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setUploadDialogOpen(false);
                resetUploadForm();
              }}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

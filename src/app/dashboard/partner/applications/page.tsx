"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Application = {
  id: number;
  applicantFullName: string;
  applicantEmail: string;
  applicantPhone: string | null;
  applicantCountry: string | null;
  studentProfileSummary: string | null;
  submittedDocuments: Array<{ name?: string; url?: string } | string> | null;
  status: string;
  requestMessage: string | null;
  partnerNotes: string | null;
  updatedAt: string;
  partnerProgram: {
    id: number;
    title: string;
    degreeType: string;
    status: string;
  };
};

const statuses = ["all", "pending", "documents_requested", "under_review", "accepted", "rejected"];

export default function PartnerApplicationsPage() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Application | null>(null);
  const [draftStatus, setDraftStatus] = useState("pending");
  const [requestMessage, setRequestMessage] = useState("");
  const [partnerNotes, setPartnerNotes] = useState("");

  const loadApplications = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/partner/applications");
    if (response.ok) {
      setApplications(await response.json());
    } else {
      toast({ title: "Failed to load applications", variant: "destructive" });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const filtered = useMemo(() => {
    return applications.filter((application) => {
      const matchesStatus = statusFilter === "all" || application.status === statusFilter;
      const matchesSearch = `${application.applicantFullName} ${application.applicantEmail} ${application.partnerProgram.title}`
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [applications, search, statusFilter]);

  function openApplication(application: Application) {
    setSelected(application);
    setDraftStatus(application.status);
    setRequestMessage(application.requestMessage || "");
    setPartnerNotes(application.partnerNotes || "");
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);

    const response = await fetch(`/api/partner/applications/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: draftStatus,
        requestMessage,
        partnerNotes,
      }),
    });

    if (response.ok) {
      const updated = await response.json();
      setApplications((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setSelected(updated);
      toast({ title: "Application updated" });
    } else {
      const data = await response.json().catch(() => null);
      toast({ title: data?.error || "Failed to update application", variant: "destructive" });
    }

    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <Card className="border-blue-100 shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle>Applications</CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  className="w-52 text-sm outline-none"
                  placeholder="Search applications..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item === "all" ? "All statuses" : item.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-14">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
              No applications match the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-950">{application.applicantFullName}</p>
                          <p className="text-sm text-slate-500">{application.applicantEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{application.partnerProgram.title}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-700">{application.status.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>{application.applicantCountry || "-"}</TableCell>
                      <TableCell>{new Date(application.updatedAt).toLocaleDateString("en-GB")}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => openApplication(application)}>
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Review</DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-blue-100">
                  <CardContent className="space-y-3 p-5">
                    <h3 className="font-semibold text-slate-950">Student Summary</h3>
                    <div className="space-y-2 text-sm text-slate-600">
                      <p><span className="font-medium text-slate-950">Name:</span> {selected.applicantFullName}</p>
                      <p><span className="font-medium text-slate-950">Email:</span> {selected.applicantEmail}</p>
                      <p><span className="font-medium text-slate-950">Phone:</span> {selected.applicantPhone || "-"}</p>
                      <p><span className="font-medium text-slate-950">Country:</span> {selected.applicantCountry || "-"}</p>
                      <p><span className="font-medium text-slate-950">Program:</span> {selected.partnerProgram.title}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                      {selected.studentProfileSummary || "No student profile summary was submitted."}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-100">
                  <CardContent className="space-y-3 p-5">
                    <h3 className="font-semibold text-slate-950">Submitted Documents</h3>
                    {Array.isArray(selected.submittedDocuments) && selected.submittedDocuments.length > 0 ? (
                      <div className="space-y-2">
                        {selected.submittedDocuments.map((item, index) => {
                          const documentName = typeof item === "string" ? `Document ${index + 1}` : item.name || `Document ${index + 1}`;
                          const documentUrl = typeof item === "string" ? item : item.url;

                          return documentUrl ? (
                            <a
                              key={`${documentName}-${index}`}
                              href={documentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-blue-700 hover:bg-blue-50"
                            >
                              <FileText className="h-4 w-4" />
                              {documentName}
                            </a>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                        No documents are available for this application.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Decision Status</Label>
                  <Select value={draftStatus} onValueChange={setDraftStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="documents_requested">Request More Documents</SelectItem>
                      <SelectItem value="under_review">Mark Under Review</SelectItem>
                      <SelectItem value="accepted">Accept</SelectItem>
                      <SelectItem value="rejected">Reject</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Request Message</Label>
                  <Textarea rows={3} value={requestMessage} onChange={(e) => setRequestMessage(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Partner Notes</Label>
                <Textarea rows={5} value={partnerNotes} onChange={(e) => setPartnerNotes(e.target.value)} />
              </div>

              <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Decision"
                )}
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

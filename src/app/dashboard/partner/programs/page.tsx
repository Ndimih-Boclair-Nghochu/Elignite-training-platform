"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Edit2, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type PartnerProgram = {
  id: number;
  title: string;
  description: string;
  degreeType: string;
  duration: string;
  tuitionFee: number;
  currency: string;
  intakeDates: string | null;
  admissionRequirements: string | null;
  requiredDocuments: string | null;
  languageRequirements: string | null;
  applicationDeadline: string | null;
  availableSeats: number | null;
  status: string;
  _count?: { applications: number };
};

const blankProgram = {
  title: "",
  description: "",
  degreeType: "",
  duration: "",
  tuitionFee: "",
  currency: "USD",
  intakeDates: "",
  admissionRequirements: "",
  requiredDocuments: "",
  languageRequirements: "",
  applicationDeadline: "",
  availableSeats: "",
  status: "draft",
};

const statusOptions = ["all", "draft", "pending_review", "approved", "rejected", "closed"];

export default function PartnerProgramsPage() {
  const { toast } = useToast();
  const [programs, setPrograms] = useState<PartnerProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PartnerProgram | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm] = useState(blankProgram);

  const loadPrograms = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/partner/programs");
    if (response.ok) {
      setPrograms(await response.json());
    } else {
      toast({ title: "Failed to load programs", variant: "destructive" });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  const filtered = useMemo(() => {
    return programs.filter((program) => {
      const matchesStatus = statusFilter === "all" || program.status === statusFilter;
      const matchesSearch = `${program.title} ${program.degreeType} ${program.description}`
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [programs, search, statusFilter]);

  function resetForm() {
    setEditing(null);
    setForm(blankProgram);
  }

  function openEdit(program: PartnerProgram) {
    setEditing(program);
    setForm({
      title: program.title,
      description: program.description,
      degreeType: program.degreeType,
      duration: program.duration,
      tuitionFee: String(program.tuitionFee),
      currency: program.currency,
      intakeDates: program.intakeDates || "",
      admissionRequirements: program.admissionRequirements || "",
      requiredDocuments: program.requiredDocuments || "",
      languageRequirements: program.languageRequirements || "",
      applicationDeadline: program.applicationDeadline ? program.applicationDeadline.slice(0, 10) : "",
      availableSeats: program.availableSeats !== null ? String(program.availableSeats) : "",
      status: program.status,
    });
    setOpen(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);

    const response = await fetch(editing ? `/api/partner/programs/${editing.id}` : "/api/partner/programs", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (response.ok) {
      toast({ title: editing ? "Program updated" : "Program created" });
      setOpen(false);
      resetForm();
      loadPrograms();
    } else {
      const data = await response.json().catch(() => null);
      toast({ title: data?.error || "Failed to save program", variant: "destructive" });
    }

    setSaving(false);
  }

  async function handleDelete(program: PartnerProgram) {
    if (!window.confirm(`Delete "${program.title}"?\n\nThis removes the program and its partner-side application records.`)) {
      return;
    }

    const response = await fetch(`/api/partner/programs/${program.id}`, { method: "DELETE" });
    if (response.ok) {
      toast({ title: "Program deleted" });
      loadPrograms();
    } else {
      const data = await response.json().catch(() => null);
      toast({ title: data?.error || "Failed to delete program", variant: "destructive" });
    }
  }

  async function handleDuplicate(program: PartnerProgram) {
    const response = await fetch(`/api/partner/programs/${program.id}/duplicate`, { method: "POST" });
    if (response.ok) {
      toast({ title: "Program duplicated" });
      loadPrograms();
    } else {
      toast({ title: "Failed to duplicate program", variant: "destructive" });
    }
  }

  async function moveToReview(program: PartnerProgram) {
    const response = await fetch(`/api/partner/programs/${program.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "pending_review" }),
    });
    if (response.ok) {
      toast({ title: "Program sent for review" });
      loadPrograms();
    } else {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-blue-100 shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle>Programs</CardTitle>
            <Dialog
              open={open}
              onOpenChange={(next) => {
                setOpen(next);
                if (!next) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Program
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit Program" : "Create Program"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Program Title</Label>
                      <Input value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Degree / Certificate Type</Label>
                      <Input value={form.degreeType} onChange={(e) => setForm((current) => ({ ...current, degreeType: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Input value={form.duration} onChange={(e) => setForm((current) => ({ ...current, duration: e.target.value }))} required />
                    </div>
                    <div className="grid grid-cols-[1fr_110px] gap-3">
                      <div className="space-y-2">
                        <Label>Tuition Fee</Label>
                        <Input type="number" value={form.tuitionFee} onChange={(e) => setForm((current) => ({ ...current, tuitionFee: e.target.value }))} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <Input value={form.currency} onChange={(e) => setForm((current) => ({ ...current, currency: e.target.value.toUpperCase() }))} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Intake Dates</Label>
                      <Input value={form.intakeDates} onChange={(e) => setForm((current) => ({ ...current, intakeDates: e.target.value }))} placeholder="September, January" />
                    </div>
                    <div className="space-y-2">
                      <Label>Application Deadline</Label>
                      <Input type="date" value={form.applicationDeadline} onChange={(e) => setForm((current) => ({ ...current, applicationDeadline: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Available Seats</Label>
                      <Input type="number" value={form.availableSeats} onChange={(e) => setForm((current) => ({ ...current, availableSeats: e.target.value }))} />
                    </div>
                    {editing ? (
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={form.status} onValueChange={(value) => setForm((current) => ({ ...current, status: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="pending_review">Pending Review</SelectItem>
                            <SelectItem value="approved" disabled>Approved</SelectItem>
                            <SelectItem value="rejected" disabled>Rejected</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea rows={4} value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Admission Requirements</Label>
                    <Textarea rows={4} value={form.admissionRequirements} onChange={(e) => setForm((current) => ({ ...current, admissionRequirements: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Required Documents</Label>
                    <Textarea rows={4} value={form.requiredDocuments} onChange={(e) => setForm((current) => ({ ...current, requiredDocuments: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Language Requirements</Label>
                    <Textarea rows={3} value={form.languageRequirements} onChange={(e) => setForm((current) => ({ ...current, languageRequirements: e.target.value }))} />
                  </div>
                  <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editing ? "Save Changes" : "Create Program"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                className="w-52 text-sm outline-none"
                placeholder="Search programs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item === "all" ? "All statuses" : item.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-14">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
              No programs match the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Program</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Tuition</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-950">{program.title}</p>
                          <p className="mt-1 text-xs text-slate-500">{program.duration}</p>
                        </div>
                      </TableCell>
                      <TableCell>{program.degreeType}</TableCell>
                      <TableCell>{program.tuitionFee.toLocaleString()} {program.currency}</TableCell>
                      <TableCell>{program.applicationDeadline ? new Date(program.applicationDeadline).toLocaleDateString("en-GB") : "-"}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-700">{program.status.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>{program._count?.applications || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(program)}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDuplicate(program)}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          {program.status === "draft" ? (
                            <Button size="sm" variant="outline" onClick={() => moveToReview(program)}>
                              Submit
                            </Button>
                          ) : null}
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(program)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

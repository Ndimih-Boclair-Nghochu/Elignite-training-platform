"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, Mail, Phone, Plus, Trash2, Edit2, FileDown, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProgramOption { id: number; programCode: string; title: string; }
interface StaffRow {
  id: number; teacherId: string; matricle?: string;
  specialization?: string; qualifications?: string; office?: string; status: string;
  programs: ProgramOption[];
  user: { id: number; firstName: string; lastName: string; email: string; phone?: string; };
}

const BLANK = { firstName: "", lastName: "", email: "", phone: "", specialization: "", qualifications: "", office: "" };

export default function CeoStaffPage() {
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedProgramIds, setSelectedProgramIds] = useState<number[]>([]);
  const [editProgramIds, setEditProgramIds] = useState<number[]>([]);
  const [form, setForm] = useState({ ...BLANK });
  const [editForm, setEditForm] = useState({ ...BLANK, status: "active" });
  const { toast } = useToast();

  async function fetchStaff() {
    setLoading(true);
    const res = await fetch("/api/teachers");
    if (res.ok) setStaff(await res.json());
    setLoading(false);
  }

  async function fetchPrograms() {
    const res = await fetch("/api/programs");
    if (res.ok) {
      const data = await res.json();
      setPrograms(data.map((p: any) => ({ id: p.id, programCode: p.programCode, title: p.title })));
    }
  }

  useEffect(() => { fetchStaff(); fetchPrograms(); }, []);

  const filtered = staff.filter((t) =>
    `${t.user.firstName} ${t.user.lastName} ${t.user.email} ${t.specialization || ""} ${t.matricle || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  function toggleAdd(id: number) {
    setSelectedProgramIds((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  }

  function toggleEdit(id: number) {
    setEditProgramIds((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  }

  function openEdit(t: StaffRow) {
    setEditingStaff(t);
    setEditForm({ firstName: t.user.firstName, lastName: t.user.lastName, email: t.user.email, phone: t.user.phone || "", specialization: t.specialization || "", qualifications: t.qualifications || "", office: t.office || "", status: t.status });
    setEditProgramIds(t.programs.map((p) => p.id));
    setEditOpen(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/teachers", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, programIds: selectedProgramIds }),
    });
    if (res.ok) {
      toast({ title: "Staff added successfully" });
      setForm({ ...BLANK }); setSelectedProgramIds([]); setAddOpen(false);
      fetchStaff();
    } else {
      const d = await res.json();
      toast({ title: d.error || "Failed to add staff", variant: "destructive" });
    }
    setCreating(false);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingStaff) return;
    setSaving(true);
    const res = await fetch(`/api/teachers/${editingStaff.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, programIds: editProgramIds }),
    });
    if (res.ok) {
      toast({ title: "Staff updated" });
      setEditOpen(false); setEditingStaff(null);
      fetchStaff();
    } else {
      const d = await res.json();
      toast({ title: d.error || "Failed to update", variant: "destructive" });
    }
    setSaving(false);
  }

  async function handleToggleStatus(id: number, newStatus: string) {
    const res = await fetch(`/api/teachers/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
    if (res.ok) { toast({ title: `Staff ${newStatus === "active" ? "reactivated" : "suspended"}` }); fetchStaff(); }
    else { const d = await res.json(); toast({ title: d.error || "Failed to update", variant: "destructive" }); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this teacher from the system?\n\nThis will permanently remove the teacher account, assigned programs, and dashboard access.")) return;
    const res = await fetch(`/api/teachers/${id}`, { method: "DELETE" });
    if (res.ok) { toast({ title: "Staff deleted" }); fetchStaff(); }
    else { const d = await res.json(); toast({ title: d.error || "Failed to delete", variant: "destructive" }); }
  }

  async function handleExportAll() {
    setExporting(true);
    const res = await fetch("/api/teachers/export-pdf");
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `staff-list-${new Date().toISOString().split("T")[0]}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } else { toast({ title: "Export failed", variant: "destructive" }); }
    setExporting(false);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Staff</h1>
          <p className="text-gray-500 text-sm">{staff.length} staff members</p>
        </div>
        <Dialog open={addOpen} onOpenChange={(v) => { setAddOpen(v); if (!v) { setForm({ ...BLANK }); setSelectedProgramIds([]); } }}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Add Staff</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add New Staff</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>First Name *</Label><Input value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} required /></div>
                <div className="space-y-1"><Label>Last Name *</Label><Input value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required /></div>
                <div className="space-y-1"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
              </div>
              <div className="space-y-1"><Label>Specialization</Label><Input value={form.specialization} onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))} placeholder="e.g., Web Development, Data Science" /></div>
              <div className="space-y-1"><Label>Qualifications</Label><Input value={form.qualifications} onChange={(e) => setForm((f) => ({ ...f, qualifications: e.target.value }))} placeholder="e.g., MSc Computer Science" /></div>
              <div className="space-y-1"><Label>Office</Label><Input value={form.office} onChange={(e) => setForm((f) => ({ ...f, office: e.target.value }))} placeholder="e.g., Room 201" /></div>
              <div className="space-y-2">
                <Label>Assign to Programs</Label>
                <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                  {programs.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" checked={selectedProgramIds.includes(p.id)} onChange={() => toggleAdd(p.id)} className="rounded" />
                      <span className="font-mono text-xs text-gray-500">{p.programCode}</span><span>{p.title}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={creating}>{creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Staff"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) setEditingStaff(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Staff — {editingStaff?.teacherId}</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>First Name *</Label><Input value={editForm.firstName} onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))} required /></div>
              <div className="space-y-1"><Label>Last Name *</Label><Input value={editForm.lastName} onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Email *</Label><Input type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} required /></div>
              <div className="space-y-1"><Label>Phone</Label><Input value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} /></div>
            </div>
            <div className="space-y-1"><Label>Specialization</Label><Input value={editForm.specialization} onChange={(e) => setEditForm((f) => ({ ...f, specialization: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Qualifications</Label><Input value={editForm.qualifications} onChange={(e) => setEditForm((f) => ({ ...f, qualifications: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Office</Label><Input value={editForm.office} onChange={(e) => setEditForm((f) => ({ ...f, office: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Status</Label>
              <Select value={editForm.status} onValueChange={(v) => setEditForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Programs</Label>
              <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                {programs.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={editProgramIds.includes(p.id)} onChange={() => toggleEdit(p.id)} className="rounded" />
                    <span className="font-mono text-xs text-gray-500">{p.programCode}</span><span>{p.title}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={saving}>{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle>All Staff</CardTitle>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-white">
                <Search className="h-4 w-4 text-gray-400" />
                <input className="outline-none text-sm w-40" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Button size="sm" variant="outline" onClick={handleExportAll} disabled={exporting}>
                {exporting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Exporting...</> : <><Download className="h-4 w-4 mr-2" />Export PDF</>}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff ID</TableHead>
                    <TableHead>Matricle</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Programs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-sm">{t.teacherId}</TableCell>
                      <TableCell className="font-mono text-sm text-gray-500">{t.matricle || "–"}</TableCell>
                      <TableCell className="font-medium">{t.user.firstName} {t.user.lastName}</TableCell>
                      <TableCell>
                        <div className="text-sm space-y-0.5">
                          <div className="flex items-center gap-1 text-gray-500"><Mail className="h-3 w-3" />{t.user.email}</div>
                          {t.user.phone && <div className="flex items-center gap-1 text-gray-500"><Phone className="h-3 w-3" />{t.user.phone}</div>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{t.specialization || "–"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {t.programs.length > 0
                            ? t.programs.map((p) => <Badge key={p.id} variant="outline" className="text-xs font-mono">{p.programCode}</Badge>)
                            : <span className="text-gray-400 text-xs">None</span>
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.status === "active" ? "default" : "secondary"} className="text-xs capitalize">{t.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="outline" onClick={() => openEdit(t)}><Edit2 className="h-3.5 w-3.5" /></Button>
                          <a href={`/api/teachers/${t.id}/pdf`} download>
                            <Button size="sm" variant="outline"><FileDown className="h-3.5 w-3.5" /></Button>
                          </a>
                          <Button size="sm" variant={t.status === "active" ? "secondary" : "default"} onClick={() => handleToggleStatus(t.id, t.status === "active" ? "inactive" : "active")}>
                            {t.status === "active" ? "Suspend" : "Activate"}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(t.id)}>
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-gray-400 py-8">No staff found</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

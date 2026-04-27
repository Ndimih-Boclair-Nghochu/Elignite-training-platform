"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Loader2, Download, Edit2, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProgramOption { id: number; programCode: string; title: string; duration?: string; }
interface Student {
  id: number; studentId: string; firstName: string; lastName: string; email: string; phone: string;
  program: string; programs: ProgramOption[]; level: number; status: string; gender: string;
  address?: string; parentName?: string; parentPhone?: string;
  feeDue: number; paidAmount: number; totalFeeAmount: number; isActivated: boolean;
}

const BLANK_FORM = { firstName: "", lastName: "", email: "", phone: "", gender: "male", address: "", parentName: "", parentPhone: "" };

export default function CeoStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedProgramIds, setSelectedProgramIds] = useState<number[]>([]);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [editForm, setEditForm] = useState({ ...BLANK_FORM, status: "active" });
  const [editProgramIds, setEditProgramIds] = useState<number[]>([]);
  const { toast } = useToast();

  async function fetchStudents() {
    setFetching(true);
    const res = await fetch("/api/students");
    if (res.ok) setStudents(await res.json());
    setFetching(false);
  }

  async function fetchPrograms() {
    const res = await fetch("/api/programs");
    if (res.ok) {
      const data = await res.json();
      setPrograms(data.map((p: any) => ({ id: p.id, programCode: p.programCode, title: p.title, duration: p.duration })));
    }
  }

  useEffect(() => { fetchStudents(); fetchPrograms(); }, []);

  const filtered = students.filter((s) => {
    const matchesSearch = `${s.firstName} ${s.lastName} ${s.email} ${s.studentId}`.toLowerCase().includes(search.toLowerCase());
    const matchesProgram = programFilter === "all" || (s.programs && s.programs.some((p) => p.id === Number(programFilter)));
    return matchesSearch && matchesProgram;
  });

  function toggleProgramAdd(id: number) {
    setSelectedProgramIds((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 2) { toast({ title: "Max 2 programs", variant: "destructive" }); return prev; }
      return [...prev, id];
    });
  }

  function toggleProgramEdit(id: number) {
    setEditProgramIds((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 2) { toast({ title: "Max 2 programs", variant: "destructive" }); return prev; }
      return [...prev, id];
    });
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (selectedProgramIds.length === 0) { toast({ title: "Select at least one program", variant: "destructive" }); return; }
    setLoading(true);
    const res = await fetch("/api/students", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, programIds: selectedProgramIds }),
    });
    if (res.ok) {
      toast({ title: "Student added successfully" });
      setAddOpen(false); setForm({ ...BLANK_FORM }); setSelectedProgramIds([]);
      fetchStudents();
    } else {
      const d = await res.json();
      toast({ title: d.error || "Failed to add student", variant: "destructive" });
    }
    setLoading(false);
  }

  function openEdit(s: Student) {
    setEditingStudent(s);
    setEditForm({ firstName: s.firstName, lastName: s.lastName, email: s.email, phone: s.phone || "", gender: s.gender || "male", address: s.address || "", parentName: s.parentName || "", parentPhone: s.parentPhone || "", status: s.status });
    setEditProgramIds(s.programs.map((p) => p.id));
    setEditOpen(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingStudent) return;
    setLoading(true);
    const res = await fetch(`/api/students/${editingStudent.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, programIds: editProgramIds.length > 0 ? editProgramIds : undefined }),
    });
    if (res.ok) {
      toast({ title: "Student updated" });
      setEditOpen(false); setEditingStudent(null);
      fetchStudents();
    } else {
      const d = await res.json();
      toast({ title: d.error || "Failed to update", variant: "destructive" });
    }
    setLoading(false);
  }

  async function handleExportAll() {
    setExporting(true);
    try {
      const res = await fetch("/api/students/export-pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ program: programFilter, search }) });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `students-list-${new Date().toISOString().split("T")[0]}.html`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast({ title: "Export failed", variant: "destructive" }); }
    setExporting(false);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 text-sm">{students.length} total students</p>
        </div>
        <Dialog open={addOpen} onOpenChange={(v) => { setAddOpen(v); if (!v) { setForm({ ...BLANK_FORM }); setSelectedProgramIds([]); } }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Student</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add New Student</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>First Name *</Label><Input value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} required /></div>
                <div className="space-y-1"><Label>Last Name *</Label><Input value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} required /></div>
              </div>
              <div className="space-y-1"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required /></div>
              <div className="space-y-1"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
              <div className="space-y-2">
                <Label>Programs * <span className="text-xs text-gray-400">(up to 2)</span></Label>
                <div className="border rounded-md p-3 space-y-2 max-h-36 overflow-y-auto">
                  {programs.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" checked={selectedProgramIds.includes(p.id)} onChange={() => toggleProgramAdd(p.id)} className="rounded" />
                      <span className="font-mono text-xs text-gray-500">{p.programCode}</span><span>{p.title}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-1"><Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Parent Name</Label><Input value={form.parentName} onChange={(e) => setForm((f) => ({ ...f, parentName: e.target.value }))} /></div>
                <div className="space-y-1"><Label>Parent Phone</Label><Input value={form.parentPhone} onChange={(e) => setForm((f) => ({ ...f, parentPhone: e.target.value }))} /></div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : "Add Student"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) setEditingStudent(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Student — {editingStudent?.studentId}</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>First Name *</Label><Input value={editForm.firstName} onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))} required /></div>
              <div className="space-y-1"><Label>Last Name *</Label><Input value={editForm.lastName} onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))} required /></div>
            </div>
            <div className="space-y-1"><Label>Email *</Label><Input type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} required /></div>
            <div className="space-y-1"><Label>Phone</Label><Input value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} /></div>
            <div className="space-y-2">
              <Label>Programs <span className="text-xs text-gray-400">(up to 2)</span></Label>
              <div className="border rounded-md p-3 space-y-2 max-h-36 overflow-y-auto">
                {programs.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={editProgramIds.includes(p.id)} onChange={() => toggleProgramEdit(p.id)} className="rounded" />
                    <span className="font-mono text-xs text-gray-500">{p.programCode}</span><span>{p.title}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Gender</Label>
                <Select value={editForm.gender} onValueChange={(v) => setEditForm((f) => ({ ...f, gender: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Status</Label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="suspended">Suspended</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1"><Label>Address</Label><Input value={editForm.address} onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Parent Name</Label><Input value={editForm.parentName} onChange={(e) => setEditForm((f) => ({ ...f, parentName: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Parent Phone</Label><Input value={editForm.parentPhone} onChange={(e) => setEditForm((f) => ({ ...f, parentPhone: e.target.value }))} /></div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle>All Students</CardTitle>
            <div className="flex items-center gap-3 flex-wrap">
              <Select value={programFilter} onValueChange={setProgramFilter}>
                <SelectTrigger className="w-44 h-8 text-sm"><SelectValue placeholder="All Programs" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {programs.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.programCode} — {p.title}</SelectItem>)}
                </SelectContent>
              </Select>
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
          {fetching ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Programs</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-sm">{s.studentId}</TableCell>
                      <TableCell className="font-medium">{s.firstName} {s.lastName}</TableCell>
                      <TableCell className="text-gray-500 text-sm">{s.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {s.programs && s.programs.length > 0
                            ? s.programs.map((p) => <Badge key={p.id} variant="outline" className="text-xs font-mono">{p.programCode}</Badge>)
                            : <span className="text-gray-400 text-xs">{s.program || "—"}</span>
                          }
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {s.programs && s.programs.length > 0
                          ? s.programs.map((p) => (p as any).duration).filter(Boolean).join(" / ") || "—"
                          : "—"
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={s.status === "active" ? "default" : "secondary"} className="text-xs capitalize">{s.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="outline" onClick={() => openEdit(s)}><Edit2 className="h-3.5 w-3.5" /></Button>
                          <a href={`/api/students/${s.id}/pdf`} download>
                            <Button size="sm" variant="outline"><FileDown className="h-3.5 w-3.5" /></Button>
                          </a>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-gray-400 py-8">No students found</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

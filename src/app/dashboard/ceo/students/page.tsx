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
import { Plus, Search, Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProgramOption {
  id: number;
  programCode: string;
  title: string;
}

interface Student {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  program: string;
  programs: ProgramOption[];
  level: number;
  status: string;
  gender: string;
  feeDue: number;
  paidAmount: number;
  totalFeeAmount: number;
  isActivated: boolean;
}

export default function CeoStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedProgramIds, setSelectedProgramIds] = useState<number[]>([]);
  const { toast } = useToast();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    level: "1",
    gender: "male",
    address: "",
    parentName: "",
    parentPhone: "",
  });

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
      setPrograms(data.map((p: any) => ({ id: p.id, programCode: p.programCode, title: p.title })));
    }
  }

  useEffect(() => {
    fetchStudents();
    fetchPrograms();
  }, []);

  const filtered = students.filter((s) => {
    const matchesSearch = `${s.firstName} ${s.lastName} ${s.email} ${s.studentId}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesProgram =
      programFilter === "all" ||
      (s.programs && s.programs.some((p) => p.id === Number(programFilter)));
    return matchesSearch && matchesProgram;
  });

  function toggleProgram(id: number) {
    setSelectedProgramIds((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 2) {
        toast({ title: "A student can follow up to 2 programs", variant: "destructive" });
        return prev;
      }
      return [...prev, id];
    });
  }

  function resetForm() {
    setForm({ firstName: "", lastName: "", email: "", phone: "", level: "1", gender: "male", address: "", parentName: "", parentPhone: "" });
    setSelectedProgramIds([]);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (selectedProgramIds.length === 0) {
      toast({ title: "Please select at least one program", variant: "destructive" });
      return;
    }
    setLoading(true);
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, level: Number(form.level), programIds: selectedProgramIds }),
    });
    if (res.ok) {
      toast({ title: "Student added successfully" });
      setOpen(false);
      resetForm();
      fetchStudents();
    } else {
      const d = await res.json();
      toast({ title: d.error || "Failed to add student", variant: "destructive" });
    }
    setLoading(false);
  }

  async function handleExportPDF() {
    try {
      setExporting(true);
      const response = await fetch("/api/students/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ program: programFilter, search }),
      });
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `students-list-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "Students exported as PDF" });
    } catch {
      toast({ title: "Error exporting PDF", description: "Failed to generate PDF", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 text-sm">{students.length} total students</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Student</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add New Student</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>First Name *</Label>
                  <Input value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} required />
                </div>
                <div className="space-y-1">
                  <Label>Last Name *</Label>
                  <Input value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} required />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label>Programs * <span className="text-xs text-gray-400">(select up to 2)</span></Label>
                {programs.length === 0 ? (
                  <p className="text-sm text-gray-400">No programs available yet. Add programs first.</p>
                ) : (
                  <div className="border rounded-md p-3 space-y-2 max-h-36 overflow-y-auto">
                    {programs.map((prog) => (
                      <label key={prog.id} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedProgramIds.includes(prog.id)}
                          onChange={() => toggleProgram(prog.id)}
                          className="rounded"
                        />
                        <span className="font-mono text-xs text-gray-500">{prog.programCode}</span>
                        <span>{prog.title}</span>
                      </label>
                    ))}
                  </div>
                )}
                {selectedProgramIds.length > 0 && (
                  <p className="text-xs text-gray-500">{selectedProgramIds.length}/2 program(s) selected</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Level</Label>
                  <Select value={form.level} onValueChange={(v) => setForm((f) => ({ ...f, level: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{[1,2,3,4,5].map((l) => <SelectItem key={l} value={String(l)}>Level {l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Gender</Label>
                  <Select value={form.gender} onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Parent Name</Label>
                  <Input value={form.parentName} onChange={(e) => setForm((f) => ({ ...f, parentName: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Parent Phone</Label>
                  <Input value={form.parentPhone} onChange={(e) => setForm((f) => ({ ...f, parentPhone: e.target.value }))} />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : "Add Student"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle>All Students</CardTitle>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-44">
                <Select value={programFilter} onValueChange={setProgramFilter}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="All Programs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programs</SelectItem>
                    {programs.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.programCode} — {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-48 border rounded-lg px-3 py-1.5 bg-white flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  className="outline-none text-sm flex-1"
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button size="sm" variant="outline" onClick={handleExportPDF} disabled={exporting}>
                {exporting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Exporting...</>
                ) : (
                  <><Download className="h-4 w-4 mr-2" />Export PDF</>
                )}
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
                    <TableHead>Level</TableHead>
                    <TableHead>Status</TableHead>
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
                          {s.programs && s.programs.length > 0 ? (
                            s.programs.map((p) => (
                              <Badge key={p.id} variant="outline" className="text-xs font-mono">
                                {p.programCode}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">{s.program || "—"}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>Level {s.level}</TableCell>
                      <TableCell>
                        <Badge variant={s.status === "active" ? "default" : "secondary"} className="text-xs capitalize">
                          {s.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-400 py-8">No students found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

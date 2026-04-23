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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Loader2, Clock, CheckCircle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Student { id: number; studentId: string; firstName: string; lastName: string; email: string; phone: string; program: string; level: number; status: string; }

interface PendingStudent {
  id: number;
  studentId: string;
  matricle: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  program: string;
  level: number;
  approvedAt: string;
  accountCreatedAt: string;
}

const PROGRAMS = [
  { id: "bsc-computer-science", title: "BSc Computer Science" },
  { id: "bsc-business-administration", title: "BSc Business Admin" },
  { id: "bsc-nursing", title: "BSc Nursing" },
  { id: "bsc-education", title: "BSc Education" },
  { id: "hnd-accounting", title: "HND Accounting" },
  { id: "bsc-civil-engineering", title: "BSc Civil Engineering" },
];

export default function CeoStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([]);
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", program: "", level: "1", gender: "male" });

  async function fetchStudents() {
    setFetching(true);
    const res = await fetch("/api/students");
    if (res.ok) setStudents(await res.json());
    setFetching(false);
  }

  async function fetchPendingStudents() {
    const res = await fetch("/api/students/pending-activation");
    if (res.ok) setPendingStudents(await res.json());
  }

  useEffect(() => {
    fetchStudents();
    fetchPendingStudents();
  }, []);

  const filtered = students.filter((s) => {
    const matchesSearch = `${s.firstName} ${s.lastName} ${s.email} ${s.studentId}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesProgram = programFilter === "all" || s.program === programFilter;
    return matchesSearch && matchesProgram;
  });

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, level: Number(form.level) }),
    });
    if (res.ok) {
      toast({ title: "Student added successfully" });
      setOpen(false);
      setForm({ firstName: "", lastName: "", email: "", phone: "", program: "", level: "1", gender: "male" });
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

      if (!response.ok) {
        throw new Error("Export failed");
      }

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
    } catch (error) {
      toast({
        title: "Error exporting PDF",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Student</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add New Student</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1"><Label>First Name</Label><Input value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} required /></div>
                <div className="space-y-1"><Label>Last Name</Label><Input value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} required /></div>
              </div>
              <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required /></div>
              <div className="space-y-1"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
              <div className="space-y-1">
                <Label>Program</Label>
                <Select value={form.program} onValueChange={(v) => setForm((f) => ({ ...f, program: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
                  <SelectContent>{PROGRAMS.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
                </Select>
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
              <p className="text-xs text-gray-400">Default password: <strong>student123</strong> (student can change after login)</p>
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
              <div className="w-40">
                <Label htmlFor="program-filter" className="text-xs text-gray-600 block mb-1">
                  Filter by Program
                </Label>
                <Select value={programFilter} onValueChange={setProgramFilter}>
                  <SelectTrigger id="program-filter" className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programs</SelectItem>
                    {PROGRAMS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title}
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
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportPDF}
                disabled={exporting}
              >
                {exporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </>
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
                    <TableHead className="min-w-[100px]">Student ID</TableHead>
                    <TableHead className="min-w-[150px]">Name</TableHead>
                    <TableHead className="min-w-[200px]">Email</TableHead>
                    <TableHead className="min-w-[150px]">Program</TableHead>
                    <TableHead className="min-w-[80px]">Level</TableHead>
                    <TableHead className="min-w-[80px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-sm">{s.studentId}</TableCell>
                      <TableCell className="font-medium">{s.firstName} {s.lastName}</TableCell>
                      <TableCell className="text-gray-500 text-sm">{s.email}</TableCell>
                      <TableCell className="text-sm">{PROGRAMS.find((p) => p.id === s.program)?.title || s.program}</TableCell>
                      <TableCell>Level {s.level}</TableCell>
                      <TableCell><Badge variant={s.status === "active" ? "default" : "secondary"} className="text-xs capitalize">{s.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-gray-400 py-8">No students found</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

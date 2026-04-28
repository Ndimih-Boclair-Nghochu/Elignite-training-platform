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
import { Download, Edit2, FileDown, Loader2, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProgramOption {
  id: number;
  programCode: string;
  title: string;
  duration?: string;
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
  gender?: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  feeDue: number;
  paidAmount: number;
  totalFeeAmount: number;
  isActivated: boolean;
}

const BLANK_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  gender: "male",
  address: "",
  parentName: "",
  parentPhone: "",
};

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
  const [editProgramIds, setEditProgramIds] = useState<number[]>([]);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [editForm, setEditForm] = useState({ ...BLANK_FORM, status: "active" });
  const { toast } = useToast();

  async function fetchStudents() {
    setFetching(true);
    const res = await fetch("/api/students");
    if (res.ok) {
      setStudents(await res.json());
    }
    setFetching(false);
  }

  async function fetchPrograms() {
    const res = await fetch("/api/programs");
    if (res.ok) {
      const data = await res.json();
      setPrograms(
        data.map((program: any) => ({
          id: program.id,
          programCode: program.programCode,
          title: program.title,
          duration: program.duration,
        }))
      );
    }
  }

  useEffect(() => {
    fetchStudents();
    fetchPrograms();
  }, []);

  const filtered = students.filter((student) => {
    const matchesSearch = `${student.firstName} ${student.lastName} ${student.email} ${student.studentId}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesProgram =
      programFilter === "all" ||
      student.programs.some((program) => String(program.id) === programFilter);

    return matchesSearch && matchesProgram;
  });

  function toggleProgramSelection(
    programId: number,
    setter: React.Dispatch<React.SetStateAction<number[]>>
  ) {
    setter((previous) => {
      if (previous.includes(programId)) {
        return previous.filter((id) => id !== programId);
      }

      if (previous.length >= 2) {
        toast({ title: "A student can only be linked to two programs", variant: "destructive" });
        return previous;
      }

      return [...previous, programId];
    });
  }

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();

    if (selectedProgramIds.length === 0) {
      toast({ title: "Select at least one program", variant: "destructive" });
      return;
    }

    setLoading(true);
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, programIds: selectedProgramIds }),
    });

    if (res.ok) {
      toast({ title: "Student added successfully" });
      setAddOpen(false);
      setForm({ ...BLANK_FORM });
      setSelectedProgramIds([]);
      fetchStudents();
    } else {
      const data = await res.json();
      toast({ title: data.error || "Failed to add student", variant: "destructive" });
    }

    setLoading(false);
  }

  function openEdit(student: Student) {
    setEditingStudent(student);
    setEditForm({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone || "",
      gender: student.gender || "male",
      address: student.address || "",
      parentName: student.parentName || "",
      parentPhone: student.parentPhone || "",
      status: student.status,
    });
    setEditProgramIds(student.programs.map((program) => program.id));
    setEditOpen(true);
  }

  async function handleEdit(event: React.FormEvent) {
    event.preventDefault();
    if (!editingStudent) {
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/students/${editingStudent.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, programIds: editProgramIds }),
    });

    if (res.ok) {
      toast({ title: "Student updated" });
      setEditOpen(false);
      setEditingStudent(null);
      fetchStudents();
    } else {
      const data = await res.json();
      toast({ title: data.error || "Failed to update student", variant: "destructive" });
    }

    setLoading(false);
  }

  async function handleExportReport() {
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
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `students-report-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(anchor);

      toast({ title: "Student report downloaded" });
    } catch (error) {
      toast({
        title: "Error exporting report",
        description: "The PDF report could not be generated.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500">{students.length} total students</p>
        </div>
        <Dialog
          open={addOpen}
          onOpenChange={(open) => {
            setAddOpen(open);
            if (!open) {
              setForm({ ...BLANK_FORM });
              setSelectedProgramIds([]);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>First Name *</Label>
                  <Input value={form.firstName} onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))} required />
                </div>
                <div className="space-y-1">
                  <Label>Last Name *</Label>
                  <Input value={form.lastName} onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))} required />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
              </div>
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>
                  Programs * <span className="text-xs text-gray-400">(up to 2)</span>
                </Label>
                <div className="max-h-36 space-y-2 overflow-y-auto rounded-md border p-3">
                  {programs.map((program) => (
                    <label key={program.id} className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedProgramIds.includes(program.id)}
                        onChange={() => toggleProgramSelection(program.id, setSelectedProgramIds)}
                        className="rounded"
                      />
                      <span className="font-mono text-xs text-gray-500">{program.programCode}</span>
                      <span>{program.title}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(value) => setForm((current) => ({ ...current, gender: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Address</Label>
                <Input value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Parent Name</Label>
                  <Input value={form.parentName} onChange={(event) => setForm((current) => ({ ...current, parentName: event.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Parent Phone</Label>
                  <Input value={form.parentPhone} onChange={(event) => setForm((current) => ({ ...current, parentPhone: event.target.value }))} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Student"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            setEditingStudent(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student - {editingStudent?.studentId}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>First Name *</Label>
                <Input value={editForm.firstName} onChange={(event) => setEditForm((current) => ({ ...current, firstName: event.target.value }))} required />
              </div>
              <div className="space-y-1">
                <Label>Last Name *</Label>
                <Input value={editForm.lastName} onChange={(event) => setEditForm((current) => ({ ...current, lastName: event.target.value }))} required />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Email *</Label>
              <Input type="email" value={editForm.email} onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))} required />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input value={editForm.phone} onChange={(event) => setEditForm((current) => ({ ...current, phone: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>
                Programs <span className="text-xs text-gray-400">(up to 2)</span>
              </Label>
              <div className="max-h-36 space-y-2 overflow-y-auto rounded-md border p-3">
                {programs.map((program) => (
                  <label key={program.id} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editProgramIds.includes(program.id)}
                      onChange={() => toggleProgramSelection(program.id, setEditProgramIds)}
                      className="rounded"
                    />
                    <span className="font-mono text-xs text-gray-500">{program.programCode}</span>
                    <span>{program.title}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Gender</Label>
                <Select value={editForm.gender} onValueChange={(value) => setEditForm((current) => ({ ...current, gender: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={(value) => setEditForm((current) => ({ ...current, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Address</Label>
              <Input value={editForm.address} onChange={(event) => setEditForm((current) => ({ ...current, address: event.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Parent Name</Label>
                <Input value={editForm.parentName} onChange={(event) => setEditForm((current) => ({ ...current, parentName: event.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Parent Phone</Label>
                <Input value={editForm.parentPhone} onChange={(event) => setEditForm((current) => ({ ...current, parentPhone: event.target.value }))} />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle>All Students</CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={programFilter} onValueChange={setProgramFilter}>
                <SelectTrigger className="h-8 w-52 text-sm">
                  <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={String(program.id)}>
                      {program.programCode} - {program.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-1.5">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  className="w-44 text-sm outline-none"
                  placeholder="Search..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <Button size="sm" variant="outline" onClick={handleExportReport} disabled={exporting}>
                {exporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download Full Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {fetching ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
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
                  {filtered.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono text-sm">{student.studentId}</TableCell>
                      <TableCell className="font-medium">
                        {student.firstName} {student.lastName}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{student.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {student.programs.length > 0 ? (
                            student.programs.map((program) => (
                              <Badge key={program.id} variant="outline" className="text-xs font-mono">
                                {program.programCode}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">{student.program || "-"}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {student.programs.map((program) => program.duration).filter(Boolean).join(" / ") || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.status === "active" ? "default" : "secondary"} className="text-xs capitalize">
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="outline" onClick={() => openEdit(student)}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <a href={`/api/students/${student.id}/pdf`} download>
                            <Button size="sm" variant="outline">
                              <FileDown className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-gray-400">
                        No students found
                      </TableCell>
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

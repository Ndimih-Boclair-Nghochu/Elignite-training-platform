"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProgramOption { id: number; programCode: string; title: string; slug: string; }
interface Course {
  id: number; code: string; title: string; credits: number;
  level: number; schedule: string; room: string;
  program: string; programId?: number;
}

export default function TeacherCoursesPage() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [filterProgramId, setFilterProgramId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    code: "", title: "", description: "", credits: "3",
    programId: "", level: "1", semester: "Semester 1",
    year: new Date().getFullYear().toString(), room: "", schedule: "",
  });

  useEffect(() => { fetchPrograms(); fetchCourses(); }, []);

  async function fetchPrograms() {
    const res = await fetch("/api/teachers/programs");
    if (res.ok) setPrograms(await res.json());
  }

  async function fetchCourses() {
    setLoading(true);
    const res = await fetch("/api/courses");
    if (res.ok) setCourses(await res.json());
    setLoading(false);
  }

  const displayed = courses.filter((c) => {
    if (filterProgramId === "all") return true;
    const prog = programs.find((p) => String(p.id) === filterProgramId);
    return c.programId === Number(filterProgramId) || (prog && c.program === prog.slug);
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.programId) {
      toast({ title: "Please select a program", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          programId: Number(form.programId),
          credits: Number(form.credits),
          level: Number(form.level),
          year: Number(form.year),
        }),
      });
      if (res.ok) {
        toast({ title: "Course created successfully" });
        setOpenDialog(false);
        setForm({ code: "", title: "", description: "", credits: "3", programId: "", level: "1", semester: "Semester 1", year: new Date().getFullYear().toString(), room: "", schedule: "" });
        fetchCourses();
      } else {
        const err = await res.json();
        toast({ title: err.error || "Failed to create course", variant: "destructive" });
      }
    } catch {
      toast({ title: "An error occurred", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Courses</h1>
          <p className="text-gray-500 text-sm">{courses.length} courses total</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterProgramId} onValueChange={setFilterProgramId}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="All Programs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              {programs.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  <span className="font-mono text-xs text-gray-400 mr-2">{p.programCode}</span>{p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Create Course</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create New Course</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Course Code *</Label>
                    <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="e.g., CS101" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g., Intro to Programming" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} placeholder="Course overview" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Program *</Label>
                    <Select value={form.programId} onValueChange={(v) => setForm((f) => ({ ...f, programId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select your program" /></SelectTrigger>
                      <SelectContent>
                        {programs.length === 0
                          ? <SelectItem value="" disabled>No programs assigned</SelectItem>
                          : programs.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              <span className="font-mono text-xs text-gray-400 mr-2">{p.programCode}</span>{p.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Level *</Label>
                    <Select value={form.level} onValueChange={(v) => setForm((f) => ({ ...f, level: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{[1,2,3,4,5].map((l) => <SelectItem key={l} value={l.toString()}>Level {l}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Semester *</Label>
                    <Select value={form.semester} onValueChange={(v) => setForm((f) => ({ ...f, semester: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Semester 1">Semester 1</SelectItem>
                        <SelectItem value="Semester 2">Semester 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Year *</Label>
                    <Input type="number" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} min="2024" />
                  </div>
                  <div className="space-y-2">
                    <Label>Credits</Label>
                    <Input type="number" value={form.credits} onChange={(e) => setForm((f) => ({ ...f, credits: e.target.value }))} min="1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Room</Label>
                    <Input value={form.room} onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))} placeholder="e.g., Lab 1" />
                  </div>
                  <div className="space-y-2">
                    <Label>Schedule</Label>
                    <Input value={form.schedule} onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))} placeholder="e.g., Mon/Wed 8-10am" />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={submitting || programs.length === 0}>
                  {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Course"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : displayed.length === 0 ? (
        <Card>
          <CardContent className="pt-8 text-center">
            <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No courses found. Create your first course above.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {displayed.map((c) => {
            const prog = programs.find((p) => p.id === c.programId || p.slug === c.program);
            return (
              <Card key={c.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{c.title}</p>
                      <p className="text-sm text-gray-400">{c.code} · {c.credits} Credits · Level {c.level}</p>
                      {c.schedule && <p className="text-xs text-gray-400 mt-1">{c.schedule}{c.room ? ` · ${c.room}` : ""}</p>}
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">{prog?.programCode || c.program}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

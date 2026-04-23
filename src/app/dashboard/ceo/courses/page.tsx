"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Plus, Loader2, Trash2, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: number;
  code: string;
  title: string;
  program: string;
  level: number;
  semester: string;
  year: number;
  credits: number;
  teacherId?: number;
  teacherName?: string;
  schedule?: string;
  room?: string;
}

interface Program {
  id: number;
  title: string;
  slug: string;
}

interface Teacher {
  id: number;
  user: {
    firstName: string;
    lastName: string;
  };
}

const SEMESTERS = ["Semester 1", "Semester 2"];

export default function CeoCoursesPage() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    code: "",
    title: "",
    description: "",
    credits: "3",
    program: "",
    level: "1",
    semester: "Semester 1",
    year: new Date().getFullYear().toString(),
    room: "",
    schedule: "",
    teacherId: "",
  });

  async function fetchData() {
    try {
      setLoading(true);
      const [coursesRes, programsRes, teachersRes] = await Promise.all([
        fetch("/api/courses"),
        fetch("/api/programs"),
        fetch("/api/teachers"),
      ]);

      if (coursesRes.ok) setCourses(await coursesRes.json());
      if (programsRes.ok) setPrograms(await programsRes.json());
      if (teachersRes.ok) setTeachers(await teachersRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        credits: Number(form.credits),
        level: Number(form.level),
        year: Number(form.year),
        teacherId: form.teacherId ? Number(form.teacherId) : null,
      };

      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast({ title: "Course created successfully" });
        setOpenDialog(false);
        setForm({
          code: "",
          title: "",
          description: "",
          credits: "3",
          program: "",
          level: "1",
          semester: "Semester 1",
          year: new Date().getFullYear().toString(),
          room: "",
          schedule: "",
          teacherId: "",
        });
        fetchData();
      } else {
        const error = await res.json();
        toast({ title: error.error || "Failed to create course", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "An error occurred", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="text-gray-500 text-sm">{courses.length} courses available</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Course Code *</Label>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                    placeholder="e.g., CS101"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g., Intro to Programming"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Course overview"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Program *</Label>
                  <Select value={form.program} onValueChange={(v) => setForm((f) => ({ ...f, program: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((p) => (
                        <SelectItem key={p.id} value={p.slug}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Level *</Label>
                  <Select value={form.level} onValueChange={(v) => setForm((f) => ({ ...f, level: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((l) => (
                        <SelectItem key={l} value={l.toString()}>
                          Level {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Credits</Label>
                  <Input
                    type="number"
                    value={form.credits}
                    onChange={(e) => setForm((f) => ({ ...f, credits: e.target.value }))}
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Semester *</Label>
                  <Select value={form.semester} onValueChange={(v) => setForm((f) => ({ ...f, semester: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SEMESTERS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year *</Label>
                  <Input
                    type="number"
                    value={form.year}
                    onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                    min="2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Assign Teacher</Label>
                  <Select value={form.teacherId} onValueChange={(v) => setForm((f) => ({ ...f, teacherId: v === "none" ? "" : v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {teachers.map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {t.user.firstName} {t.user.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Room</Label>
                  <Input
                    value={form.room}
                    onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}
                    placeholder="e.g., Lab 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Schedule</Label>
                  <Input
                    value={form.schedule}
                    onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))}
                    placeholder="e.g., Mon/Wed 8-10am"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Course"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Code</th>
                <th className="text-left px-4 py-3 font-semibold">Title</th>
                <th className="text-left px-4 py-3 font-semibold">Program</th>
                <th className="text-center px-4 py-3 font-semibold">Level</th>
                <th className="text-left px-4 py-3 font-semibold">Semester</th>
                <th className="text-left px-4 py-3 font-semibold">Teacher</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-blue-600">{c.code}</td>
                  <td className="px-4 py-3">{c.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.program}</td>
                  <td className="px-4 py-3 text-center">{c.level}</td>
                  <td className="px-4 py-3">{c.semester}</td>
                  <td className="px-4 py-3">
                    {c.teacherName ? (
                      <Badge variant="secondary">{c.teacherName}</Badge>
                    ) : (
                      <span className="text-gray-400 text-xs">Unassigned</span>
                    )}
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    No courses yet. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

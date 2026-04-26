"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2, BookMarked, Edit2, Trash2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Course { id: number; code: string; title: string; programId?: number; program: string; }
interface Submission {
  id: number; status: string; score: number | null; feedback: string | null;
  submittedAt: string | null; gradedAt: string | null; content: string | null;
  student: { id: number; studentId: string; user: { firstName: string; lastName: string } };
}
interface Exercise {
  id: number; title: string; description: string; dueDate: string | null; maxScore: number;
  createdAt: string; course: { id: number; code: string; title: string };
  submissionCount: number; gradedCount: number; submittedCount: number;
  submissions?: Submission[];
}

export default function TeacherExercisesPage() {
  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [gradeOpen, setGradeOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [creating, setCreating] = useState(false);
  const [gradeForm, setGradeForm] = useState({ studentId: "", score: "", feedback: "" });
  const [grading, setGrading] = useState(false);
  const [submissionsMap, setSubmissionsMap] = useState<Record<number, Submission[]>>({});
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", description: "", courseId: "", dueDate: "", maxScore: "100" });

  useEffect(() => { fetchCourses(); fetchExercises(); }, []);

  async function fetchCourses() {
    const res = await fetch("/api/courses");
    if (res.ok) setCourses(await res.json());
  }

  async function fetchExercises() {
    setLoading(true);
    const res = await fetch("/api/exercises");
    if (res.ok) setExercises(await res.json());
    setLoading(false);
  }

  async function fetchSubmissions(exerciseId: number) {
    const res = await fetch(`/api/exercises/${exerciseId}`);
    if (res.ok) {
      const data = await res.json();
      setSubmissionsMap((prev) => ({ ...prev, [exerciseId]: data.submissions || [] }));
    }
  }

  function toggleExpand(id: number) {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      if (!submissionsMap[id]) fetchSubmissions(id);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.courseId) { toast({ title: "Please select a course", variant: "destructive" }); return; }
    setCreating(true);
    try {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, courseId: Number(form.courseId), maxScore: Number(form.maxScore), dueDate: form.dueDate || null }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Failed"); }
      toast({ title: "Exercise created" });
      setCreateOpen(false);
      setForm({ title: "", description: "", courseId: "", dueDate: "", maxScore: "100" });
      fetchExercises();
    } catch (err: any) {
      toast({ title: err.message || "Error creating exercise", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this exercise and all submissions?")) return;
    const res = await fetch(`/api/exercises/${id}`, { method: "DELETE" });
    if (res.ok) { toast({ title: "Exercise deleted" }); fetchExercises(); }
    else toast({ title: "Failed to delete", variant: "destructive" });
  }

  async function handleGrade(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedExercise || !gradeForm.studentId || gradeForm.score === "") {
      toast({ title: "Student and score are required", variant: "destructive" }); return;
    }
    setGrading(true);
    try {
      const res = await fetch(`/api/exercises/${selectedExercise.id}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: Number(gradeForm.studentId), score: Number(gradeForm.score), feedback: gradeForm.feedback }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Failed"); }
      toast({ title: "Grade saved" });
      setGradeOpen(false);
      setGradeForm({ studentId: "", score: "", feedback: "" });
      // Refresh submissions for this exercise
      fetchSubmissions(selectedExercise.id);
      fetchExercises();
    } catch (err: any) {
      toast({ title: err.message || "Error grading", variant: "destructive" });
    } finally {
      setGrading(false);
    }
  }

  const statusColor: Record<string, string> = {
    pending: "bg-gray-100 text-gray-700",
    submitted: "bg-blue-100 text-blue-700",
    graded: "bg-green-100 text-green-700",
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-primary" />Exercises
          </h1>
          <p className="text-gray-500 text-sm">Create exercises for your courses and grade student submissions.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />New Exercise</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Exercise</DialogTitle>
              <DialogDescription>Add a new exercise to one of your courses.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Course *</Label>
                <Select value={form.courseId} onValueChange={(v) => setForm((f) => ({ ...f, courseId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.code} — {c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Exercise title" required />
              </div>
              <div className="space-y-2">
                <Label>Instructions *</Label>
                <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4} placeholder="Describe what students should do..." required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Score</Label>
                  <Input type="number" min="1" value={form.maxScore} onChange={(e) => setForm((f) => ({ ...f, maxScore: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={creating}>
                  {creating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : exercises.length === 0 ? (
        <Card><CardContent className="pt-8 text-center text-gray-500">No exercises yet. Create one above.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {exercises.map((ex) => (
            <Card key={ex.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="secondary" className="font-mono text-xs">{ex.course.code}</Badge>
                      <span className="text-xs text-gray-400">{ex.course.title}</span>
                      {ex.dueDate && (
                        <span className="text-xs text-gray-400">
                          Due: {new Date(ex.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-base">{ex.title}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ex.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => toggleExpand(ex.id)}>
                      <Users className="h-3.5 w-3.5 mr-1" />
                      {ex.submittedCount}/{ex.submissionCount ?? "?"}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(ex.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                  <span>Max score: {ex.maxScore}</span>
                  <span>Graded: {ex.gradedCount}</span>
                  <span>Submitted: {ex.submittedCount}</span>
                </div>
              </CardHeader>

              {expandedId === ex.id && (
                <CardContent className="pt-0">
                  <div className="border-t pt-4 space-y-3">
                    <p className="text-sm font-semibold">Submissions</p>
                    {!submissionsMap[ex.id] ? (
                      <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                    ) : submissionsMap[ex.id].length === 0 ? (
                      <p className="text-sm text-gray-400">No submissions yet.</p>
                    ) : (
                      submissionsMap[ex.id].map((sub) => (
                        <div key={sub.id} className="border rounded-lg p-3 flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{sub.student.user.firstName} {sub.student.user.lastName}</span>
                              <span className="font-mono text-xs text-gray-400">{sub.student.studentId}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[sub.status] || ""}`}>
                                {sub.status}
                              </span>
                            </div>
                            {sub.content && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{sub.content}</p>}
                            {sub.score !== null && (
                              <p className="text-sm font-semibold text-green-600 mt-1">
                                Score: {sub.score}/{ex.maxScore}
                                {sub.feedback && <span className="text-gray-500 font-normal ml-2">— {sub.feedback}</span>}
                              </p>
                            )}
                          </div>
                          <Button size="sm" variant="outline" onClick={() => {
                            setSelectedExercise(ex);
                            setGradeForm({ studentId: String(sub.student.id), score: sub.score?.toString() || "", feedback: sub.feedback || "" });
                            setGradeOpen(true);
                          }}>
                            <Edit2 className="h-3.5 w-3.5 mr-1" />{sub.status === "graded" ? "Edit" : "Grade"}
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Grade Dialog */}
      <Dialog open={gradeOpen} onOpenChange={setGradeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
            <DialogDescription>{selectedExercise?.title} — Max: {selectedExercise?.maxScore}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGrade} className="space-y-4">
            <div className="space-y-2">
              <Label>Score (0–{selectedExercise?.maxScore}) *</Label>
              <Input type="number" min="0" max={selectedExercise?.maxScore} value={gradeForm.score} onChange={(e) => setGradeForm((f) => ({ ...f, score: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Feedback</Label>
              <Textarea rows={3} placeholder="Optional feedback for the student..." value={gradeForm.feedback} onChange={(e) => setGradeForm((f) => ({ ...f, feedback: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setGradeOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={grading}>
                {grading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Save Grade"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

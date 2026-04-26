"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookMarked, Clock, CheckCircle, AlertCircle, Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Submission {
  id: number; status: string; score: number | null; feedback: string | null;
  submittedAt: string | null; gradedAt: string | null; content: string | null;
}
interface Exercise {
  id: number; title: string; description: string; dueDate: string | null;
  maxScore: number; createdAt: string;
  course: { id: number; code: string; title: string };
  submission: Submission | null;
}

type FilterKey = "all" | "pending" | "submitted" | "graded";

export default function StudentExercisesPage() {
  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [submitOpen, setSubmitOpen] = useState(false);
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchExercises(); }, []);

  async function fetchExercises() {
    setLoading(true);
    const res = await fetch("/api/exercises");
    if (res.ok) setExercises(await res.json());
    setLoading(false);
  }

  const filtered = exercises.filter((ex) => {
    if (filter === "all") return true;
    const status = ex.submission?.status || "pending";
    return status === filter;
  });

  function getStatus(ex: Exercise): string {
    if (!ex.submission) return "pending";
    return ex.submission.status;
  }

  function isOverdue(ex: Exercise): boolean {
    if (!ex.dueDate || ex.submission) return false;
    return new Date(ex.dueDate) < new Date();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !answer.trim()) {
      toast({ title: "Please write your answer", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/exercises/${selected.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: answer }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Failed"); }
      toast({ title: "Exercise submitted successfully" });
      setSubmitOpen(false);
      setAnswer("");
      fetchExercises();
    } catch (err: any) {
      toast({ title: err.message || "Submission failed", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  const counts = {
    all: exercises.length,
    pending: exercises.filter((e) => !e.submission && !isOverdue(e)).length,
    submitted: exercises.filter((e) => e.submission?.status === "submitted").length,
    graded: exercises.filter((e) => e.submission?.status === "graded").length,
  };

  const statusBadge: Record<string, { label: string; class: string; icon: JSX.Element }> = {
    pending: { label: "Pending", class: "bg-blue-100 text-blue-700", icon: <Clock className="h-4 w-4" /> },
    submitted: { label: "Submitted", class: "bg-yellow-100 text-yellow-700", icon: <CheckCircle className="h-4 w-4" /> },
    graded: { label: "Graded", class: "bg-green-100 text-green-700", icon: <CheckCircle className="h-4 w-4 text-green-600" /> },
    overdue: { label: "Overdue", class: "bg-red-100 text-red-700", icon: <AlertCircle className="h-4 w-4 text-red-600" /> },
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-2">
        <BookMarked className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Exercises</h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "submitted", "graded"] as FilterKey[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              filter === f ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f} <span className="ml-1 opacity-70">({counts[f]})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="pt-8 text-center text-gray-500">No exercises found.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((ex) => {
            const status = isOverdue(ex) ? "overdue" : getStatus(ex);
            const badge = statusBadge[status] || statusBadge.pending;
            return (
              <Card key={ex.id} className={status === "overdue" ? "border-red-200" : ""}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${status === "graded" ? "bg-green-100" : status === "overdue" ? "bg-red-100" : "bg-blue-100"}`}>
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-semibold text-sm">{ex.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {ex.course.code} — {ex.course.title}
                            {ex.dueDate && ` · Due: ${new Date(ex.dueDate).toLocaleDateString()}`}
                            {` · Max: ${ex.maxScore} pts`}
                          </p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${badge.class}`}>
                          {badge.label}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{ex.description}</p>

                      {ex.submission?.status === "graded" && (
                        <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                          <p className="text-sm font-semibold text-green-700">
                            Score: {ex.submission.score}/{ex.maxScore}
                          </p>
                          {ex.submission.feedback && (
                            <p className="text-xs text-green-600 mt-1">Feedback: {ex.submission.feedback}</p>
                          )}
                        </div>
                      )}

                      {ex.submission?.status === "submitted" && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                          <p className="text-xs text-yellow-700">Submitted — awaiting grade</p>
                        </div>
                      )}

                      {(status === "pending" || (ex.submission?.status === "submitted")) && (
                        <div className="mt-3">
                          <Button
                            size="sm"
                            variant={ex.submission ? "outline" : "default"}
                            onClick={() => { setSelected(ex); setAnswer(ex.submission?.content || ""); setSubmitOpen(true); }}
                          >
                            <Send className="h-3.5 w-3.5 mr-1.5" />
                            {ex.submission ? "Edit Submission" : "Submit Answer"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Submit Dialog */}
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <p className="text-sm text-gray-500">{selected?.course.code} — {selected?.course.title}</p>
          </DialogHeader>
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 max-h-32 overflow-y-auto">
            {selected?.description}
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-sm font-medium">Your Answer *</label>
              <Textarea
                rows={6}
                placeholder="Write your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setSubmitOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : "Submit"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

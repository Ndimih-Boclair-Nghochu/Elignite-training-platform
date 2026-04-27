"use client";
import { useEffect, useState, type FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { FileText, CheckCircle, Clock, Send, Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Project {
  projectId: number; code: string; title: string; description?: string;
  program: string; maxScore: number; dueDate?: string;
  teacher?: { user?: { firstName?: string; lastName?: string } };
  score: number | null; feedback: string | null;
  submissionLink: string | null; submittedAt: string | null; gradedAt: string | null;
  scoreId: number | null;
  status: "graded" | "submitted" | "pending";
}

export default function StudentProjectsPage() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [links, setLinks] = useState<Record<number, string>>({});

  useEffect(() => {
    fetch("/api/projects/me")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setProjects(Array.isArray(d) ? d : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent, projectId: number) {
    e.preventDefault();
    const link = links[projectId]?.trim();
    if (!link) { toast({ title: "Please enter a project link", variant: "destructive" }); return; }
    setSubmitting(projectId);
    try {
      const res = await fetch(`/api/projects/${projectId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionLink: link }),
      });
      if (res.ok) {
        toast({ title: "Project submitted successfully" });
        setProjects((prev) => prev.map((p) =>
          p.projectId === projectId
            ? { ...p, submissionLink: link, submittedAt: new Date().toISOString(), status: "submitted" }
            : p
        ));
        setLinks((prev) => { const n = { ...prev }; delete n[projectId]; return n; });
      } else {
        const err = await res.json();
        toast({ title: err.error || "Failed to submit", variant: "destructive" });
      }
    } finally {
      setSubmitting(null);
    }
  }

  const graded = projects.filter((p) => p.status === "graded").length;
  const submitted = projects.filter((p) => p.status === "submitted").length;
  const pending = projects.filter((p) => p.status === "pending").length;
  const avgScore = graded > 0
    ? (projects.filter((p) => p.score !== null).reduce((s, p) => s + (p.score ?? 0), 0) / graded).toFixed(1)
    : null;

  const statusBadge = (p: Project) => {
    if (p.status === "graded") return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Graded</Badge>;
    if (p.status === "submitted") return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Submitted</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-800"><FileText className="h-3 w-3 mr-1" />Pending</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Projects</h1>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : projects.length === 0 ? (
        <Card><CardContent className="pt-6 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No projects assigned yet.</p>
        </CardContent></Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center"><CardContent className="pt-5">
              <p className="text-3xl font-bold text-primary">{projects.length}</p>
              <p className="text-sm text-gray-500">Total</p>
            </CardContent></Card>
            <Card className="text-center"><CardContent className="pt-5">
              <p className="text-3xl font-bold text-green-600">{graded}</p>
              <p className="text-sm text-gray-500">Graded</p>
            </CardContent></Card>
            <Card className="text-center"><CardContent className="pt-5">
              <p className="text-3xl font-bold text-blue-600">{submitted}</p>
              <p className="text-sm text-gray-500">Submitted</p>
            </CardContent></Card>
            <Card className="text-center"><CardContent className="pt-5">
              <p className="text-3xl font-bold text-yellow-600">{pending}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </CardContent></Card>
          </div>

          <div className="space-y-4">
            {projects.map((p) => {
              const pct = p.score !== null ? Math.round((p.score / p.maxScore) * 100) : null;
              return (
                <Card key={p.projectId}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge variant="secondary" className="font-mono text-xs">{p.code}</Badge>
                          {statusBadge(p)}
                        </div>
                        <CardTitle className="text-base">{p.title}</CardTitle>
                        {p.description && <p className="text-sm text-gray-500 mt-1">{p.description}</p>}
                        {p.teacher?.user && (
                          <p className="text-xs text-gray-400 mt-1">Instructor: {p.teacher.user.firstName} {p.teacher.user.lastName}</p>
                        )}
                      </div>
                      {p.score !== null && (
                        <div className="text-right shrink-0">
                          <p className="text-3xl font-bold text-primary">{p.score}</p>
                          <p className="text-xs text-gray-500">/{p.maxScore}</p>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pct !== null && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Score: {pct}%</span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      {p.dueDate && <span>Due: {new Date(p.dueDate).toLocaleDateString()}</span>}
                      {p.submittedAt && <span>Submitted: {new Date(p.submittedAt).toLocaleDateString()}</span>}
                      {p.gradedAt && <span>Graded: {new Date(p.gradedAt).toLocaleDateString()}</span>}
                    </div>

                    {p.submissionLink && (
                      <a href={p.submissionLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                        <ExternalLink className="h-3 w-3" />View Submission
                      </a>
                    )}

                    {p.feedback && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                        <p className="font-semibold text-blue-900 mb-1">Feedback</p>
                        <p className="text-blue-800">{p.feedback}</p>
                      </div>
                    )}

                    {p.status === "pending" && (
                      <form onSubmit={(e) => handleSubmit(e, p.projectId)} className="flex gap-2 pt-1">
                        <Input
                          value={links[p.projectId] || ""}
                          onChange={(e) => setLinks((prev) => ({ ...prev, [p.projectId]: e.target.value }))}
                          placeholder="Paste hosted project link (GitHub, live URL, etc.)"
                          className="flex-1"
                        />
                        <Button type="submit" disabled={submitting === p.projectId} size="sm">
                          {submitting === p.projectId ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-1" />Submit</>}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

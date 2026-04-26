"use client";
import { useEffect, useState, type FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Plus, Edit2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProgramOption { id: number; programCode: string; title: string; slug: string; }
interface Project {
  id: number; code: string; title: string; description?: string;
  program: string; maxScore: number; dueDate?: string;
  scores: Array<{
    id: number; studentId: number; score: number; feedback?: string;
    student: { id: number; studentId: string; user: { firstName: string; lastName: string } };
  }>;
}

export default function TeacherProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [programFilter, setProgramFilter] = useState<string>("all");
  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [scoreForm, setScoreForm] = useState({ score: "", feedback: "" });
  const [scoreTarget, setScoreTarget] = useState<{ projectId: number; studentId: number } | null>(null);
  const [formData, setFormData] = useState({ code: "", title: "", description: "", program: "", maxScore: 100, dueDate: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchPrograms();
    fetchProjects();
  }, []);

  useEffect(() => { fetchProjects(programFilter); }, [programFilter]);

  async function fetchPrograms() {
    try {
      const res = await fetch("/api/teachers/programs");
      if (res.ok) setPrograms(await res.json());
    } catch {
      toast({ title: "Error loading programs", variant: "destructive" });
    }
  }

  async function fetchProjects(filter?: string) {
    try {
      setLoading(true);
      const query = filter && filter !== "all" ? `?program=${encodeURIComponent(filter)}` : "";
      const res = await fetch(`/api/projects${query}`);
      if (res.ok) setProjects(await res.json());
    } catch {
      toast({ title: "Error loading projects", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProject(e: FormEvent) {
    e.preventDefault();
    if (!formData.code || !formData.title || !formData.program) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    try {
      setCreating(true);
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, maxScore: Number(formData.maxScore), dueDate: formData.dueDate || null }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Project created successfully" });
      setCreateOpen(false);
      setFormData({ code: "", title: "", description: "", program: "", maxScore: 100, dueDate: "" });
      await fetchProjects(programFilter);
    } catch {
      toast({ title: "Error creating project", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  }

  async function handleSubmitScore(e: FormEvent) {
    e.preventDefault();
    if (!scoreTarget || !scoreForm.score) {
      toast({ title: "Please enter a score", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch(`/api/projects/${scoreTarget.projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: scoreTarget.studentId, score: Number(scoreForm.score), feedback: scoreForm.feedback }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Score saved" });
      setScoreDialogOpen(false);
      await fetchProjects(programFilter);
    } catch {
      toast({ title: "Error saving score", variant: "destructive" });
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Create projects for your programs and grade student submissions.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={programFilter} onValueChange={setProgramFilter}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="All Programs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              {programs.map((p) => (
                <SelectItem key={p.id} value={p.slug}>
                  <span className="font-mono text-xs text-gray-500 mr-2">{p.programCode}</span>{p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />New Project</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>Assign a project to one of your programs.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="space-y-2">
                  <Label>Project Code *</Label>
                  <Input placeholder="e.g., PROJ001" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input placeholder="Project title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Program *</Label>
                  <Select value={formData.program} onValueChange={(v) => setFormData({ ...formData, program: v })} disabled={programs.length === 0}>
                    <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
                    <SelectContent>
                      {programs.map((p) => (
                        <SelectItem key={p.id} value={p.slug}>
                          <span className="font-mono text-xs text-gray-500 mr-2">{p.programCode}</span>{p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea rows={3} placeholder="Project description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Score</Label>
                    <Input type="number" value={formData.maxScore} onChange={(e) => setFormData({ ...formData, maxScore: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={creating || programs.length === 0}>
                    {creating ? "Creating…" : "Create Project"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No projects created yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="font-mono">{project.code}</Badge>
                      <Badge variant="outline">{programs.find((p) => p.slug === project.program)?.programCode || project.program}</Badge>
                    </div>
                    <CardTitle>{project.title}</CardTitle>
                    {project.description && <p className="text-sm text-gray-500 mt-1">{project.description}</p>}
                  </div>
                  {project.dueDate && (
                    <div className="text-right text-sm">
                      <p className="text-gray-500">Due Date</p>
                      <p className="font-medium">{new Date(project.dueDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div><p className="text-sm text-gray-500">Max Score</p><p className="font-semibold">{project.maxScore}</p></div>
                  <div><p className="text-sm text-gray-500">Students Scored</p><p className="font-semibold">{project.scores.length}</p></div>
                  <div>
                    <p className="text-sm text-gray-500">Average Score</p>
                    <p className="font-semibold">
                      {project.scores.length > 0
                        ? (project.scores.reduce((sum, s) => sum + s.score, 0) / project.scores.length).toFixed(1)
                        : "–"}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Student Scores</h3>
                  {project.scores.length === 0 ? (
                    <p className="text-sm text-gray-500">No scores yet. Grade students once they submit their work.</p>
                  ) : (
                    <div className="space-y-2">
                      {project.scores.map((score) => (
                        <div key={score.id} className="flex items-center justify-between gap-4 rounded-lg border p-4">
                          <div>
                            <p className="font-medium">{score.student.user.firstName} {score.student.user.lastName}</p>
                            <p className="text-sm text-gray-500">{score.student.studentId}</p>
                            {score.feedback && <p className="text-xs text-gray-600 mt-1">💬 {score.feedback}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="font-semibold">{score.score}</p>
                              <p className="text-xs text-gray-500">/ {project.maxScore}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => {
                              setSelectedProject(project);
                              setScoreTarget({ projectId: project.id, studentId: score.studentId });
                              setScoreForm({ score: score.score.toString(), feedback: score.feedback || "" });
                              setScoreDialogOpen(true);
                            }}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={scoreDialogOpen} onOpenChange={setScoreDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Grade Student Submission</DialogTitle>
            <DialogDescription>Update the score and optional feedback.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitScore} className="space-y-4">
            <div className="space-y-2">
              <Label>Score (max: {selectedProject?.maxScore})</Label>
              <Input type="number" min="0" max={selectedProject?.maxScore} value={scoreForm.score} onChange={(e) => setScoreForm({ ...scoreForm, score: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Feedback</Label>
              <Textarea rows={3} placeholder="Optional feedback" value={scoreForm.feedback} onChange={(e) => setScoreForm({ ...scoreForm, feedback: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setScoreDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save Score</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

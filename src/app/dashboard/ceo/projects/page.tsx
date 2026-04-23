"use client";
import { useEffect, useState, type FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, Loader2, TrendingUp, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProjectStats {
  id: number;
  code: string;
  title: string;
  description?: string;
  program: string;
  maxScore: number;
  dueDate?: string;
  totalStudents: number;
  gradedStudents: number;
  averageScore: number;
  scores: Array<{
    studentId: number;
    score: number;
    studentName: string;
  }>;
}

export default function CEOProjectsPage() {
  const [projects, setProjects] = useState<ProjectStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [programOptions, setProgramOptions] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [filterProgram, setFilterProgram] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"summary" | "detailed">("summary");
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    program: "",
    maxScore: 100,
    dueDate: "",
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchPrograms();
    fetchProjects();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await fetch("/api/programs");
      if (!response.ok) throw new Error("Failed to load programs");
      const data = await response.json();
      setProgramOptions(data.map((program: any) => program.slug));
    } catch (error) {
      toast({ title: "Failed to load program list", variant: "destructive" });
    }
  };

  const fetchProjects = async (program?: string) => {
    try {
      setLoading(true);
      const query = program && program !== "all" ? `?program=${encodeURIComponent(program)}` : "";
      const response = await fetch(`/api/projects${query}`);
      if (!response.ok) throw new Error("Failed to load projects");
      const data = await response.json();

      const enriched = data.map((project: any) => {
        const gradedCount = project.scores.filter((s: any) => s.gradedAt).length;
        const avgScore = project.scores.length
          ? project.scores.reduce((sum: number, s: any) => sum + s.score, 0) / project.scores.length
          : 0;
        return {
          ...project,
          totalStudents: project.scores.length,
          gradedStudents: gradedCount,
          averageScore: avgScore,
        };
      });

      setProjects(enriched);
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.title || !formData.program) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }

    try {
      setCreating(true);
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code,
          title: formData.title,
          description: formData.description,
          program: formData.program,
          maxScore: Number(formData.maxScore),
          dueDate: formData.dueDate || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create project");
      }

      toast({ title: "Project created successfully" });
      setCreateOpen(false);
      setFormData({
        code: "",
        title: "",
        description: "",
        program: "",
        maxScore: 100,
        dueDate: "",
      });
      await fetchProjects(filterProgram);
    } catch (error) {
      toast({ title: (error as Error).message || "Failed to create project", variant: "destructive" });
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const filteredProjects =
    filterProgram === "all"
      ? projects
      : projects.filter((project) => project.program === filterProgram);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create projects by program and grade students when assignments are completed.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Card className="w-full max-w-sm">
            <CardContent className="space-y-3">
              <Label>Program</Label>
              <Select value={filterProgram} onValueChange={(value) => { setFilterProgram(value); fetchProjects(value); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {programOptions.map((program) => (
                    <SelectItem key={program} value={program}>
                      {program}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
                <DialogDescription>
                  Select a program and provide project details.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="space-y-2">
                  <Label>Project Code *</Label>
                  <Input
                    placeholder="e.g. PROJ101"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    placeholder="Project title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Program *</Label>
                  <Select
                    value={formData.program}
                    onValueChange={(value) => setFormData({ ...formData, program: value })}
                    disabled={programOptions.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programOptions.length === 0 ? (
                        <SelectItem value="">No programs available</SelectItem>
                      ) : (
                        programOptions.map((program) => (
                          <SelectItem key={program} value={program}>
                            {program}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    placeholder="Add any instructions or expectations"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Score</Label>
                    <Input
                      type="number"
                      value={formData.maxScore}
                      onChange={(e) => setFormData({ ...formData, maxScore: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating || programOptions.length === 0}>
                    {creating ? "Creating…" : "Create Project"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500">
          No projects found for this program.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {filteredProjects.map((project) => (
            <Card key={project.id}>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>{project.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{project.code}</p>
                </div>
                <Badge variant="secondary">{project.program}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-500">Max score</p>
                    <p className="font-semibold">{project.maxScore}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Due date</p>
                    <p className="font-semibold">{project.dueDate ?? "Not set"}</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-500">Total students</p>
                    <p className="font-semibold">{project.totalStudents}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Graded</p>
                    <p className="font-semibold">{project.gradedStudents}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Average</p>
                    <p className="font-semibold">{project.averageScore.toFixed(1)}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setViewMode(viewMode === "summary" ? "detailed" : "summary")}
                >
                  {viewMode === "summary" ? "Show details" : "Hide details"}
                </Button>
                {viewMode === "detailed" && (
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">Description</p>
                    <p>{project.description || "No description provided."}</p>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Student scores</p>
                      {project.scores.length === 0 ? (
                        <p className="text-sm text-gray-500">No scores submitted yet.</p>
                      ) : (
                        project.scores.map((score) => (
                          <div key={`${project.id}-${score.studentId}`} className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                              <p className="font-medium">{score.studentName}</p>
                              <p className="text-sm text-gray-500">Score: {score.score}</p>
                            </div>
                            <FileText className="h-5 w-5 text-gray-400" />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

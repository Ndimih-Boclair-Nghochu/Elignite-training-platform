"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Plus, Loader2, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Program {
  id: number;
  slug: string;
  title: string;
  category: string;
  duration: string;
  description: string;
  tuition: number;
  requirements?: string;
  outcomes?: string;
}

export default function TeacherProgramsPage() {
  const { toast } = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "",
    duration: "",
    tuition: "",
    description: "",
    requirements: "",
    outcomes: "",
  });

  async function fetchPrograms() {
    try {
      setLoading(true);
      const res = await fetch("/api/programs");
      if (res.ok) {
        setPrograms(await res.json());
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
      toast({ title: "Failed to load programs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPrograms();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId ? `/api/programs/${editingId}` : "/api/programs";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tuition: Number(form.tuition),
        }),
      });

      if (res.ok) {
        toast({ title: editingId ? "Program updated successfully" : "Program created successfully" });
        setOpenDialog(false);
        setForm({
          title: "",
          slug: "",
          category: "",
          duration: "",
          tuition: "",
          description: "",
          requirements: "",
          outcomes: "",
        });
        setEditingId(null);
        fetchPrograms();
      } else {
        const error = await res.json();
        toast({ title: error.error || "Failed to save program", variant: "destructive" });
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
          <h1 className="text-2xl font-bold">Programs</h1>
          <p className="text-gray-500 text-sm">{programs.length} programs available</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Program
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Program" : "Create New Program"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Program Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                    placeholder="e.g., BSc Computer Science"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Input
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    placeholder="e.g., Technology, Business"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration *</Label>
                  <Input
                    value={form.duration}
                    onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                    placeholder="e.g., 4 Years"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tuition (₣) *</Label>
                  <Input
                    type="number"
                    value={form.tuition}
                    onChange={(e) => setForm((f) => ({ ...f, tuition: e.target.value }))}
                    placeholder="e.g., 2500000"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Program overview and details"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Requirements</Label>
                <Textarea
                  value={form.requirements}
                  onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
                  placeholder="Admission requirements"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Learning Outcomes</Label>
                <Textarea
                  value={form.outcomes}
                  onChange={(e) => setForm((f) => ({ ...f, outcomes: e.target.value }))}
                  placeholder="Expected learning outcomes"
                  rows={2}
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Program"}
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
        <div className="grid md:grid-cols-2 gap-4">
          {programs.map((p) => (
            <Card key={p.id}>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{p.title}</p>
                      <p className="text-xs text-gray-400">{p.duration} · {p.category}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-primary">₣{p.tuition.toLocaleString()}</span>
                </div>
                {p.description && <p className="text-xs text-gray-600 mb-3 line-clamp-2">{p.description}</p>}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="w-full h-8" onClick={() => {
                    setEditingId(p.id);
                    setForm({ title: p.title, slug: p.slug, category: p.category, duration: p.duration, tuition: p.tuition.toString(), description: p.description, requirements: p.requirements || "", outcomes: p.outcomes || "" });
                    setOpenDialog(true);
                  }}>
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {programs.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <p className="text-gray-400">No programs yet. Create one to get started.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
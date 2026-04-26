"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Plus, Loader2, Trash2, Edit2 } from "lucide-react";
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

export default function CeoProgramsPage() {
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
      const endpoint = editingId ? `/api/programs/${editingId}` : "/api/programs";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tuition: Number(form.tuition),
          status: "published",
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

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this program?")) return;

    try {
      const res = await fetch(`/api/programs/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast({ title: "Program deleted successfully" });
        fetchPrograms();
      } else {
        toast({ title: "Failed to delete program", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "An error occurred", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Programs</h1>
          <p className="text-sm text-slate-500">{programs.length} programs available</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="bg-sky-500 text-white hover:bg-sky-600">
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
                    placeholder="e.g., Web Development"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Input
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    placeholder="e.g., Software, AI Productivity"
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
                    placeholder="e.g., 8 Weeks"
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
                <Label>Slug *</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                  placeholder="e.g., web-development"
                  required
                />
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
            <Card key={p.id} className="border-slate-200 bg-white shadow-[0_24px_80px_-48px_rgba(14,165,233,0.35)] transition-transform duration-300 hover:-translate-y-1">
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="rounded-2xl bg-sky-50 p-2">
                      <BookOpen className="h-5 w-5 text-sky-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-950">{p.title}</p>
                      <p className="text-xs text-gray-400">{p.duration} · {p.category}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-primary">₣{p.tuition.toLocaleString()}</span>
                </div>
                {p.description && <p className="mb-3 text-xs text-slate-600 line-clamp-2">{p.description}</p>}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 h-8 border-slate-200 bg-white hover:bg-slate-50" onClick={() => {
                    setEditingId(p.id);
                    setForm({ title: p.title, slug: p.slug, category: p.category, duration: p.duration, tuition: p.tuition.toString(), description: p.description, requirements: p.requirements || "", outcomes: p.outcomes || "" });
                    setOpenDialog(true);
                  }}>
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1 h-8" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
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

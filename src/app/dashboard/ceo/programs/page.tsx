"use client";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Plus, Loader2, Trash2, Edit2, ImageIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { slugifyProgramValue } from "@/lib/programs";

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
  imageUrl?: string;
}

const emptyForm = {
  title: "",
  slug: "",
  category: "",
  duration: "",
  tuition: "",
  description: "",
  requirements: "",
  outcomes: "",
  imageUrl: "",
};

export default function CeoProgramsPage() {
  const { toast } = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function fetchPrograms() {
    try {
      setLoading(true);
      const res = await fetch("/api/programs");
      if (res.ok) setPrograms(await res.json());
    } catch {
      toast({ title: "Failed to load programs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchPrograms(); }, []);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be under 5 MB", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setForm((f) => ({ ...f, imageUrl: base64 }));
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setForm((f) => ({ ...f, imageUrl: "" }));
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingId ? `/api/programs/${editingId}` : "/api/programs";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tuition: Number(form.tuition), status: "published" }),
      });
      if (res.ok) {
        toast({ title: editingId ? "Program updated" : "Program created" });
        setOpenDialog(false);
        setForm(emptyForm);
        setImagePreview("");
        setEditingId(null);
        fetchPrograms();
      } else {
        const err = await res.json();
        toast({ title: err.error || "Failed to save program", variant: "destructive" });
      }
    } catch {
      toast({ title: "An error occurred", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this program?")) return;
    try {
      const res = await fetch(`/api/programs/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Program deleted" });
        fetchPrograms();
      } else {
        toast({ title: "Failed to delete program", variant: "destructive" });
      }
    } catch {
      toast({ title: "An error occurred", variant: "destructive" });
    }
  }

  function openEditDialog(p: Program) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      slug: p.slug,
      category: p.category,
      duration: p.duration,
      tuition: p.tuition.toString(),
      description: p.description,
      requirements: p.requirements || "",
      outcomes: p.outcomes || "",
      imageUrl: p.imageUrl || "",
    });
    setImagePreview(p.imageUrl || "");
    setOpenDialog(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Programs</h1>
          <p className="text-sm text-slate-500">{programs.length} programs available</p>
        </div>
        <Dialog open={openDialog} onOpenChange={(open) => {
          setOpenDialog(open);
          if (!open) { setForm(emptyForm); setImagePreview(""); setEditingId(null); }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 text-white hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />Add Program
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
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: slugifyProgramValue(e.target.value) }))}
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
                  onChange={(e) => setForm((f) => ({ ...f, slug: slugifyProgramValue(e.target.value) }))}
                  placeholder="e.g., web-development"
                  required
                />
              </div>

              {/* Program Image Upload */}
              <div className="space-y-2">
                <Label>Program Cover Image</Label>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Program cover preview"
                      className="w-full h-40 object-cover rounded-lg border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 rounded-full bg-white/90 p-1 shadow-sm hover:bg-white"
                    >
                      <X className="h-4 w-4 text-slate-600" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 py-6 text-sm text-slate-500 hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
                  >
                    <ImageIcon className="h-6 w-6 text-slate-400" />
                    <span>Click to upload program image</span>
                    <span className="text-xs text-slate-400">PNG, JPG, WebP · Max 5 MB</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
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
            <Card key={p.id} className="border-slate-200 bg-white shadow-[0_24px_80px_-48px_rgba(14,165,233,0.35)] transition-transform duration-300 hover:-translate-y-1 overflow-hidden">
              {p.imageUrl && (
                <div className="relative h-36 w-full overflow-hidden">
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {!p.imageUrl && (
                      <div className="rounded-2xl bg-blue-50 p-2 shrink-0">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-950 truncate">{p.title}</p>
                      <p className="text-xs text-gray-400">{p.duration} · {p.category}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-primary shrink-0 ml-2">₣{p.tuition.toLocaleString()}</span>
                </div>
                {p.description && <p className="mb-3 text-xs text-slate-600 line-clamp-2">{p.description}</p>}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 h-8 border-slate-200 bg-white hover:bg-slate-50" onClick={() => openEditDialog(p)}>
                    <Edit2 className="h-3 w-3 mr-1" />Edit
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1 h-8" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-3 w-3 mr-1" />Delete
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

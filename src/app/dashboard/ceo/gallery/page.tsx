"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  url: string;
}

export default function Page() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Campus", url: "" });
  const { toast } = useToast();

  async function fetchGallery() {
    setLoading(true);
    const res = await fetch("/api/gallery");
    if (res.ok) {
      setGallery(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchGallery();
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title || !form.url) {
      toast({ title: "Title and image URL are required", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      toast({ title: data.error || "Failed to upload photo", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    toast({ title: "Photo uploaded" });
    setForm({ title: "", category: "Campus", url: "" });
    setOpen(false);
    await fetchGallery();
    setSubmitting(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this photo?")) return;
    const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      toast({ title: data.error || "Failed to delete photo", variant: "destructive" });
      return;
    }

    toast({ title: "Photo deleted" });
    await fetchGallery();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gallery</h1>
          <p className="text-sm text-gray-500">Upload and remove campus images for the About Us page.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="default"><Plus className="mr-2 h-4 w-4" />Upload Photos</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Upload Campus Photo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="url">Image URL</Label>
                <Input id="url" value={form.url} onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))} required />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" type="button" onClick={() => setOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Uploading..." : "Upload Photo"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campus Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-sm text-gray-500">Loading gallery…</div>
          ) : gallery.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">No images uploaded yet.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {gallery.map((item) => (
                <div key={item.id} className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="absolute right-3 top-3 z-10 rounded-full bg-black/70 p-2 text-white opacity-0 transition group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <Badge variant="secondary" className="mt-2 text-xs uppercase">
                      {item.category || "General"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
 
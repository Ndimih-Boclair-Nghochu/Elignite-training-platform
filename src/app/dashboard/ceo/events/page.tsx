"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EventItem {
  id: number;
  title: string;
  category: string;
  excerpt: string;
  description: string;
  eventDate: string;
  location?: string | null;
  coverImageUrl: string;
  videoUrl?: string | null;
  galleryItems?: string[] | null;
  isPublished: boolean;
}

const emptyForm = {
  title: "",
  category: "",
  excerpt: "",
  description: "",
  eventDate: "",
  location: "",
  coverImageUrl: "",
  videoUrl: "",
  galleryItems: "",
  isPublished: true,
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CeoEventsPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  async function fetchEvents() {
    setLoading(true);
    const res = await fetch("/api/events");
    if (res.ok) {
      setEvents(await res.json());
    } else {
      toast({ title: "Failed to load events", variant: "destructive" });
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  const stats = useMemo(() => {
    return {
      total: events.length,
      published: events.filter((event) => event.isPublished).length,
      drafts: events.filter((event) => !event.isPublished).length,
    };
  }, [events]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function openEdit(event: EventItem) {
    setEditingId(event.id);
    setForm({
      title: event.title,
      category: event.category,
      excerpt: event.excerpt,
      description: event.description,
      eventDate: event.eventDate.slice(0, 16),
      location: event.location || "",
      coverImageUrl: event.coverImageUrl,
      videoUrl: event.videoUrl || "",
      galleryItems: Array.isArray(event.galleryItems) ? event.galleryItems.join("\n") : "",
      isPublished: event.isPublished,
    });
    setOpen(true);
  }

  async function handleCoverUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCover(true);
      const dataUrl = await readFileAsDataUrl(file);
      setForm((current) => ({ ...current, coverImageUrl: dataUrl }));
      toast({ title: "Cover image uploaded" });
    } catch {
      toast({ title: "Failed to upload cover image", variant: "destructive" });
    } finally {
      setUploadingCover(false);
      event.target.value = "";
    }
  }

  async function handleGalleryUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    try {
      setUploadingGallery(true);
      const urls = await Promise.all(files.map(readFileAsDataUrl));
      setForm((current) => ({
        ...current,
        galleryItems: [current.galleryItems, ...urls].filter(Boolean).join("\n"),
      }));
      toast({ title: "Gallery media uploaded" });
    } catch {
      toast({ title: "Failed to upload gallery images", variant: "destructive" });
    } finally {
      setUploadingGallery(false);
      event.target.value = "";
    }
  }

  async function handleVideoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingVideo(true);
      const dataUrl = await readFileAsDataUrl(file);
      setForm((current) => ({ ...current, videoUrl: dataUrl }));
      toast({ title: "Video uploaded" });
    } catch {
      toast({ title: "Failed to upload video", variant: "destructive" });
    } finally {
      setUploadingVideo(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      galleryItems: form.galleryItems
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    const response = await fetch(editingId ? `/api/events/${editingId}` : "/api/events", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      toast({ title: editingId ? "Event updated" : "Event created" });
      setOpen(false);
      resetForm();
      fetchEvents();
    } else {
      const data = await response.json().catch(() => null);
      toast({ title: data?.error || "Failed to save event", variant: "destructive" });
    }

    setSaving(false);
  }

  async function handleDelete(eventItem: EventItem) {
    const confirmed = window.confirm(
      `Delete "${eventItem.title}"?\n\nThis will permanently remove the event record and its media references from the platform.`
    );

    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/events/${eventItem.id}`, { method: "DELETE" });
    if (response.ok) {
      toast({ title: "Event deleted" });
      fetchEvents();
    } else {
      const data = await response.json().catch(() => null);
      toast({ title: data?.error || "Failed to delete event", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Events</h1>
          <p className="text-sm text-slate-500">Manage graduations, showcases, and training highlights from one place.</p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(nextOpen) => {
            setOpen(nextOpen);
            if (!nextOpen) {
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Event" : "Create Event"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Input value={form.category} onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))} placeholder="Graduation, Workshop, Showcase..." required />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Event Date *</Label>
                  <Input type="datetime-local" value={form.eventDate} onChange={(e) => setForm((current) => ({ ...current, eventDate: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={form.location} onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Short Summary *</Label>
                <Textarea value={form.excerpt} onChange={(e) => setForm((current) => ({ ...current, excerpt: e.target.value }))} rows={2} required />
              </div>
              <div className="space-y-2">
                <Label>Event Details *</Label>
                <Textarea value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} rows={5} required />
              </div>
              <div className="space-y-2">
                <Label>Cover Image URL *</Label>
                <Input value={form.coverImageUrl} onChange={(e) => setForm((current) => ({ ...current, coverImageUrl: e.target.value }))} placeholder="https://..." required />
                <Input type="file" accept="image/*" onChange={handleCoverUpload} disabled={uploadingCover} />
                {uploadingCover ? <p className="text-xs text-slate-500">Uploading cover image...</p> : null}
              </div>
              <div className="space-y-2">
                <Label>Video URL</Label>
                <Input value={form.videoUrl} onChange={(e) => setForm((current) => ({ ...current, videoUrl: e.target.value }))} placeholder="Direct video file URL or hosted media URL" />
                <Input type="file" accept="video/*" onChange={handleVideoUpload} disabled={uploadingVideo} />
                {uploadingVideo ? <p className="text-xs text-slate-500">Uploading video...</p> : null}
              </div>
              <div className="space-y-2">
                <Label>Gallery Image URLs</Label>
                <Textarea
                  value={form.galleryItems}
                  onChange={(e) => setForm((current) => ({ ...current, galleryItems: e.target.value }))}
                  rows={4}
                  placeholder={"One image URL per line"}
                />
                <Input type="file" accept="image/*" multiple onChange={handleGalleryUpload} disabled={uploadingGallery} />
                {uploadingGallery ? <p className="text-xs text-slate-500">Uploading gallery media...</p> : null}
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-950">Publish event publicly</p>
                  <p className="text-sm text-slate-500">Turn this off to keep the event saved but hidden from the public site.</p>
                </div>
                <Switch checked={form.isPublished} onCheckedChange={(checked) => setForm((current) => ({ ...current, isPublished: checked }))} />
              </div>
              <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingId ? (
                  "Save Event Changes"
                ) : (
                  "Create Event"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Events", value: stats.total },
          { label: "Published", value: stats.published },
          { label: "Draft / Hidden", value: stats.drafts },
        ].map((item) => (
          <Card key={item.label} className="border-blue-100">
            <CardContent className="p-6">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden border-blue-100">
              <div className="relative h-56">
                <img src={event.coverImageUrl} alt={event.title} className="h-full w-full object-cover" />
              </div>
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">{event.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {new Date(event.eventDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                      {event.location ? ` • ${event.location}` : ""}
                    </p>
                  </div>
                  <Badge className={event.isPublished ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"}>
                    {event.isPublished ? "Published" : "Hidden"}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">{event.excerpt}</p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" className="border-slate-200 bg-white hover:bg-slate-50" onClick={() => openEdit(event)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="destructive" onClick={() => handleDelete(event)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {events.length === 0 && (
            <Card className="border-dashed border-blue-100">
              <CardContent className="p-10 text-center text-slate-500">
                No events added yet.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Plus, Trash2, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  icon?: string;
  imageUrl?: string;
  isActive: boolean;
}

export default function Page() {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Career",
    icon: "Briefcase",
    imageUrl: "",
    isActive: true,
  });

  async function fetchServices() {
    setLoading(true);
    const res = await fetch("/api/services");
    if (res.ok) {
      setServices(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchServices();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.description || !form.category) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setSaving(true);

    if (editingId) {
      const res = await fetch(`/api/services/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        toast({ title: data.error || "Failed to update service", variant: "destructive" });
        setSaving(false);
        return;
      }
      toast({ title: "Service updated" });
    } else {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        toast({ title: data.error || "Failed to create service", variant: "destructive" });
        setSaving(false);
        return;
      }
      toast({ title: "Service added" });
    }

    await fetchServices();
    setOpen(false);
    resetForm();
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this service?")) return;
    const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Service deleted" });
      await fetchServices();
    } else {
      const data = await res.json();
      toast({ title: data.error || "Failed to delete", variant: "destructive" });
    }
  }

  async function handleToggle(id: number, current: boolean) {
    const res = await fetch(`/api/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...services.find((s) => s.id === id), isActive: !current }),
    });

    if (res.ok) {
      toast({ title: `Service ${!current ? "enabled" : "disabled"}` });
      await fetchServices();
    } else {
      const data = await res.json();
      toast({ title: data.error || "Failed to toggle", variant: "destructive" });
    }
  }

  function resetForm() {
    setForm({ name: "", description: "", category: "Career", icon: "Briefcase", imageUrl: "", isActive: true });
    setEditingId(null);
  }

  function editService(service: Service) {
    setForm({
      ...service,
      icon: service.icon ?? "",
      imageUrl: service.imageUrl ?? "",
      description: service.description ?? "",
    });
    setEditingId(service.id);
    setOpen(true);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-sm text-gray-500">Manage student services displayed on the public Services page.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Service" : "Add New Service"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="name">Service Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    value={form.category}
                    onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option>Career</option>
                    <option>Academic</option>
                    <option>Health</option>
                    <option>Sports</option>
                    <option>Accommodation</option>
                    <option>Welfare</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  required
                />
              </div>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="icon">Icon Name</Label>
                  <Input
                    id="icon"
                    value={form.icon}
                    onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
                    placeholder="e.g., Briefcase, Heart"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={form.imageUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Update Service" : "Add Service"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading services…</div>
        ) : services.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No services added yet.</div>
        ) : (
          services.map((s) => (
            <Card key={s.id} className={s.isActive ? "" : "opacity-60"}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{s.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{s.description}</p>
                      <Badge variant="secondary" className="text-xs mt-2">
                        {s.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={s.isActive} onCheckedChange={() => handleToggle(s.id, s.isActive)} />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => editService(s)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(s.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

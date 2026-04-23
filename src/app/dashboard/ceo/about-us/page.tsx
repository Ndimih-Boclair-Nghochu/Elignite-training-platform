"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Globe2, Save } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AboutData {
  vision: string;
  visionImageUrl: string;
  mission: string;
  missionImageUrl: string;
}

export default function CeoAboutUsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [about, setAbout] = useState<AboutData>({
    vision: "",
    visionImageUrl: "",
    mission: "",
    missionImageUrl: "",
  });
  const [galleryCount, setGalleryCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const aboutRes = await fetch("/api/about-us");
        if (aboutRes.ok) {
          const data = await aboutRes.json();
          setAbout({
            vision: data.vision || "",
            visionImageUrl: data.visionImageUrl || "",
            mission: data.mission || "",
            missionImageUrl: data.missionImageUrl || "",
          });
        }

        const [galleryRes, teachersRes] = await Promise.all([
          fetch("/api/gallery"),
          fetch("/api/teachers"),
        ]);

        if (galleryRes.ok) {
          const galleryData = await galleryRes.json();
          setGalleryCount(Array.isArray(galleryData) ? galleryData.length : 0);
        }
        if (teachersRes.ok) {
          const teacherData = await teachersRes.json();
          setStaffCount(Array.isArray(teacherData) ? teacherData.length : 0);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (user?.role !== "ceo") {
    return (
      <div className="p-6">
        <Card>
          <CardContent>
            <p className="text-base text-gray-700">You do not have permission to configure About Us settings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/about-us", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(about),
    });

    if (res.ok) {
      toast({ title: "About Us updated successfully" });
    } else {
      const data = await res.json();
      toast({ title: data.error || "Failed to save About Us", variant: "destructive" });
    }

    setSaving(false);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">About Us Management</h1>
          <p className="text-sm text-gray-500">Only the CEO can update the Vision, Mission and gallery settings.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{staffCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Gallery Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{galleryCount}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vision and Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="vision">Vision statement</Label>
                <Textarea
                  id="vision"
                  value={about.vision}
                  onChange={(e) => setAbout((prev) => ({ ...prev, vision: e.target.value }))}
                  placeholder="Enter the institutional vision"
                  rows={5}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="visionImageUrl">Vision image URL</Label>
                <Input
                  id="visionImageUrl"
                  value={about.visionImageUrl}
                  onChange={(e) => setAbout((prev) => ({ ...prev, visionImageUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="mission">Mission statement</Label>
                <Textarea
                  id="mission"
                  value={about.mission}
                  onChange={(e) => setAbout((prev) => ({ ...prev, mission: e.target.value }))}
                  placeholder="Enter the institutional mission"
                  rows={5}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="missionImageUrl">Mission image URL</Label>
                <Input
                  id="missionImageUrl"
                  value={about.missionImageUrl}
                  onChange={(e) => setAbout((prev) => ({ ...prev, missionImageUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="submit" disabled={saving || loading}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save About Us"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded-3xl overflow-hidden bg-slate-100 shadow-sm border">
              {about.visionImageUrl ? (
                <img src={about.visionImageUrl} alt="Vision image" className="h-64 w-full object-cover" />
              ) : (
                <div className="flex h-64 items-center justify-center bg-slate-200 text-slate-500">Vision image preview</div>
              )}
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Vision</p>
              <p className="mt-2 text-gray-700">{about.vision || "Add a vision statement for the public About Us page."}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl overflow-hidden bg-slate-100 shadow-sm border">
              {about.missionImageUrl ? (
                <img src={about.missionImageUrl} alt="Mission image" className="h-64 w-full object-cover" />
              ) : (
                <div className="flex h-64 items-center justify-center bg-slate-200 text-slate-500">Mission image preview</div>
              )}
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Mission</p>
              <p className="mt-2 text-gray-700">{about.mission || "Add a mission statement for the public About Us page."}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

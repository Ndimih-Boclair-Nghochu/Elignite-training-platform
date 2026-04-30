"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type PartnerProfile = {
  institutionName: string;
  logoUrl: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  website: string | null;
  contactPerson: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  description: string | null;
  accreditationInfo: string | null;
  verificationDocuments: string[] | null;
  verificationStatus: string;
  profileCompletion: number;
};

const blankForm = {
  institutionName: "",
  logoUrl: "",
  country: "",
  city: "",
  address: "",
  website: "",
  contactPerson: "",
  contactEmail: "",
  contactPhone: "",
  description: "",
  accreditationInfo: "",
  verificationDocuments: "",
};

export default function PartnerProfilePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [form, setForm] = useState(blankForm);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/partner/profile");
    if (response.ok) {
      const data = await response.json();
      setProfile(data);
      setForm({
        institutionName: data.institutionName || "",
        logoUrl: data.logoUrl || "",
        country: data.country || "",
        city: data.city || "",
        address: data.address || "",
        website: data.website || "",
        contactPerson: data.contactPerson || "",
        contactEmail: data.contactEmail || "",
        contactPhone: data.contactPhone || "",
        description: data.description || "",
        accreditationInfo: data.accreditationInfo || "",
        verificationDocuments: Array.isArray(data.verificationDocuments) ? data.verificationDocuments.join("\n") : "",
      });
    } else {
      toast({ title: "Failed to load school profile", variant: "destructive" });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const verificationTone = useMemo(() => {
    if (!profile) return "bg-slate-100 text-slate-700";
    if (profile.verificationStatus === "verified") return "bg-emerald-100 text-emerald-700";
    if (profile.verificationStatus === "rejected") return "bg-rose-100 text-rose-700";
    return "bg-amber-100 text-amber-700";
  }, [profile]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      verificationDocuments: form.verificationDocuments
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    const response = await fetch("/api/partner/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      setProfile(data);
      toast({ title: "School profile updated" });
    } else {
      const data = await response.json().catch(() => null);
      toast({ title: data?.error || "Failed to update profile", variant: "destructive" });
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-blue-100 shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Institution Profile</CardTitle>
            <Badge className={verificationTone}>
              {profile?.verificationStatus.replace("_", " ") || "pending"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Profile completion</p>
              <p className="text-2xl font-semibold text-slate-950">{profile?.profileCompletion || 0}%</p>
            </div>
            <div className="w-full max-w-md">
              <Progress value={profile?.profileCompletion || 0} className="h-3" />
            </div>
          </div>
          <p className="text-sm text-slate-500">
            Verification status is controlled by the platform team. Partner accounts can upload documents and update profile details, but cannot self-approve verification or program approval states.
          </p>
        </CardContent>
      </Card>

      <Card className="border-blue-100 shadow-sm">
        <CardHeader>
          <CardTitle>Edit School Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Institution Name</Label>
                <Input value={form.institutionName} onChange={(e) => setForm((current) => ({ ...current, institutionName: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input value={form.logoUrl} onChange={(e) => setForm((current) => ({ ...current, logoUrl: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input value={form.country} onChange={(e) => setForm((current) => ({ ...current, country: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => setForm((current) => ({ ...current, city: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => setForm((current) => ({ ...current, address: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input value={form.website} onChange={(e) => setForm((current) => ({ ...current, website: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input value={form.contactPerson} onChange={(e) => setForm((current) => ({ ...current, contactPerson: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input type="email" value={form.contactEmail} onChange={(e) => setForm((current) => ({ ...current, contactEmail: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input value={form.contactPhone} onChange={(e) => setForm((current) => ({ ...current, contactPhone: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={5} value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Accreditation Info</Label>
              <Textarea rows={4} value={form.accreditationInfo} onChange={(e) => setForm((current) => ({ ...current, accreditationInfo: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Verification Documents</Label>
              <Textarea
                rows={4}
                placeholder="One document URL per line"
                value={form.verificationDocuments}
                onChange={(e) => setForm((current) => ({ ...current, verificationDocuments: e.target.value }))}
              />
            </div>

            <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Settings {
  applicationsOpen: boolean;
  applicationYear: string;
}

async function readJson<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      (data && typeof data === "object" && "error" in data && typeof data.error === "string")
        ? data.error
        : "Request failed"
    );
  }

  return data as T;
}

function EnrollForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState<Array<{ id: number; slug: string; title: string }>>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const selectedProgramSlug = searchParams.get("program");
  const selectedProgramObject = programs.find((p) => p.slug === selectedProgramSlug);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    program: selectedProgramSlug || "",
    address: "",
    parentName: "",
    parentPhone: "",
    message: "",
  });

  useEffect(() => {
    Promise.allSettled([
      fetch("/api/settings", { cache: "no-store" }).then((r) => readJson<Settings>(r)),
      fetch("/api/programs", { cache: "no-store" }).then((r) => readJson<Array<{ id: number; slug: string; title: string }>>(r)),
    ])
      .then(([settingsResult, programsResult]) => {
        setSettings(settingsResult.status === "fulfilled" ? settingsResult.value : { applicationsOpen: true, applicationYear: "Current Intake" });
        setPrograms(
          programsResult.status === "fulfilled" && Array.isArray(programsResult.value)
            ? programsResult.value
            : []
        );

        if (settingsResult.status === "rejected" || programsResult.status === "rejected") {
          toast({
            title: "Some application data could not be loaded",
            description: "You can still continue if the form fields you need are visible.",
            variant: "destructive",
          });
        }
      })
      .finally(() => {
        setLoadingSettings(false);
        setLoadingPrograms(false);
      });
  }, [toast]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/enroll/success?id=${data.id}&token=${data.publicAccessToken}`);
    } else {
      const errorData = await res.json();
      toast({ title: "Submission failed", description: errorData.error || "Please try again.", variant: "destructive" });
      setLoading(false);
    }
  }

  if (loadingSettings) {
    return (
      <Card className="surface-card-strong">
        <CardContent className="pt-6 text-center">
          <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-blue-500" />
          <p className="text-slate-600">Loading application status...</p>
        </CardContent>
      </Card>
    );
  }

  if (settings && !settings.applicationsOpen) {
    return (
      <Card className="surface-card-strong">
        <CardContent className="space-y-4 pt-6 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-amber-500" />
          <h2 className="text-xl font-semibold text-slate-950">Applications are currently closed</h2>
          <p className="text-slate-600">Please contact ELIGNITE for the next admissions opening.</p>
          <Link href="/" className="font-medium text-blue-700 hover:underline">Return to home page</Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="surface-card-strong">
        <CardHeader>
          <CardTitle className="text-slate-950">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {[
            { name: "firstName", label: "First Name *" },
            { name: "lastName", label: "Last Name *" },
            { name: "email", label: "Email *", type: "email" },
            { name: "phone", label: "Phone *" },
          ].map((field) => (
            <div key={field.name} className="space-y-2">
              <Label>{field.label}</Label>
              <Input name={field.name} type={field.type || "text"} value={(form as any)[field.name]} onChange={handleChange} required className="border-slate-200 bg-white" />
            </div>
          ))}
          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <Input name="dob" type="date" value={form.dob} onChange={handleChange} className="border-slate-200 bg-white" />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select value={form.gender} onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}>
              <SelectTrigger className="border-slate-200 bg-white"><SelectValue placeholder="Select gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Address</Label>
            <Input name="address" value={form.address} onChange={handleChange} className="border-slate-200 bg-white" />
          </div>
        </CardContent>
      </Card>

      {!selectedProgramSlug && (
        <Card className="surface-card-strong">
          <CardHeader><CardTitle className="text-slate-950">Program Selection</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Choose Program *</Label>
              <Select value={form.program} onValueChange={(v) => setForm((f) => ({ ...f, program: v }))}>
                <SelectTrigger className="border-slate-200 bg-white"><SelectValue placeholder="Select a program" /></SelectTrigger>
                <SelectContent>
                  {programs.map((p) => (
                    <SelectItem key={p.id} value={p.slug}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedProgramSlug && selectedProgramObject && (
        <Card className="surface-card">
          <CardHeader><CardTitle className="text-slate-950">Program Selected</CardTitle></CardHeader>
          <CardContent>
            <p className="font-semibold text-slate-950">{selectedProgramObject.title}</p>
            <p className="mt-2 text-sm text-slate-600">Your selected program is pre-filled from the program page.</p>
          </CardContent>
        </Card>
      )}

      <Card className="surface-card-strong">
        <CardHeader><CardTitle className="text-slate-950">Parent / Guardian</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Parent Name</Label>
            <Input name="parentName" value={form.parentName} onChange={handleChange} className="border-slate-200 bg-white" />
          </div>
          <div className="space-y-2">
            <Label>Parent Phone</Label>
            <Input name="parentPhone" value={form.parentPhone} onChange={handleChange} className="border-slate-200 bg-white" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Additional Message</Label>
            <Textarea name="message" value={form.message} onChange={handleChange} rows={4} className="border-slate-200 bg-white" />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full bg-blue-500 text-white hover:bg-blue-600" size="lg" disabled={loading || loadingPrograms}>
        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : <><CheckCircle className="mr-2 h-4 w-4" />Submit Application</>}
      </Button>
    </form>
  );
}

export default function EnrollPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => readJson<Settings>(r))
      .then(setSettings)
      .catch((error) => {
        console.error(error);
        setSettings({ applicationsOpen: true, applicationYear: "Current Intake" });
      })
      .finally(() => setLoadingSettings(false));
  }, []);

  const subtitle = !loadingSettings && settings?.applicationsOpen
    ? `Applications Open for ${settings.applicationYear}`
    : !loadingSettings && settings && !settings.applicationsOpen
      ? "Applications are currently closed. Thank you for your interest."
      : "Fill out the form below to start your application.";

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="border-b border-slate-200 bg-blue-50/60 px-4 py-14 text-center">
        <h1 className="mb-2 text-3xl font-bold text-slate-950">Apply for Admission</h1>
        <p className="text-slate-600">{subtitle}</p>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Suspense fallback={<div>Loading...</div>}>
          <EnrollForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account? <Link href="/login" className="text-blue-700 hover:underline">Login to your portal</Link>
        </p>
      </div>
      <Footer />
    </div>
  );
}

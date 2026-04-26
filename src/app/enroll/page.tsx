"use client";
import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Settings {
  applicationsOpen: boolean;
  applicationYear: string;
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
    // Fetch settings and programs from API
    Promise.all([
      fetch("/api/settings", { cache: "no-store" })
        .then((r) => r.json())
        .then((data) => {
          setSettings(data);
          setLoadingSettings(false);
        })
        .catch((err) => {
          console.error("Error fetching settings:", err);
          setLoadingSettings(false);
        }),
      fetch("/api/programs")
        .then((r) => r.json())
        .then(setPrograms)
        .finally(() => setLoadingPrograms(false))
        .catch(() => setLoadingPrograms(false)),
    ]);
  }, []);

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
      toast({ 
        title: "Submission failed", 
        description: errorData.error || "Please try again.", 
        variant: "destructive" 
      });
      setLoading(false);
    }
  }

  return (
    <>
      {/* Show loading state */}
      {loadingSettings && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-blue-700">Loading application status...</p>
          </CardContent>
        </Card>
      )}

      {/* Show applications closed message */}
      {!loadingSettings && settings && !settings.applicationsOpen && (
        <Card className="bg-red-50 border-red-200 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900">Applications Closed</h3>
                <p className="text-red-700 text-sm mt-1">
                  We are not currently accepting applications. Please check back soon for updates.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show applications open message */}
      {!loadingSettings && settings && settings.applicationsOpen && (
        <Card className="bg-green-50 border-green-200 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900">Applications Open</h3>
                <p className="text-green-700 text-sm mt-1">
                  {settings.applicationYear} - We are currently accepting applications
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show form only if applications are open */}
      {!loadingSettings && settings && !settings.applicationsOpen && (
        <Card className="text-center p-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Unable to Submit Application</h2>
          <p className="text-gray-600 mb-6">
            Applications are currently closed. Please contact the school for more information about when applications will reopen.
          </p>
          <Link href="/" className="text-primary hover:underline">
            Return to home page
          </Link>
        </Card>
      )}

      {!loadingSettings && settings && settings.applicationsOpen && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input name="firstName" value={form.firstName} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input name="lastName" value={form.lastName} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input name="email" type="email" value={form.email} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input name="phone" value={form.phone} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input name="dob" type="date" value={form.dob} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <Input name="address" value={form.address} onChange={handleChange} />
              </div>
            </CardContent>
          </Card>

          {/* Program Selection - Only show if not pre-selected OR if user is browsing without pre-selection */}
          {!selectedProgramSlug && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Program Selection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Choose Program *</Label>
                  <Select value={form.program} onValueChange={(v) => setForm((f) => ({ ...f, program: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((p) => (
                        <SelectItem key={p.id} value={p.slug}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Show selected program info if pre-selected */}
          {selectedProgramSlug && selectedProgramObject && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg text-green-900">Program Selected</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-green-900">{selectedProgramObject.title}</p>
                <p className="text-sm text-green-700 mt-2">
                  You are enrolled to apply for this program. Your program is pre-selected and cannot be changed.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Parent / Guardian</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Parent Name</Label>
                <Input name="parentName" value={form.parentName} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Parent Phone</Label>
                <Input name="parentPhone" value={form.parentPhone} onChange={handleChange} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Additional Message</Label>
                <Textarea name="message" value={form.message} onChange={handleChange} rows={3} />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" size="lg" disabled={loading || loadingPrograms}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Submit Application
              </>
            )}
          </Button>
        </form>
      )}
    </>
  );
}

export default function EnrollPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setLoadingSettings(false);
      })
      .catch((err) => {
        console.error("Error fetching settings:", err);
        setLoadingSettings(false);
      });
  }, []);

  let headerSubtitle = "Fill out the form below to start your application.";
  let headerBgColor = "bg-gradient-to-r from-blue-800 to-blue-600";

  if (!loadingSettings && settings) {
    if (!settings.applicationsOpen) {
      headerSubtitle = "Applications are currently closed. Thank you for your interest.";
      headerBgColor = "bg-gradient-to-r from-red-800 to-red-600";
    } else {
      headerSubtitle = `Applications Open for ${settings.applicationYear}`;
      headerBgColor = "bg-gradient-to-r from-green-800 to-green-600";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className={`${headerBgColor} text-white py-12 px-4 text-center`}>
        <h1 className="text-3xl font-bold mb-2">Apply for Admission</h1>
        <p className="text-blue-100">{headerSubtitle}</p>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Suspense fallback={<div>Loading...</div>}>
          <EnrollForm />
        </Suspense>
        <p className="text-center text-sm text-gray-400 mt-6">
          Already applied? <Link href="/login" className="text-primary">Login to your portal</Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, GraduationCap, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const [form, setForm] = useState({
    matricule: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const router = useRouter();
  const { refresh } = useAuth();
  const { toast } = useToast();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));

    if (name === "password" || name === "confirmPassword") {
      setPasswordError("");
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (!form.matricule || !form.email || !form.password || !form.confirmPassword) {
      toast({
        title: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    if (form.password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matricule: form.matricule,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Registration failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Account created",
        description: "Your student portal is ready.",
      });

      await refresh();
      router.push("/dashboard/student");
    } catch (error) {
      toast({
        title: "Network error",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden border border-white/10 bg-white shadow-2xl lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden bg-[linear-gradient(145deg,#082f49,#0f172a)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white/10">
              <GraduationCap className="h-6 w-6 text-sky-300" />
            </div>
            <h1 className="mt-8 text-4xl font-semibold leading-tight">
              Create your student portal with your approved school record.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              Use the matricule from your admission letter and the same email address
              used during application review.
            </p>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              Your dashboard unlocks fees, results, timetable, projects, and school communication.
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              Registration is available only for approved student records.
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <Card className="border-0 shadow-none">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-3xl">Create Account</CardTitle>
              <CardDescription>
                Match your approved matricule and email to activate student access.
              </CardDescription>
            </CardHeader>

            <CardContent className="px-0">
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="matricule">Matricule Number</Label>
                  <Input
                    id="matricule"
                    name="matricule"
                    placeholder="Enter your matricule"
                    value={form.matricule}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Application Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter the email used during application"
                      value={form.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                </div>

                <Button type="submit" className="h-11 w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-5 text-sm text-slate-500">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-sky-700 hover:underline">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

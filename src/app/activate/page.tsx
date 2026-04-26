"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";

export default function ActivateAccountPage() {
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier || !email || !password || !confirmPassword) {
      toast({
        title: "Missing information",
        description: "Please complete all fields.",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Use at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, email, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Activation failed",
          description: data.error || "Could not activate account.",
          variant: "destructive",
        });
        return;
      }
      setSuccess(true);
      toast({ title: "Account activated", description: "You can now sign in." });
      setTimeout(() => router.push("/login"), 1800);
    } catch {
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
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f7faff_0%,#ffffff_62%,#eef4ff_100%)] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-blue-100 bg-white shadow-[0_35px_120px_-60px_rgba(37,99,235,0.28)] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="hidden bg-[linear-gradient(150deg,#eff6ff,#dbeafe)] p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="mt-8 text-4xl font-semibold leading-tight text-slate-950">
              Activate your account with the identifier and email already on file.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-600">
              This is for pre-created student or teacher records that still need a first password.
            </p>
          </div>
          <div className="rounded-[24px] border border-blue-100 bg-white p-4 text-sm leading-7 text-slate-600">
            Use your matricule, student ID, or teacher ID together with the matching email address.
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <Card className="border-0 shadow-none">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-3xl text-slate-950">Activate Account</CardTitle>
              <CardDescription>Set your password and unlock your portal access.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              {success ? (
                <div className="space-y-5 py-10 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-950">Account Activated</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      Your login is ready. Redirecting you to sign in.
                    </p>
                  </div>
                  <Button asChild className="w-full bg-blue-600 text-white hover:bg-blue-700">
                    <Link href="/login">Go to Login</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleActivate} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="identifier">Identifier</Label>
                    <Input
                      id="identifier"
                      type="text"
                      placeholder="Matricule, student ID, or teacher ID"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      disabled={loading}
                      className="border-blue-100 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email on Record</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your school or application email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="border-blue-100 bg-white pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Create Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className="border-blue-100 bg-white pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Repeat your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        className="border-blue-100 bg-white pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                        disabled={loading}
                      >
                        {showConfirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="h-11 w-full bg-blue-600 text-white hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Activating...
                      </>
                    ) : (
                      "Activate Account"
                    )}
                  </Button>
                  <p className="text-sm text-slate-500">
                    Already active?{" "}
                    <Link href="/login" className="font-medium text-blue-700 hover:underline">
                      Sign in instead
                    </Link>
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

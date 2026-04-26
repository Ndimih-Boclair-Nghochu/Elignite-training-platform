"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();
  const { toast } = useToast();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.requiresActivation) {
          toast({
            title: "Account not activated",
            description: "Use the activation flow first.",
            variant: "destructive",
          });
          setTimeout(() => {
            router.push("/activate");
          }, 1200);
          return;
        }

        toast({
          title: "Login failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      await refresh();
      const role = data.user.role;
      if (role === "ceo") router.push("/dashboard/ceo");
      else if (role === "teacher") router.push("/dashboard/teacher");
      else router.push("/dashboard/student");
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
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden border border-white/10 bg-white shadow-2xl lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden bg-[linear-gradient(145deg,#082f49,#0f172a)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="relative h-16 w-16 overflow-hidden rounded-md border border-white/10 bg-white/10">
                  <Image src="/logo.svg" alt="ELIGNITE logo" fill className="object-contain p-3" />
            </div>
            <h1 className="mt-8 text-4xl font-semibold leading-tight">
              Sign into the workspace built for your role.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              Students, teachers, and executives all use the same platform with role-based dashboards.
            </p>
          </div>

          <div className="rounded-md border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
            Use your matricule, email address, student ID, or teacher ID together with your password.
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <Card className="border-0 shadow-none">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-3xl">Welcome Back</CardTitle>
              <CardDescription>Enter your credentials to continue into your portal.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="identifier">Matricule, Email, or ID</Label>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="Enter your identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPw ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="h-11 w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="mt-5 space-y-2 text-sm">
                <p className="text-slate-500">
                  Student without an account?{" "}
                  <Link href="/register" className="font-medium text-sky-700 hover:underline">
                    Create one here
                  </Link>
                </p>
                <p className="text-slate-500">
                  Need first-time activation?{" "}
                  <Link href="/activate" className="font-medium text-sky-700 hover:underline">
                    Activate your account
                  </Link>
                </p>
                <Link href="/" className="inline-flex items-center gap-2 font-medium text-slate-600 hover:text-slate-950">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

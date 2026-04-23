"use client";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";
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
            title: "Account Not Activated",
            description: "Please activate your account first before logging in.",
            variant: "destructive",
          });
          setTimeout(() => {
            router.push("/activate");
          }, 2000);
          return;
        }
        toast({ title: "Login failed", description: data.error, variant: "destructive" });
        return;
      }
      await refresh();
      const role = data.user.role;
      if (role === "ceo") router.push("/dashboard/ceo");
      else if (role === "teacher") router.push("/dashboard/teacher");
      else router.push("/dashboard/student");
    } catch {
      toast({ title: "Network error", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <Image src="/logo.svg" alt="EduManage logo" fill className="object-contain p-3" />
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account using your matricule, email or ID</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Matricule, Email or ID</Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Enter your matricule (e.g., MAT2024001)"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPw ? "text" : "password"} placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary font-medium hover:underline">Register</Link>
            </div>
            <div className="mt-2 text-center">
              <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← Back to Home</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

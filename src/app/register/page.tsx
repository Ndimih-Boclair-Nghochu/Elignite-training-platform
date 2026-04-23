"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const [form, setForm] = useState({
    matricule: "",
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
    setForm((f) => ({ ...f, [name]: value }));
    
    // Clear password error when user changes password fields
    if (name === "password" || name === "confirmPassword") {
      setPasswordError("");
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    // Validation
    if (!form.matricule || !form.password || !form.confirmPassword) {
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
          password: form.password,
          confirmPassword: form.confirmPassword,
          role: "student",
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
        title: "Account created successfully!",
        description: "Redirecting to your dashboard...",
      });

      await refresh();
      router.push("/dashboard/student");
    } catch (error) {
      toast({
        title: "Network error",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-primary rounded-full p-3">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Register for your student portal</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Matricule Field */}
            <div className="space-y-2">
              <Label htmlFor="matricule">Matricule Number *</Label>
              <Input
                id="matricule"
                name="matricule"
                placeholder="Enter your matricule"
                value={form.matricule}
                onChange={handleChange}
                required
                disabled={loading}
                maxLength={20}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
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
              {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={loading}>
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

          {/* Sign In Link */}
          <div className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              Sign In
            </Link>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
            <p className="font-semibold mb-1">ℹ️ Student Registration</p>
            <p>
              Use the matricule number from your enrollment approval letter. Your password must be at least 6 characters.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


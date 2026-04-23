"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Hash, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function ActivateAccountPage() {
  const [matricle, setMatricle] = useState("");
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

    if (!matricle || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricle, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Activation Failed",
          description: data.error || "Could not activate account",
          variant: "destructive",
        });
        return;
      }

      setSuccess(true);
      toast({
        title: "Success",
        description: "Account activated! Redirecting to login...",
      });

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 rounded-full p-4">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Activate Your Account</CardTitle>
            <CardDescription>
              Set a password to activate your EduManage account
            </CardDescription>
          </CardHeader>

          <CardContent>
            {success ? (
              <div className="text-center py-6 space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 rounded-full p-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-green-600">
                  Account Activated!
                </h3>
                <p className="text-gray-600 text-sm">
                  Your account has been successfully activated. You can now log in with your credentials.
                </p>
                <Button asChild className="w-full mt-6">
                  <Link href="/login">Go to Login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleActivate} className="space-y-4">
                <div>
                  <Label htmlFor="matricle" className="text-sm font-medium flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Matricle Number
                  </Label>
                  <Input
                    id="matricle"
                    type="text"
                    placeholder="e.g., MAT202400001"
                    value={matricle}
                    onChange={(e) => setMatricle(e.target.value)}
                    className="mt-1"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the student matricule assigned to you by the school.
                  </p>
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium">
                    Create Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
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

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
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

                <Button type="submit" className="w-full mt-6" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Activating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Activate Account
                    </>
                  )}
                </Button>

                <div className="text-center text-sm">
                  <p className="text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-600 hover:underline font-medium">
                      Login here
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-white/70 mt-6">
          For support, contact admissions@edumanage.edu
        </p>
      </div>
    </div>
  );
}

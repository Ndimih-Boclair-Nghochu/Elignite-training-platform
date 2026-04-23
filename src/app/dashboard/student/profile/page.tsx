"use client";
import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Save, Upload, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function StudentProfilePage() {
  const { user, refetch } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || null);
  const [form, setForm] = useState({
    phone: user?.phone || "",
    dob: "",
    gender: "",
    address: "",
    parentName: "",
    parentPhone: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Please select an image file" });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "Image must be smaller than 5MB" });
      return;
    }

    try {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setPhotoUrl(base64);

        // Save to profile
        const response = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoUrl: base64 }),
        });

        if (!response.ok) {
          throw new Error("Failed to update profile picture");
        }

        toast({ title: "Success", description: "Profile picture updated" });
        refetch?.();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update profile picture",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContactInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast({ title: "Success", description: "Contact information updated" });
      refetch?.();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match" });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters" });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to change password");
      }

      toast({ title: "Success", description: "Password changed successfully" });
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to change password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      {/* Profile Picture Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-5">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile"
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <Badge className="mt-2 capitalize">{user?.role}</Badge>
            </div>
          </div>
          <div className="mt-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              <Upload className="mr-2 h-4 w-4" />
              Change Picture
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>First Name</Label>
              <Input value={user?.firstName || ""} readOnly className="bg-gray-50" />
            </div>
            <div className="space-y-1">
              <Label>Last Name</Label>
              <Input value={user?.lastName || ""} readOnly className="bg-gray-50" />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input value={user?.email || ""} readOnly className="bg-gray-50" />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+237 6XX XXX XXX"
              />
            </div>
          </div>
          <Button
            onClick={handleSaveContactInfo}
            disabled={loading}
            className="w-full mt-2"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Contact Information
          </Button>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Current Password</Label>
            <Input
              type="password"
              value={passwordForm.oldPassword}
              onChange={(e) =>
                setPasswordForm((f) => ({ ...f, oldPassword: e.target.value }))
              }
              placeholder="Enter your current password"
            />
          </div>
          <div className="space-y-1">
            <Label>New Password</Label>
            <Input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))
              }
              placeholder="Enter new password (min. 6 characters)"
            />
          </div>
          <div className="space-y-1">
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))
              }
              placeholder="Confirm new password"
            />
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={loading}
            className="w-full mt-2"
          >
            <Lock className="mr-2 h-4 w-4" />
            Update Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

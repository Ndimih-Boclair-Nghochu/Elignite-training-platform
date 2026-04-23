"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, School, Bell, Upload, Lock, Settings as SettingsIcon, Image } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";

interface ApplicationSettings {
  id: number;
  applicationsOpen: boolean;
  applicationYear: string;
  maintenanceMode: boolean;
}

interface SchoolSettings {
  id: number;
  schoolName: string;
  schoolLogoUrl: string | null;
  ceoFirstName: string;
  ceoLastName: string;
  ceoTitle: string;
  schoolMotto: string | null;
  schoolAddress: string | null;
  schoolPhone: string | null;
  schoolEmail: string | null;
  aiName?: string;
}

export default function Page() {
  const { toast } = useToast();
  const { user, refetch } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const schoolLogoInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [appSettingsLoading, setAppSettingsLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || null);
  const [appSettings, setAppSettings] = useState<ApplicationSettings | null>(null);
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null);
  const [schoolSettingsLoading, setSchoolSettingsLoading] = useState(false);
  const [aiName, setAiName] = useState("EduAssistant");
  const [aiNameLoading, setAiNameLoading] = useState(false);
  const [contactForm, setContactForm] = useState({
    phone: user?.phone || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notif, setNotif] = useState({
    newEnrollment: true,
    feePayment: true,
    systemAlerts: true,
    weeklyReport: false,
  });

  useEffect(() => {
    fetchApplicationSettings();
    fetchSchoolSettings();
    fetchAIName();
  }, []);

  const fetchAIName = async () => {
    try {
      setAiNameLoading(true);
      const res = await fetch("/api/settings/ai-name");
      if (res.ok) {
        const data = await res.json();
        setAiName(data.aiName || "EduAssistant");
      }
    } catch (error) {
      console.error("Error fetching AI name:", error);
    } finally {
      setAiNameLoading(false);
    }
  };

  const handleSaveAIName = async () => {
    if (!aiName.trim()) {
      toast({ title: "Error", description: "AI name cannot be empty" });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/settings/ai-name-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiName: aiName.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiName(data.aiName);
        toast({ title: "Success", description: data.message });
      } else {
        const error = await res.json();
        toast({ title: "Error", description: error.error || "Failed to update AI name" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update AI name",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationSettings = async () => {
    try {
      setAppSettingsLoading(true);
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setAppSettings(data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setAppSettingsLoading(false);
    }
  };

  const fetchSchoolSettings = async () => {
    try {
      setSchoolSettingsLoading(true);
      const res = await fetch("/api/admin/school-settings");
      if (res.ok) {
        const data = await res.json();
        setSchoolSettings(data);
      }
    } catch (error) {
      console.error("Error fetching school settings:", error);
    } finally {
      setSchoolSettingsLoading(false);
    }
  };

  const handleSaveSchoolSettings = async () => {
    if (!schoolSettings) return;
    try {
      setLoading(true);
      const res = await fetch("/api/admin/school-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName: schoolSettings.schoolName,
          schoolLogoUrl: schoolSettings.schoolLogoUrl,
          ceoFirstName: schoolSettings.ceoFirstName,
          ceoLastName: schoolSettings.ceoLastName,
          ceoTitle: schoolSettings.ceoTitle,
          schoolMotto: schoolSettings.schoolMotto,
          schoolAddress: schoolSettings.schoolAddress,
          schoolPhone: schoolSettings.schoolPhone,
          schoolEmail: schoolSettings.schoolEmail,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSchoolSettings(updated);
        toast({ title: "Success", description: "School settings updated" });
      } else {
        throw new Error("Failed to update settings");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Please select an image file" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "Image must be smaller than 5MB" });
      return;
    }

    try {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        if (schoolSettings) {
          setSchoolSettings((s) => s ? { ...s, schoolLogoUrl: base64 } : null);
          toast({ title: "Success", description: "School logo updated" });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload logo",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApplicationSettings = async () => {
    if (!appSettings) return;
    try {
      setLoading(true);
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationsOpen: appSettings.applicationsOpen,
          applicationYear: appSettings.applicationYear,
          maintenanceMode: appSettings.maintenanceMode,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setAppSettings(updated);
        toast({ title: "Success", description: "Application settings updated" });
      } else {
        throw new Error("Failed to update settings");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Please select an image file" });
      return;
    }

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
        body: JSON.stringify({ phone: contactForm.phone }),
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
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Profile Section */}
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
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-2xl font-bold">
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

      {/* Contact Information */}
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
                value={contactForm.phone}
                onChange={(e) =>
                  setContactForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="+237 6XX XXX XXX"
              />
            </div>
          </div>
          <Button
            onClick={handleSaveContactInfo}
            disabled={loading}
            className="w-full"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Contact Information
          </Button>
        </CardContent>
      </Card>

      {/* School Information for Certificates */}
      {schoolSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              School Branding & Certificate Settings
            </CardTitle>
            <p className="text-sm text-gray-500 mt-2">
              Configure your school information displayed on student certificates
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* School Logo */}
            <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-transparent">
              <Label className="text-base font-medium mb-3 block">School Logo</Label>
              <div className="flex items-center gap-4">
                {schoolSettings.schoolLogoUrl ? (
                  <img
                    src={schoolSettings.schoolLogoUrl}
                    alt="School Logo"
                    className="h-16 w-16 rounded-lg object-contain bg-white p-2 border"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                    <Image className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    ref={schoolLogoInputRef}
                    onChange={handleSchoolLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => schoolLogoInputRef.current?.click()}
                    disabled={loading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {schoolSettings.schoolLogoUrl ? "Change Logo" : "Upload Logo"}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended size: 200×200px (Max 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* School Name */}
            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name *</Label>
              <Input
                id="schoolName"
                value={schoolSettings.schoolName}
                onChange={(e) =>
                  setSchoolSettings((s) =>
                    s ? { ...s, schoolName: e.target.value } : null
                  )
                }
                placeholder="e.g., Computer Training Institute"
              />
            </div>

            {/* School Motto */}
            <div className="space-y-2">
              <Label htmlFor="motto">School Motto</Label>
              <Input
                id="motto"
                value={schoolSettings.schoolMotto || ""}
                onChange={(e) =>
                  setSchoolSettings((s) =>
                    s ? { ...s, schoolMotto: e.target.value } : null
                  )
                }
                placeholder='e.g., "Excellence in Education"'
              />
            </div>

            <Separator />

            {/* CEO Information */}
            <div>
              <h3 className="font-semibold text-sm mb-4 text-blue-900">
                CEO Signature on Certificates
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ceoFirstName">CEO First Name *</Label>
                  <Input
                    id="ceoFirstName"
                    value={schoolSettings.ceoFirstName}
                    onChange={(e) =>
                      setSchoolSettings((s) =>
                        s ? { ...s, ceoFirstName: e.target.value } : null
                      )
                    }
                    placeholder="Dr."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ceoLastName">CEO Last Name *</Label>
                  <Input
                    id="ceoLastName"
                    value={schoolSettings.ceoLastName}
                    onChange={(e) =>
                      setSchoolSettings((s) =>
                        s ? { ...s, ceoLastName: e.target.value } : null
                      )
                    }
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="ceoTitle">CEO Title *</Label>
                  <Input
                    id="ceoTitle"
                    value={schoolSettings.ceoTitle}
                    onChange={(e) =>
                      setSchoolSettings((s) =>
                        s ? { ...s, ceoTitle: e.target.value } : null
                      )
                    }
                    placeholder="Chief Executive Officer"
                  />
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Preview:</strong> {schoolSettings.ceoFirstName} {schoolSettings.ceoLastName}
                </p>
                <p className="text-xs text-blue-700">{schoolSettings.ceoTitle}</p>
              </div>
            </div>

            <Separator />

            {/* School Contact Information */}
            <div>
              <h3 className="font-semibold text-sm mb-4 text-blue-900">
                School Contact Information
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolEmail">Email</Label>
                  <Input
                    id="schoolEmail"
                    type="email"
                    value={schoolSettings.schoolEmail || ""}
                    onChange={(e) =>
                      setSchoolSettings((s) =>
                        s ? { ...s, schoolEmail: e.target.value } : null
                      )
                    }
                    placeholder="info@school.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolPhone">Phone</Label>
                  <Input
                    id="schoolPhone"
                    value={schoolSettings.schoolPhone || ""}
                    onChange={(e) =>
                      setSchoolSettings((s) =>
                        s ? { ...s, schoolPhone: e.target.value } : null
                      )
                    }
                    placeholder="+237 XXX XXX XXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolAddress">Address</Label>
                  <Input
                    id="schoolAddress"
                    value={schoolSettings.schoolAddress || ""}
                    onChange={(e) =>
                      setSchoolSettings((s) =>
                        s ? { ...s, schoolAddress: e.target.value } : null
                      )
                    }
                    placeholder="123 Education Street, City, Country"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSaveSchoolSettings}
              disabled={loading || schoolSettingsLoading}
              className="w-full mt-4"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Saving..." : "Save School Settings"}
            </Button>
            <p className="text-xs text-gray-500 text-center">
              These settings will appear on all issued certificates
            </p>
          </CardContent>
        </Card>
      )}

      {/* AI Helper Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            AI Assistant Configuration
          </CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            Customize the name of your AI helper that assists students, teachers, and staff
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aiName">AI Assistant Name</Label>
            <Input
              id="aiName"
              value={aiName}
              onChange={(e) => setAiName(e.target.value)}
              placeholder="e.g., EduAssistant, SmartTutor, etc."
              disabled={aiNameLoading}
            />
            <p className="text-xs text-gray-500">
              This name will be displayed in the AI chatbot interface available to all users
            </p>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Preview:</strong> "{aiName}" will greet users in their AI assistant window
            </p>
            <p className="text-xs text-blue-700 mt-1">
              AI can answer questions about: programming, HTML, Office tools (Word, Excel, PowerPoint), and system features
            </p>
          </div>

          <Button
            onClick={handleSaveAIName}
            disabled={loading || aiNameLoading}
            className="w-full"
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Saving..." : "Save AI Assistant Name"}
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "newEnrollment", label: "New Enrollment Applications" },
            { key: "feePayment", label: "Fee Payments" },
            { key: "systemAlerts", label: "System Alerts" },
            { key: "weeklyReport", label: "Weekly Report" },
          ].map((item, i, arr) => (
            <div key={item.key}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{item.label}</p>
                <Switch
                  checked={notif[item.key as keyof typeof notif]}
                  onCheckedChange={(v) =>
                    setNotif((n) => ({ ...n, [item.key]: v }))
                  }
                />
              </div>
              {i < arr.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Application Settings */}
      {appSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Application Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Applications Open/Closed */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-transparent">
              <div className="space-y-1">
                <Label className="text-base font-medium">Accept New Applications</Label>
                <p className="text-sm text-gray-500">
                  {appSettings.applicationsOpen
                    ? "✓ Applications are currently OPEN - students can enroll"
                    : "✗ Applications are CLOSED - enrollment disabled"}
                </p>
              </div>
              <Switch
                checked={appSettings.applicationsOpen}
                onCheckedChange={(checked) =>
                  setAppSettings((s) => s ? { ...s, applicationsOpen: checked } : null)
                }
              />
            </div>

            {/* Application Year */}
            <div className="space-y-2">
              <Label>Intake Period / Academic Year</Label>
              <Input
                value={appSettings.applicationYear}
                onChange={(e) =>
                  setAppSettings((s) => s ? { ...s, applicationYear: e.target.value } : null)
                }
                placeholder="e.g., 2024/2025"
                className="max-w-sm"
              />
              <p className="text-xs text-gray-400">
                This will display on the home page: "Applications Now Open – {appSettings.applicationYear}"
              </p>
            </div>

            {/* Maintenance Mode */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-orange-50 to-transparent">
              <div className="space-y-1">
                <Label className="text-base font-medium">Maintenance Mode</Label>
                <p className="text-sm text-gray-500">
                  {appSettings.maintenanceMode
                    ? "⚠️ System OFFLINE - student portal disabled"
                    : "✓ System ONLINE - all features operational"}
                </p>
              </div>
              <Switch
                checked={appSettings.maintenanceMode}
                onCheckedChange={(checked) =>
                  setAppSettings((s) => s ? { ...s, maintenanceMode: checked } : null)
                }
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSaveApplicationSettings}
              disabled={loading}
              className="w-full mt-2"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Saving..." : "Save Application Settings"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
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
            className="w-full"
          >
            <Lock className="mr-2 h-4 w-4" />
            Update Password
          </Button>
        </CardContent>
      </Card>

      <Button
        className="w-full"
        size="lg"
        onClick={() => toast({ title: "Settings saved" })}
      >
        <Save className="mr-2 h-4 w-4" />
        Save All Settings
      </Button>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, Mail, Phone, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StaffRow {
  id: number;
  teacherId: string;
  matricle?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  occupation?: string;
  profession?: string;
  quotes?: string;
  status: string;
}

export default function CeoStaffPage() {
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    occupation: "",
    profession: "",
    department: "",
    quotes: "",
  });
  const { toast } = useToast();

  async function fetchStaff() {
    setLoading(true);
    const res = await fetch("/api/teachers");
    if (res.ok) {
      setStaff(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchStaff();
  }, []);

  const filtered = staff.filter((t) =>
    `${t.firstName} ${t.lastName} ${t.email} ${t.occupation || ""} ${t.profession || ""} ${t.matricle || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  async function handleCreateStaff(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.occupation) {
      toast({ title: "Please complete required fields", variant: "destructive" });
      return;
    }

    setCreating(true);
    const res = await fetch("/api/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        occupation: form.occupation,
        profession: form.profession,
        department: form.department,
        quotes: form.quotes,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      toast({ title: data.error || "Failed to add staff", variant: "destructive" });
      setCreating(false);
      return;
    }

    toast({ title: "Staff added successfully" });
    setForm({ firstName: "", lastName: "", email: "", phone: "", occupation: "", profession: "", department: "", quotes: "" });
    setOpen(false);
    await fetchStaff();
    setCreating(false);
  }

  async function handleToggleStatus(id: number, newStatus: string) {
    try {
      const res = await fetch(`/api/teachers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast({ title: `Staff ${newStatus === "active" ? "reactivated" : "suspended"}` });
        await fetchStaff();
      } else {
        const data = await res.json();
        toast({ title: data.error || "Failed to update staff", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "An error occurred", variant: "destructive" });
    }
  }

  async function handleDeleteStaff(id: number) {
    if (!confirm("Are you sure you want to delete this staff member?")) return;

    try {
      const res = await fetch(`/api/teachers/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast({ title: "Staff deleted successfully" });
        await fetchStaff();
      } else {
        const data = await res.json();
        toast({ title: data.error || "Failed to delete staff", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "An error occurred", variant: "destructive" });
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Staff</h1>
          <p className="text-gray-500 text-sm">{staff.length} staff members</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="default"><Plus className="mr-2 h-4 w-4" />Add Staff</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Add New Staff</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>First Name</Label>
                  <Input value={form.firstName} onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))} required />
                </div>
                <div className="space-y-1">
                  <Label>Last Name</Label>
                  <Input value={form.lastName} onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required />
                </div>
                <div className="space-y-1">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Occupation</Label>
                  <Input value={form.occupation} onChange={(e) => setForm((prev) => ({ ...prev, occupation: e.target.value }))} required />
                </div>
                <div className="space-y-1">
                  <Label>Profession</Label>
                  <Input value={form.profession} onChange={(e) => setForm((prev) => ({ ...prev, profession: e.target.value }))} />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Department</Label>
                <Input value={form.department} onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))} required placeholder="e.g., Computer Science, Engineering" />
              </div>

              <div className="space-y-1">
                <Label>Quote</Label>
                <Input value={form.quotes} onChange={(e) => setForm((prev) => ({ ...prev, quotes: e.target.value }))} />
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={creating}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? "Saving..." : "Create Staff"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full gap-4">
            <CardTitle>All Staff</CardTitle>
            <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-white">
              <Search className="h-4 w-4 text-gray-400" />
              <input className="outline-none text-sm w-44" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Matricle</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Occupation</TableHead>
                  <TableHead>Profession</TableHead>
                  <TableHead>Quote</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-sm">{t.teacherId}</TableCell>
                    <TableCell className="font-mono text-sm">{t.matricle || "-"}</TableCell>
                    <TableCell className="font-medium">{t.firstName} {t.lastName}</TableCell>
                    <TableCell>
                      <div className="text-sm space-y-0.5">
                        <div className="flex items-center gap-1 text-gray-500"><Mail className="h-3 w-3" />{t.email}</div>
                        <div className="flex items-center gap-1 text-gray-500"><Phone className="h-3 w-3" />{t.phone || "–"}</div>
                      </div>
                    </TableCell>
                    <TableCell>{t.occupation || "–"}</TableCell>
                    <TableCell className="text-sm text-gray-500">{t.profession || "–"}</TableCell>
                    <TableCell className="text-sm text-gray-500">{t.quotes || "–"}</TableCell>
                    <TableCell>
                      <Badge variant={t.status === "active" ? "default" : "secondary"} className="text-xs capitalize">
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        size="sm"
                        variant={t.status === "active" ? "secondary" : "default"}
                        onClick={() => handleToggleStatus(t.id, t.status === "active" ? "inactive" : "active")}
                      >
                        {t.status === "active" ? "Suspend" : "Activate"}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteStaff(t.id)}>
                        <Trash2 className="mr-2 h-3.5 w-3.5" />Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-400 py-8">
                      No staff found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

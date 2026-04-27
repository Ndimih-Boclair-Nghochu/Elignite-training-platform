"use client";
import { useEffect, useState, type FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, Inbox, Mail, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface Msg {
  id: number; fromName: string; fromRole: string; subject: string;
  body: string; createdAt: string; read?: boolean; toRole?: string;
}
interface Program { id: number; programCode: string; title: string; }
interface StudentOption { id: number; userId: number; studentId: string; firstName: string; lastName: string; }

const BLANK = { toType: "all", toProgramId: "", toUserId: "", subject: "", body: "" };

export default function TeacherMessagesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const teacherId = user?.teacherId;

  const [tab, setTab] = useState<"inbox" | "sent">("inbox");
  const [inbox, setInbox] = useState<Msg[]>([]);
  const [sent, setSent] = useState<Msg[]>([]);
  const [selected, setSelected] = useState<Msg | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCompose, setOpenCompose] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ ...BLANK });

  useEffect(() => {
    fetchAll();
    fetch("/api/teachers/programs").then((r) => r.ok ? r.json() : []).then(setPrograms);
  }, [teacherId]);

  async function fetchAll() {
    setLoading(true);
    const [iRes, sRes] = await Promise.all([
      fetch("/api/messages"),
      fetch("/api/messages?type=sent"),
    ]);
    if (iRes.ok) setInbox(await iRes.json());
    if (sRes.ok) setSent(await sRes.json());
    setLoading(false);
  }

  async function loadStudents() {
    if (!teacherId || students.length > 0) return;
    const res = await fetch(`/api/teachers/${teacherId}/students`);
    if (res.ok) {
      const data: { id: number; userId?: number; studentId: string; firstName: string; lastName: string }[] = await res.json();
      setStudents(data.map((s) => ({ id: s.id, userId: s.userId || 0, studentId: s.studentId, firstName: s.firstName, lastName: s.lastName })));
    }
  }

  async function handleCompose(e: FormEvent) {
    e.preventDefault();
    if (!form.subject.trim() || !form.body.trim()) {
      toast({ title: "Subject and message are required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = { subject: form.subject, body: form.body };
      if (form.toType === "all") { payload.toRole = "all"; }
      else if (form.toType === "students") { payload.toRole = "student"; }
      else if (form.toType === "program") { payload.toRole = "student"; payload.toProgramId = Number(form.toProgramId); }
      else if (form.toType === "individual") { payload.toUserId = Number(form.toUserId); payload.toRole = "student"; }
      else if (form.toType === "teachers") { payload.toRole = "teacher"; }
      else if (form.toType === "ceo") { payload.toRole = "ceo"; }

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast({ title: "Message sent" });
        setOpenCompose(false);
        setForm({ ...BLANK });
        fetchAll();
      } else {
        toast({ title: "Failed to send message", variant: "destructive" });
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function markRead(msg: Msg) {
    setSelected(msg);
    if (!msg.read) {
      await fetch("/api/messages", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: msg.id }) });
      setInbox((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: true } : m));
    }
  }

  const displayed = tab === "inbox" ? inbox : sent;
  const unread = inbox.filter((m) => !m.read).length;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Messages</h1>
        <Dialog open={openCompose} onOpenChange={setOpenCompose}>
          <DialogTrigger asChild>
            <Button onClick={() => loadStudents()}><Plus className="h-4 w-4 mr-2" />Compose</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>New Message</DialogTitle></DialogHeader>
            <form onSubmit={handleCompose} className="space-y-4">
              <div className="space-y-2">
                <Label>Send To</Label>
                <Select value={form.toType} onValueChange={(v) => setForm((f) => ({ ...f, toType: v, toProgramId: "", toUserId: "" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="students">All Students</SelectItem>
                    <SelectItem value="program">Students in a Program</SelectItem>
                    <SelectItem value="individual">Individual Student</SelectItem>
                    <SelectItem value="teachers">All Teachers</SelectItem>
                    <SelectItem value="ceo">CEO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.toType === "program" && (
                <div className="space-y-2">
                  <Label>Program</Label>
                  <Select value={form.toProgramId} onValueChange={(v) => setForm((f) => ({ ...f, toProgramId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
                    <SelectContent>
                      {programs.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          <span className="font-mono text-xs text-gray-400 mr-2">{p.programCode}</span>{p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {form.toType === "individual" && (
                <div className="space-y-2">
                  <Label>Student</Label>
                  <Select value={form.toUserId} onValueChange={(v) => setForm((f) => ({ ...f, toUserId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s.userId} value={String(s.userId)}>
                          {s.firstName} {s.lastName} <span className="text-gray-400 ml-1 text-xs">({s.studentId})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="Subject..." required />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} rows={5} placeholder="Write your message..." required />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</> : <><Send className="h-4 w-4 mr-2" />Send Message</>}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-3 gap-4 h-[600px]">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button size="sm" variant={tab === "inbox" ? "default" : "outline"} className="flex-1 gap-1" onClick={() => setTab("inbox")}>
              <Inbox className="h-4 w-4" />Inbox
              {unread > 0 && <Badge className="ml-1 h-5 px-1.5 text-xs">{unread}</Badge>}
            </Button>
            <Button size="sm" variant={tab === "sent" ? "default" : "outline"} className="flex-1 gap-1" onClick={() => setTab("sent")}>
              <Mail className="h-4 w-4" />Sent
            </Button>
          </div>
          <Card className="flex-1 overflow-y-auto">
            <CardContent className="p-2 space-y-1">
              {loading ? (
                <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
              ) : displayed.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-6">No messages</p>
              ) : displayed.map((m) => (
                <button key={m.id} onClick={() => markRead(m)} className={`w-full text-left p-3 rounded-lg transition-colors ${selected?.id === m.id ? "bg-primary/10" : "hover:bg-gray-50"}`}>
                  <div className="flex justify-between items-center gap-2">
                    <span className={`text-sm truncate ${!m.read && tab === "inbox" ? "font-bold" : "font-medium"}`}>{m.fromName}</span>
                    <span className="text-xs text-gray-400 shrink-0">{new Date(m.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{m.subject}</p>
                  {!m.read && tab === "inbox" && <span className="inline-block w-2 h-2 rounded-full bg-primary mt-1" />}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="md:col-span-2 flex flex-col overflow-hidden">
          {selected ? (
            <>
              <CardHeader className="border-b pb-3 shrink-0">
                <CardTitle className="text-base">{selected.subject}</CardTitle>
                <p className="text-sm text-gray-500">
                  From: <span className="font-medium">{selected.fromName}</span>
                  <span className="ml-2 text-xs capitalize text-gray-400">({selected.fromRole})</span>
                  <span className="ml-3 text-xs text-gray-400">{new Date(selected.createdAt).toLocaleString()}</span>
                </p>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.body}</p>
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 flex-col gap-2">
              <Mail className="h-10 w-10 text-gray-200" />
              <p>Select a message to read</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

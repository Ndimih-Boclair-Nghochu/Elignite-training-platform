"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Announcement {
  id: number;
  title: string;
  content: string;
  targetRole: string;
  priority: string;
  author: string;
  createdAt: string;
  user: { firstName: string; lastName: string; photoUrl: string | null; role: string };
}

export default function CeoCommunicationsPage() {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", targetRole: "all", priority: "medium" });

  async function fetchAnnouncements() {
    const res = await fetch("/api/announcements");
    if (res.ok) setAnnouncements(await res.json());
  }

  useEffect(() => { fetchAnnouncements(); }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast({ title: "Announcement sent successfully" });
      setForm({ title: "", content: "", targetRole: "all", priority: "medium" });
      fetchAnnouncements();
    } else {
      toast({ title: "Failed to send", variant: "destructive" });
    }
    setLoading(false);
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Send className="h-5 w-5" />New Announcement</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-3">
              <div className="space-y-1"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Announcement title" required /></div>
              <div className="space-y-1"><Label>Message</Label><Textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="Write your message..." rows={4} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Target</Label>
                  <Select value={form.targetRole} onValueChange={(v) => setForm((f) => ({ ...f, targetRole: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Everyone</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="teacher">Teachers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : <><Send className="h-4 w-4 mr-2" />Send Announcement</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5" />Recent Announcements</CardTitle></CardHeader>
          <CardContent className="space-y-3 max-h-[450px] overflow-y-auto">
            {announcements.map((a) => (
              <div key={a.id} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {a.user?.photoUrl ? (
                      <img
                        src={a.user.photoUrl}
                        alt="Sender"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                        {a.user?.firstName?.[0] || "A"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{a.title}</p>
                      <p className="text-xs text-gray-500 truncate">{a.user?.firstName} {a.user?.lastName} · {a.user?.role}</p>
                    </div>
                  </div>
                  <Badge variant={a.priority === "high" ? "destructive" : a.priority === "medium" ? "default" : "secondary"} className="text-xs">{a.priority}</Badge>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-2">{a.content}</p>
                <div className="flex gap-2 text-xs text-gray-400">
                  <span>To: {a.targetRole}</span><span>·</span>
                  <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {announcements.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No announcements yet</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

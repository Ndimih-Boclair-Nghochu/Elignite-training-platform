"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Loader2 } from "lucide-react";

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: string;
  author: string;
  createdAt: string;
  user: { firstName: string; lastName: string; photoUrl: string | null; role: string };
}

const priorityStyle: Record<string, string> = {
  high: "border-l-4 border-l-red-500 bg-red-50/40",
  medium: "border-l-4 border-l-yellow-400 bg-yellow-50/40",
  low: "border-l-4 border-l-green-400 bg-green-50/40",
};

export default function StudentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/announcements").then((r) => r.json()).then(setAnnouncements).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Bell className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
      </div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <Card key={a.id} className={priorityStyle[a.priority] || ""}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    {a.user?.photoUrl ? (
                      <img src={a.user.photoUrl} alt={`${a.user.firstName} ${a.user.lastName}`} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">{a.user?.firstName?.[0] || "A"}</div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{a.title}</p>
                      <p className="text-xs text-gray-500 truncate">{a.user?.firstName} {a.user?.lastName} · {a.user?.role}</p>
                    </div>
                  </div>
                  <Badge variant={a.priority === "high" ? "destructive" : a.priority === "medium" ? "default" : "secondary"} className="text-xs ml-2 capitalize">{a.priority}</Badge>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{a.content}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>Posted by {a.author}</span><span>·</span>
                  <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {announcements.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No announcements yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

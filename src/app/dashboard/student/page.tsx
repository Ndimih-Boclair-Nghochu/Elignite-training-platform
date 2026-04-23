"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart2, CreditCard, Clock, Bell, TrendingUp, BookOpen } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Announcement {
  id: number;
  title: string;
  priority: string;
  createdAt: string;
  author: string;
  user: { firstName: string; lastName: string; photoUrl: string | null };
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<{ courseCode: string; total: number; grade: string }[]>([]);
  const [fees, setFees] = useState<{ status: string; amount: number }[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    fetch("/api/results").then((r) => r.json()).then(setResults).catch(() => {});
    fetch("/api/fees").then((r) => r.json()).then(setFees).catch(() => {});
    fetch("/api/announcements").then((r) => r.json()).then(setAnnouncements).catch(() => {});
  }, []);

  const totalDue = fees.filter((f) => f.status !== "paid").reduce((s, f) => s + f.amount, 0);
  const avgScore = results.length ? (results.reduce((s, r) => s + r.total, 0) / results.length).toFixed(1) : "–";
  const chartData = results.slice(0, 6).map((r) => ({ course: r.courseCode, score: r.total }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.firstName} 👋</h1>
          <p className="text-gray-500 text-sm">2024/2025 · Semester 1</p>
        </div>
        <Badge className="text-sm px-3 py-1">Active Student</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Avg Score", value: avgScore ? `${avgScore}%` : "–", icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
          { label: "Courses", value: results.length || "–", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Fees Due", value: totalDue ? `₣${(totalDue/1000).toFixed(0)}K` : "₣0", icon: CreditCard, color: "text-orange-500", bg: "bg-orange-50" },
          { label: "Announcements", value: announcements.length, icon: Bell, color: "text-purple-500", bg: "bg-purple-50" },
        ].map((s) => (
          <Card key={s.label}><CardContent className="pt-5">
            <div className="flex justify-between items-start">
              <div><p className="text-xs text-gray-500 mb-1">{s.label}</p><p className="text-2xl font-bold">{s.value}</p></div>
              <div className={`${s.bg} p-2.5 rounded-xl`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
            </div>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart2 className="h-4 w-4" />My Results</CardTitle></CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="course" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-gray-400 py-8 text-sm">No results available yet</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" />Announcements</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {announcements.slice(0, 4).map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="w-2 h-2 mt-1.5 rounded-full flex-shrink-0" style={{
                  backgroundColor: a.priority === "high" ? "#ef4444" : a.priority === "medium" ? "#eab308" : "#22c55e"
                }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{a.title}</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                    {a.user?.photoUrl && (
                      <img
                        src={a.user.photoUrl}
                        alt="Sender"
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    )}
                    <span>{a.user?.firstName} {a.user?.lastName}</span>
                    <span>·</span>
                    <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
            {announcements.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No announcements</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

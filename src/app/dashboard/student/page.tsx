"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart2, CreditCard, Bell, TrendingUp, BookOpen } from "lucide-react";
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

  const [courseCount, setCourseCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/results").then((r) => r.json()).then(setResults).catch(() => {});
    fetch("/api/fees").then((r) => r.json()).then(setFees).catch(() => {});
    fetch("/api/announcements").then((r) => r.json()).then(setAnnouncements).catch(() => {});
    fetch("/api/courses/mine").then((r) => r.ok ? r.json() : []).then((d: unknown[]) => setCourseCount(d.length)).catch(() => {});
  }, []);

  const totalDue = fees.filter((f) => f.status !== "paid").reduce((s, f) => s + f.amount, 0);
  const avgScore = results.length
    ? (results.reduce((s, r) => s + r.total, 0) / results.length).toFixed(1)
    : null;
  const chartData = results.slice(0, 6).map((r) => ({ course: r.courseCode, score: r.total }));

  const stats = [
    { label: "Avg Score", value: avgScore ? `${avgScore}%` : "–", icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
    { label: "Courses", value: courseCount ?? (results.length || "–"), icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Fees Due", value: totalDue ? `₣${(totalDue / 1000).toFixed(0)}K` : "₣0", icon: CreditCard, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Announcements", value: announcements.length, icon: Bell, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Welcome, {user?.firstName}</h1>
          <p className="text-sm text-gray-500">Student Portal</p>
        </div>
        <Badge className="px-3 py-1 text-sm">Active Student</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="mb-1 text-xs text-gray-500">{s.label}</p>
                  <p className="text-xl font-bold sm:text-2xl">{s.value}</p>
                </div>
                <div className={`${s.bg} shrink-0 rounded-xl p-2.5`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart2 className="h-4 w-4" />
              My Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="course" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Score" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">No results available yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4" />
              Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcements.slice(0, 4).map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-lg p-2 hover:bg-gray-50">
                <div
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      a.priority === "high" ? "#ef4444" : a.priority === "medium" ? "#eab308" : "#22c55e",
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                    {a.user?.photoUrl && (
                      <img src={a.user.photoUrl} alt="Sender" className="h-5 w-5 rounded-full object-cover" />
                    )}
                    <span>{a.user?.firstName} {a.user?.lastName}</span>
                    <span>·</span>
                    <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-400">No announcements</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

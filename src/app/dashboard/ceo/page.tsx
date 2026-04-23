"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, DollarSign, AlertCircle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const enrollmentChart = [
  { month: "Jan", count: 45 }, { month: "Feb", count: 62 }, { month: "Mar", count: 78 },
  { month: "Apr", count: 55 }, { month: "May", count: 89 }, { month: "Jun", count: 102 },
  { month: "Jul", count: 67 }, { month: "Aug", count: 120 }, { month: "Sep", count: 145 },
  { month: "Oct", count: 98 }, { month: "Nov", count: 73 }, { month: "Dec", count: 56 },
];

const revenueChart = [
  { month: "Jan", revenue: 12500000 }, { month: "Feb", revenue: 18600000 },
  { month: "Mar", revenue: 22400000 }, { month: "Apr", revenue: 16700000 },
  { month: "May", revenue: 28900000 }, { month: "Jun", revenue: 31200000 },
];

export default function CeoDashboardPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<unknown[]>([]);
  const [teachers, setTeachers] = useState<unknown[]>([]);
  const [enrollments, setEnrollments] = useState<{ status: string }[]>([]);

  useEffect(() => {
    fetch("/api/students").then((r) => r.json()).then(setStudents).catch(() => {});
    fetch("/api/teachers").then((r) => r.json()).then(setTeachers).catch(() => {});
    fetch("/api/enrollments").then((r) => r.json()).then(setEnrollments).catch(() => {});
  }, []);

  const pending = enrollments.filter((e) => e.status === "pending").length;

  const stats = [
    { label: "Total Students", value: students.length || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-50", change: "+12%" },
    { label: "Faculty Members", value: teachers.length || 0, icon: BookOpen, color: "text-green-500", bg: "bg-green-50", change: "+3%" },
    { label: "Pending Enrollments", value: pending, icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-50", change: "" },
    { label: "Total Revenue", value: "₣142.5M", icon: DollarSign, color: "text-purple-500", bg: "bg-purple-50", change: "+18%" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm">Welcome back, {user?.firstName}!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="pt-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  {s.change && <span className="text-xs text-green-600 font-medium">{s.change} this month</span>}
                </div>
                <div className={`${s.bg} p-3 rounded-xl`}><s.icon className={`h-6 w-6 ${s.color}`} /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" />Monthly Enrollments</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={enrollmentChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4" />Revenue Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₣${(v / 1000000).toFixed(0)}M`} />
                <Tooltip formatter={(v: number) => [`₣${(v / 1000000).toFixed(1)}M`, "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Enrollment Applications</CardTitle></CardHeader>
        <CardContent>
          {enrollments.slice(0, 5).map((e: { id?: number; firstName?: string; lastName?: string; program?: string; status: string; createdAt?: string }, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600">
                  {(e.firstName || "?")?.[0]}
                </div>
                <div>
                  <p className="font-medium text-sm">{e.firstName} {e.lastName}</p>
                  <p className="text-xs text-gray-400">{e.program}</p>
                </div>
              </div>
              <Badge variant={e.status === "approved" ? "default" : e.status === "pending" ? "secondary" : "destructive"} className="text-xs capitalize">
                {e.status}
              </Badge>
            </div>
          ))}
          {enrollments.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No applications yet</p>}
        </CardContent>
      </Card>
    </div>
  );
}

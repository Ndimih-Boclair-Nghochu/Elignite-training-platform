"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, DollarSign, AlertCircle, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Enrollment {
  id?: number;
  firstName?: string;
  lastName?: string;
  program?: string;
  status: string;
  createdAt?: string;
}

interface StudentFee {
  paidAmount: number;
  feeDue: number;
}

export default function CeoDashboardPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentFee[]>([]);
  const [teachers, setTeachers] = useState<unknown[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    fetch("/api/students").then((r) => r.json()).then(setStudents).catch(() => {});
    fetch("/api/teachers").then((r) => r.json()).then(setTeachers).catch(() => {});
    fetch("/api/enrollments").then((r) => r.json()).then(setEnrollments).catch(() => {});
  }, []);

  const pending = enrollments.filter((e) => e.status === "pending").length;

  // Real revenue from actual student payment records
  const totalCollected = students.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
  const totalOutstanding = students.reduce((sum, s) => sum + (s.feeDue || 0), 0);

  // Real monthly enrollment chart grouped from actual enrollment dates
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const enrollmentByMonth: Record<string, number> = {};
  monthLabels.forEach((m) => (enrollmentByMonth[m] = 0));
  enrollments.forEach((e) => {
    if (e.createdAt) {
      const month = monthLabels[new Date(e.createdAt).getMonth()];
      if (month) enrollmentByMonth[month] = (enrollmentByMonth[month] || 0) + 1;
    }
  });
  const enrollmentChart = monthLabels.map((month) => ({
    month,
    count: enrollmentByMonth[month] || 0,
  }));

  const stats = [
    { label: "Total Students", value: students.length, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Faculty Members", value: teachers.length, icon: BookOpen, color: "text-green-500", bg: "bg-green-50" },
    { label: "Pending Enrollments", value: pending, icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-50" },
    {
      label: "Revenue Collected",
      value: totalCollected > 0 ? `₣${(totalCollected / 1000).toFixed(0)}K` : "₣0",
      icon: DollarSign,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Dashboard Overview</h1>
        <p className="text-sm text-gray-500">Welcome back, {user?.firstName}!</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="mb-1 text-sm text-gray-500">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                </div>
                <div className={`${s.bg} rounded-xl p-3`}>
                  <s.icon className={`h-6 w-6 ${s.color}`} />
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
              <TrendingUp className="h-4 w-4" />
              Monthly Enrollments (Current Year)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={enrollmentChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4" />
              Fee Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-3">
              <p className="text-sm text-gray-600">Total Collected</p>
              <p className="font-bold text-green-700">₣{totalCollected.toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-orange-50 px-4 py-3">
              <p className="text-sm text-gray-600">Outstanding</p>
              <p className="font-bold text-orange-600">₣{totalOutstanding.toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3">
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="font-bold text-blue-700">{students.length}</p>
            </div>
            {students.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-4">No fee data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Enrollment Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {enrollments.slice(0, 5).map((e, i) => (
              <div key={i} className="flex items-center justify-between border-b py-2 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                    {(e.firstName || "?")?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-sm">{e.firstName} {e.lastName}</p>
                    <p className="truncate text-xs text-gray-400">{e.program}</p>
                  </div>
                </div>
                <Badge
                  variant={e.status === "approved" ? "default" : e.status === "pending" ? "secondary" : "destructive"}
                  className="ml-2 shrink-0 text-xs capitalize"
                >
                  {e.status}
                </Badge>
              </div>
            ))}
            {enrollments.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-400">No applications yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

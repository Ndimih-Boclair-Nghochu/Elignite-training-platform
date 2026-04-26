"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, BarChart2 } from "lucide-react";

interface Course {
  id: number;
  code: string;
  title: string;
  students: number;
  schedule?: string;
  room?: string;
}

interface Student {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  program: string;
  level: number;
}

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.teacherId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesRes, studentsRes] = await Promise.all([
          fetch(`/api/teachers/${user?.teacherId}/courses`),
          fetch(`/api/teachers/${user?.teacherId}/students`),
        ]);
        if (coursesRes.ok) setCourses(await coursesRes.json());
        if (studentsRes.ok) setStudents(await studentsRes.json());
      } catch (error) {
        console.error("Error fetching teacher data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.teacherId]);

  const stats = [
    { label: "My Courses", value: courses.length, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Total Students", value: students.length, icon: Users, color: "text-green-500", bg: "bg-green-50" },
    { label: "Programs", value: [...new Set(courses.map((c) => c.title))].length || courses.length, icon: BarChart2, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Welcome, {user?.firstName}</h1>
        <p className="text-sm text-gray-500">Teacher Portal</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="mb-1 text-xs text-gray-500">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
                <div className={`${s.bg} rounded-xl p-2.5`}>
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
            <CardTitle className="text-base">My Courses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-gray-500">Loading courses...</p>
            ) : courses.length > 0 ? (
              courses.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="shrink-0 rounded bg-blue-100 px-2 py-1 font-mono text-xs text-blue-700">
                      {c.code}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-sm">{c.title}</p>
                      {c.schedule && c.room && (
                        <p className="truncate text-xs text-gray-400">{c.schedule} · {c.room}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-2 shrink-0">{c.students} students</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No courses assigned yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Enrolled Students</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-gray-500">Loading students...</p>
            ) : students.length > 0 ? (
              students.slice(0, 8).map((s) => (
                <div key={s.id} className="rounded-lg border p-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-sm">{s.firstName} {s.lastName}</p>
                      <p className="truncate text-xs text-gray-400">{s.studentId} · Level {s.level}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">{s.program}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No enrolled students yet.</p>
            )}
            {students.length > 8 && (
              <p className="pt-2 text-xs text-gray-500">+{students.length - 8} more students</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

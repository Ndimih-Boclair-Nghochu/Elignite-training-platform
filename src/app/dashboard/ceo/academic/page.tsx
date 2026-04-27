"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Loader2 } from "lucide-react";

interface CourseItem {
  id: number; code: string; title: string; program: string;
  semester?: string; schedule?: string; teacherName: string | null; teacherId?: number;
}

export default function CeoAcademicPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [cRes, sRes] = await Promise.all([fetch("/api/courses"), fetch("/api/students")]);
      if (cRes.ok) setCourses(await cRes.json());
      if (sRes.ok) {
        const students: { status: string }[] = await sRes.json();
        setStudentCount(students.filter((s) => s.status === "active").length);
      }
      setLoading(false);
    }
    load();
  }, []);

  // Only show courses that have a teacher assigned (teacher-created courses)
  const teacherCourses = courses.filter((c) => c.teacherName && c.teacherId);
  const programs = [...new Set(teacherCourses.map((c) => c.program))];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Academic Overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-5 text-center">
          <p className="text-2xl font-bold text-primary">{teacherCourses.length}</p>
          <p className="text-sm text-gray-500">Active Courses</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5 text-center">
          <p className="text-2xl font-bold text-blue-600">{studentCount}</p>
          <p className="text-sm text-gray-500">Active Students</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5 text-center">
          <p className="text-2xl font-bold text-green-600">{programs.length}</p>
          <p className="text-sm text-gray-500">Programs</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5 text-center">
          <p className="text-2xl font-bold text-purple-600">{new Date().getFullYear()}</p>
          <p className="text-sm text-gray-500">Current Year</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Running Courses</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : teacherCourses.length === 0 ? (
            <p className="text-center text-gray-500 py-6">No courses assigned by teachers yet.</p>
          ) : teacherCourses.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-700 text-xs font-mono px-2 py-1 rounded">{c.code}</div>
                <div>
                  <p className="font-medium text-sm">{c.title}</p>
                  <p className="text-xs text-gray-400">
                    {c.teacherName || "Unassigned"}
                    {c.schedule ? ` · ${c.schedule}` : ""}
                    {c.semester ? ` · ${c.semester}` : ""}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">{c.program}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

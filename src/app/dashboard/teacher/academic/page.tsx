"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, BarChart3, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface CourseData {
  id: number; code: string; title: string; program: string;
  semester: string; year: number; schedule?: string; room?: string;
  enrolledStudents: number; averageScore: number; resultCount: number; attendanceCount: number;
}

export default function TeacherAcademicPage() {
  const { user } = useAuth();
  const teacherId = user?.teacherId;
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [activeStudents, setActiveStudents] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [cRes, sRes] = await Promise.all([
        fetch("/api/teachers/courses"),
        teacherId ? fetch(`/api/teachers/${teacherId}/students`) : Promise.resolve(null),
      ]);
      if (cRes.ok) setCourses(await cRes.json());
      if (sRes && sRes.ok) {
        const students: { status: string }[] = await sRes.json();
        setActiveStudents(students.filter((s) => s.status === "active").length);
      }
      setLoading(false);
    }
    load();
  }, [teacherId]);

  const avgGrade = courses.length > 0
    ? Math.round((courses.reduce((sum, c) => sum + c.averageScore, 0) / courses.length) * 100) / 100
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Academic Overview</h1>
        <div className="text-sm text-gray-500">{courses.length} course{courses.length !== 1 ? "s" : ""}</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-primary">{courses.length}</div>
            <div className="text-sm text-gray-500 mt-1">Active Courses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{activeStudents}</div>
            <div className="text-sm text-gray-500 mt-1">Active Students</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-green-600">{avgGrade}%</div>
            <div className="text-sm text-gray-500 mt-1">Avg Grade</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {courses.reduce((sum, c) => sum + c.resultCount, 0)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Total Results</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            My Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No courses assigned yet.</div>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="secondary" className="font-mono text-xs">{course.code}</Badge>
                      <Badge variant="outline" className="text-xs">{course.program}</Badge>
                      {course.semester && <Badge variant="outline" className="text-xs">{course.semester}</Badge>}
                    </div>
                    <h3 className="font-semibold truncate">{course.title}</h3>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {[course.schedule, course.room].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 shrink-0">
                    <div className="text-center">
                      <Users className="h-4 w-4 text-blue-600 mx-auto mb-0.5" />
                      <div className="font-semibold text-sm">{course.enrolledStudents}</div>
                      <div className="text-xs text-gray-400">Students</div>
                    </div>
                    <div className="text-center">
                      <BarChart3 className="h-4 w-4 text-green-600 mx-auto mb-0.5" />
                      <div className="font-semibold text-sm">{course.averageScore}%</div>
                      <div className="text-xs text-gray-400">Avg</div>
                    </div>
                    <div className="text-center">
                      <BookOpen className="h-4 w-4 text-purple-600 mx-auto mb-0.5" />
                      <div className="font-semibold text-sm">{course.resultCount}</div>
                      <div className="text-xs text-gray-400">Results</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-orange-600 mx-auto mb-0.5 font-bold">✓</div>
                      <div className="font-semibold text-sm">{course.attendanceCount}</div>
                      <div className="text-xs text-gray-400">Attend.</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

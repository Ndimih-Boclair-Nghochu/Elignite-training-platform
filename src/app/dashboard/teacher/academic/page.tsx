"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, BarChart3, Loader2 } from "lucide-react";

interface CourseData {
  id: number;
  code: string;
  title: string;
  program: string;
  level: number;
  semester: string;
  year: number;
  schedule: string;
  room: string;
  enrolledStudents: number;
  averageScore: number;
  resultCount: number;
  attendanceCount: number;
}

export default function TeacherAcademicPage() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teachers/courses")
      .then((r) => r.json())
      .then(setCourses)
      .catch((err) => {
        console.error("Error fetching courses:", err);
        setCourses([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalStudents = courses.reduce((sum, c) => sum + c.enrolledStudents, 0);
  const avgGrade = courses.length > 0
    ? Math.round((courses.reduce((sum, c) => sum + c.averageScore, 0) / courses.length) * 100) / 100
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Academic Courses</h1>
        <div className="text-sm text-gray-500">
          {courses.length} course{courses.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-primary">{courses.length}</div>
            <div className="text-sm text-gray-500 mt-1">Active Courses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{totalStudents}</div>
            <div className="text-sm text-gray-500 mt-1">Total Students</div>
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

      {/* Courses List */}
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
            <div className="text-center py-8">
              <p className="text-gray-500">No courses assigned yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* Course Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {course.code}
                      </Badge>
                      <Badge variant="outline">{course.program}</Badge>
                      <Badge variant="outline">Level {course.level}</Badge>
                    </div>
                    <h3 className="font-semibold">{course.title}</h3>
                    <div className="text-xs text-gray-400 mt-1">
                      {course.schedule && `📅 ${course.schedule}`}
                      {course.room && ` · 📍 ${course.room}`}
                      {course.semester && ` · ${course.semester}`}
                    </div>
                  </div>

                  {/* Course Stats */}
                  <div className="grid grid-cols-4 gap-4 ml-4">
                    <div className="text-center">
                      <Users className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                      <div className="font-semibold text-sm">{course.enrolledStudents}</div>
                      <div className="text-xs text-gray-400">Students</div>
                    </div>
                    <div className="text-center">
                      <BarChart3 className="h-4 w-4 text-green-600 mx-auto mb-1" />
                      <div className="font-semibold text-sm">{course.averageScore}%</div>
                      <div className="text-xs text-gray-400">Avg Grade</div>
                    </div>
                    <div className="text-center">
                      <BookOpen className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                      <div className="font-semibold text-sm">{course.resultCount}</div>
                      <div className="text-xs text-gray-400">Results</div>
                    </div>
                    <div className="text-center">
                      <div className="h-4 w-4 text-orange-600 mx-auto mb-1">✓</div>
                      <div className="font-semibold text-sm">{course.attendanceCount}</div>
                      <div className="text-xs text-gray-400">Records</div>
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

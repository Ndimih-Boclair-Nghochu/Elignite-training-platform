"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, ClipboardList, BarChart2 } from "lucide-react";

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

const TASKS = [
  { task: "Grade assignments", due: "Nov 15", urgent: true },
  { task: "Upload lecture notes", due: "Nov 18", urgent: false },
  { task: "Review project topics", due: "Nov 20", urgent: false },
];

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

        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setCourses(coursesData);
        }

        if (studentsRes.ok) {
          const studentsData = await studentsRes.json();
          setStudents(studentsData);
        }
      } catch (error) {
        console.error("Error fetching teacher data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.teacherId]);

  const totalStudents = students.length;
  const stats = [
    {
      label: "My Courses",
      value: courses.length,
      icon: BookOpen,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Total Students",
      value: totalStudents,
      icon: Users,
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      label: "Pending Tasks",
      value: TASKS.length,
      icon: ClipboardList,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      label: "Pass Rate",
      value: "94%",
      icon: BarChart2,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user?.firstName} 👋</h1>
        <p className="text-gray-500 text-sm">Semester 1 · 2024/2025</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
                <div className={`${s.bg} p-2.5 rounded-xl`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
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
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-700 font-mono text-xs px-2 py-1 rounded">
                      {c.code}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{c.title}</p>
                      {c.schedule && c.room && (
                        <p className="text-xs text-gray-400">
                          {c.schedule} · {c.room}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary">{c.students} students</Badge>
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
              students.slice(0, 5).map((s) => (
                <div key={s.id} className="p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {s.firstName} {s.lastName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {s.studentId} · Level {s.level}
                      </p>
                    </div>
                    <Badge variant="outline">{s.program}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No enrolled students yet.
              </p>
            )}
            {students.length > 5 && (
              <p className="text-xs text-gray-500 pt-2">
                +{students.length - 5} more students
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

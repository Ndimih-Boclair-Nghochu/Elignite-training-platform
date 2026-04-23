"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Loader2, TrendingUp, CheckCircle, XCircle, Clock, BookOpen, Award } from "lucide-react";

interface StudentResults {
  attendance: {
    records: Array<{
      id: number;
      date: string;
      status: "present" | "absent" | "late";
      course: { code: string; title: string };
    }>;
    totalClasses: number;
    present: number;
    absent: number;
    late: number;
    percentage: number;
    remark: string;
  };
  projects: {
    records: Array<{
      id: number;
      projectId: number;
      score: number;
      feedback?: string;
      gradedAt?: string;
      project: { code: string; title: string; maxScore: number };
    }>;
    totalProjects: number;
    gradedProjects: number;
    averageScore: number;
    remark: string;
  };
  courses: {
    records: Array<{
      id: number;
      ca: number;
      exam: number;
      total: number;
      grade: string;
      semester: string;
      year: number;
      courseCode: string;
      courseTitle: string;
      credits: number;
    }>;
    average: string;
  };
  overall: {
    score: number;
    remark: string;
    composition: {
      attendanceWeight: number;
      projectsWeight: number;
    };
  };
}

function gradeColor(grade: string) {
  if (grade.startsWith("A")) return "text-green-600";
  if (grade.startsWith("B")) return "text-blue-600";
  if (grade.startsWith("C")) return "text-yellow-600";
  return "text-red-600";
}

function getRemarkColor(remark: string) {
  if (remark === "Excellent") return "text-green-600 bg-green-50";
  if (remark === "Very Good") return "text-blue-600 bg-blue-50";
  if (remark === "Good") return "text-cyan-600 bg-cyan-50";
  if (remark === "Satisfactory") return "text-yellow-600 bg-yellow-50";
  return "text-red-600 bg-red-50";
}

export default function StudentResultsPage() {
  const [data, setData] = useState<StudentResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/results/me")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Academic Results & Transcript</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !data ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500">No results available yet.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overall Score Section */}
          <div className="grid grid-cols-1 gap-4">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <CardTitle>Overall Score</CardTitle>
                  </div>
                  <Badge className={`text-sm px-3 py-1 ${getRemarkColor(data.overall.remark)}`}>
                    {data.overall.remark}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-5xl font-bold text-primary">{data.overall.score}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Based on Attendance ({(data.overall.composition.attendanceWeight * 100).toFixed(0)}%) and Projects ({(data.overall.composition.projectsWeight * 100).toFixed(0)}%)
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-600">Attendance Contribution</p>
                    <p className="text-2xl font-bold text-orange-600">{data.attendance.percentage}%</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-600">Projects Contribution</p>
                    <p className="text-2xl font-bold text-blue-600">{data.projects.averageScore}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Attendance Summary
              </CardTitle>
              <Badge className={`text-sm px-3 py-1 ${getRemarkColor(data.attendance.remark)}`}>
                {data.attendance.remark}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Attendance</p>
                  <p className="text-3xl font-bold text-green-600">{data.attendance.percentage}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Present</p>
                  <p className="text-3xl font-bold text-green-600">{data.attendance.present}</p>
                  <p className="text-xs text-gray-500">of {data.attendance.totalClasses}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Absent</p>
                  <p className="text-3xl font-bold text-red-600">{data.attendance.absent}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Late</p>
                  <p className="text-3xl font-bold text-yellow-600">{data.attendance.late}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Attendance History (Latest 10)</p>
                <div className="space-y-2">
                  {data.attendance.records.slice(0, 10).map((record) => (
                    <div key={record.id} className="flex items-center justify-between text-sm p-2 bg-white rounded">
                      <div className="flex items-center gap-2">
                        {record.status === "present" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : record.status === "absent" ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                        <div>
                          <p className="font-medium">{record.course.title}</p>
                          <p className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Badge variant={record.status === "present" ? "default" : record.status === "absent" ? "destructive" : "secondary"} className="capitalize">
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Projects Summary
              </CardTitle>
              <Badge className={`text-sm px-3 py-1 ${getRemarkColor(data.projects.remark)}`}>
                {data.projects.remark}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-3xl font-bold text-blue-600">{data.projects.averageScore}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Graded Projects</p>
                  <p className="text-3xl font-bold text-purple-600">{data.projects.gradedProjects}</p>
                  <p className="text-xs text-gray-500">of {data.projects.totalProjects}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{data.projects.totalProjects - data.projects.gradedProjects}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Projects Details</p>
                <div className="space-y-3">
                  {data.projects.records.map((project) => (
                    <div key={project.id} className="bg-white rounded-lg p-3 border">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">{project.project.title}</p>
                          <p className="text-xs text-gray-500">{project.project.code}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{project.score}</p>
                          <p className="text-xs text-gray-500">/{project.project.maxScore}</p>
                        </div>
                      </div>
                      {project.gradedAt && (
                        <p className="text-xs text-gray-500">
                          Graded: {new Date(project.gradedAt).toLocaleDateString()}
                        </p>
                      )}
                      {project.feedback && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700 border border-blue-200">
                          <p className="font-semibold mb-1">Feedback:</p>
                          <p>{project.feedback}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {data.projects.records.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No projects assigned yet</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Results Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Course Results
              </CardTitle>
              <Badge variant="outline" className="text-sm">Avg: {data.courses.average}%</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-t">
                    <TableHead>Code</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead className="text-center">CA (40)</TableHead>
                    <TableHead className="text-center">Exam (60)</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.courses.records.length > 0 ? (
                    data.courses.records.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-sm">{r.courseCode}</TableCell>
                        <TableCell className="font-medium text-sm">{r.courseTitle}</TableCell>
                        <TableCell className="text-center">{r.ca}</TableCell>
                        <TableCell className="text-center">{r.exam}</TableCell>
                        <TableCell className="text-center font-semibold">{r.total}</TableCell>
                        <TableCell className="text-center">
                          <span className={`font-bold ${gradeColor(r.grade)}`}>{r.grade}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={r.total >= 50 ? "default" : "destructive"} className="text-xs">
                            {r.total >= 50 ? "Pass" : "Fail"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                        No course results published yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

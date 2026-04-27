"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Clock, BookOpen, BookMarked, Award } from "lucide-react";

interface StudentResults {
  attendance: {
    records: Array<{ id: number; date: string; status: string; course: { code: string; title: string } }>;
    totalClasses: number; present: number; absent: number; late: number;
    percentage: number; remark: string;
  };
  projects: {
    records: Array<{ id: number; projectId: number; score: number; feedback?: string; gradedAt?: string; project: { code: string; title: string; maxScore: number } }>;
    totalProjects: number; gradedProjects: number; averageScore: number; remark: string;
  };
  exercises: {
    records: Array<{ id: number; exerciseId: number; score: number | null; feedback?: string; gradedAt?: string; exercise: { title: string; maxScore: number; course: { code: string; title: string } } }>;
    totalGraded: number; averageScore: number; remark: string;
  };
  overall: {
    score: number; remark: string;
    composition: { exercisesWeight: number; attendanceWeight: number; projectsWeight: number };
  };
}

const remarkColor: Record<string, string> = {
  "Excellent": "text-green-700 bg-green-50 border-green-200",
  "Very Good": "text-blue-700 bg-blue-50 border-blue-200",
  "Good": "text-blue-600 bg-blue-50 border-blue-200",
  "Satisfactory": "text-yellow-700 bg-yellow-50 border-yellow-200",
  "Below Required": "text-red-700 bg-red-50 border-red-200",
};

function RemarkBadge({ remark }: { remark: string }) {
  return <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${remarkColor[remark] || ""}`}>{remark}</span>;
}

export default function StudentResultsPage() {
  const [data, setData] = useState<StudentResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/results/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && !d.error) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!data) return (
    <div className="p-6">
      <Card>
        <CardContent className="pt-8 pb-8 text-center">
          <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No results available yet.</p>
          <p className="text-gray-400 text-sm mt-1">Results will appear here once exercises, attendance, and projects are recorded.</p>
        </CardContent>
      </Card>
    </div>
  );

  const overall = data.overall ?? { score: 0, remark: "Below Required", composition: { exercisesWeight: 0.2, attendanceWeight: 0.1, projectsWeight: 0.7 } };
  const attendance = data.attendance ?? { records: [], totalClasses: 0, present: 0, absent: 0, late: 0, percentage: 0, remark: "Below Required" };
  const projects = data.projects ?? { records: [], totalProjects: 0, gradedProjects: 0, averageScore: 0, remark: "Below Required" };
  const exercises = data.exercises ?? { records: [], totalGraded: 0, averageScore: 0, remark: "Below Required" };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">My Assessment</h1>

      {/* Overall Score */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2"><Award className="h-5 w-5 text-primary" /><CardTitle>Overall Score</CardTitle></div>
            <RemarkBadge remark={overall.remark} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-6xl font-bold text-primary">{overall.score}</p>
            <p className="text-sm text-gray-500 mt-2">out of 100</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs text-gray-500">Exercises (20%)</p>
              <p className="text-2xl font-bold text-purple-600">{exercises.averageScore}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs text-gray-500">Attendance (10%)</p>
              <p className="text-2xl font-bold text-orange-600">{attendance.percentage}%</p>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs text-gray-500">Projects (70%)</p>
              <p className="text-2xl font-bold text-blue-600">{projects.averageScore}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercises */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2"><BookMarked className="h-5 w-5 text-purple-600" />Exercises (20%)</CardTitle>
          <RemarkBadge remark={exercises.remark} />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-sm text-gray-500">Average Score</p><p className="text-3xl font-bold text-purple-600">{exercises.averageScore}</p></div>
            <div><p className="text-sm text-gray-500">Graded</p><p className="text-3xl font-bold text-green-600">{exercises.totalGraded}</p></div>
            <div><p className="text-sm text-gray-500">Avg %</p><p className="text-3xl font-bold text-gray-700">{exercises.averageScore}%</p></div>
          </div>
          {exercises.records.length > 0 && (
            <div className="space-y-2 mt-3">
              {exercises.records.map((r) => (
                <div key={r.id} className="bg-gray-50 rounded-lg p-3 border flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm">{r.exercise?.title}</p>
                    <p className="text-xs text-gray-500">{r.exercise?.course?.code} — {r.exercise?.course?.title}</p>
                    {r.feedback && <p className="text-xs text-gray-600 mt-1">💬 {r.feedback}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-bold text-purple-600">{r.score}</p>
                    <p className="text-xs text-gray-500">/{r.exercise.maxScore}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {exercises.records.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No graded exercises yet</p>}
        </CardContent>
      </Card>

      {/* Attendance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-orange-600" />Attendance (10%)</CardTitle>
          <RemarkBadge remark={attendance.remark} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div><p className="text-sm text-gray-500">Rate</p><p className="text-3xl font-bold text-orange-600">{attendance.percentage}%</p></div>
            <div><p className="text-sm text-gray-500">Present</p><p className="text-3xl font-bold text-green-600">{attendance.present}</p><p className="text-xs text-gray-400">of {attendance.totalClasses}</p></div>
            <div><p className="text-sm text-gray-500">Absent</p><p className="text-3xl font-bold text-red-600">{attendance.absent}</p></div>
            <div><p className="text-sm text-gray-500">Late</p><p className="text-3xl font-bold text-yellow-600">{attendance.late}</p></div>
          </div>
          {attendance.records.slice(0, 8).length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Recent Attendance</p>
              {attendance.records.slice(0, 8).map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded border">
                  <div>
                    <p className="font-medium">{r.course.title}</p>
                    <p className="text-xs text-gray-500">{new Date(r.date).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={r.status === "present" ? "default" : r.status === "absent" ? "destructive" : "secondary"} className="capitalize">
                    {r.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-blue-600" />Projects (70%)</CardTitle>
          <RemarkBadge remark={projects.remark} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-sm text-gray-500">Average Score</p><p className="text-3xl font-bold text-blue-600">{projects.averageScore}</p></div>
            <div><p className="text-sm text-gray-500">Graded</p><p className="text-3xl font-bold text-purple-600">{projects.gradedProjects}</p><p className="text-xs text-gray-400">of {projects.totalProjects}</p></div>
            <div><p className="text-sm text-gray-500">Pending</p><p className="text-3xl font-bold text-yellow-600">{projects.totalProjects - projects.gradedProjects}</p></div>
          </div>
          <div className="space-y-3">
            {projects.records.map((p) => (
              <div key={p.id} className="bg-white rounded-lg p-3 border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{p.project.title}</p>
                    <p className="text-xs text-gray-500">{p.project.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{p.score}</p>
                    <p className="text-xs text-gray-500">/{p.project.maxScore}</p>
                  </div>
                </div>
                {p.feedback && <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700 border border-blue-200"><p className="font-semibold mb-1">Feedback:</p><p>{p.feedback}</p></div>}
              </div>
            ))}
            {projects.records.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No projects graded yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

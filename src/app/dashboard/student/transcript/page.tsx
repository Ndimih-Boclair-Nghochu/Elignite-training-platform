"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Loader2 } from "lucide-react";

interface ResultRecord {
  courseCode: string; courseTitle: string; credits: number; total: number; grade: string;
}

interface TranscriptData {
  results: ResultRecord[];
  exerciseAvg: number; attendancePct: number; projectAvg: number; overallScore: number;
}

function scoreToGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 75) return "B+";
  if (score >= 70) return "B";
  if (score >= 65) return "C+";
  if (score >= 60) return "C";
  if (score >= 55) return "D+";
  if (score >= 50) return "D";
  return "F";
}

export default function TranscriptPage() {
  const [data, setData] = useState<TranscriptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/results/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d || d.error) { setData(null); return; }
        try {
          const records: ResultRecord[] = (Array.isArray(d.exercises?.records) ? d.exercises.records : [])
            .filter((r: any) => r?.exercise?.course)
            .map((r: any) => ({
              courseCode: r.exercise.course?.code ?? "N/A",
              courseTitle: r.exercise.course?.title ?? "Unknown",
              credits: 3,
              total: r.score ?? 0,
              grade: scoreToGrade(r.score ?? 0),
            }));
          setData({
            results: records,
            exerciseAvg: d.exercises?.averageScore ?? 0,
            attendancePct: d.attendance?.percentage ?? 0,
            projectAvg: d.projects?.averageScore ?? 0,
            overallScore: d.overall?.score ?? 0,
          });
        } catch {
          setData(null);
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Academic Transcript</h1>
        <a href="/api/fees/receipt" download>
          <span className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-md hover:bg-gray-50 cursor-pointer">
            <Download className="h-4 w-4" />Download Receipt
          </span>
        </a>
      </div>

      {!data || (data.results.length === 0 && data.overallScore === 0) ? (
        <Card>
          <CardContent className="pt-8 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No academic records available yet.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-bold">Academic Record</p>
                  <p className="text-sm text-gray-500">Exercises 20% · Attendance 10% · Projects 70%</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-700">{data.overallScore}</p>
                <p className="text-xs text-gray-500">Overall Score / 100</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card className="text-center"><CardContent className="pt-4">
              <p className="text-2xl font-bold text-purple-600">{data.exerciseAvg}%</p>
              <p className="text-xs text-gray-500 mt-1">Exercises (20%)</p>
            </CardContent></Card>
            <Card className="text-center"><CardContent className="pt-4">
              <p className="text-2xl font-bold text-orange-600">{data.attendancePct}%</p>
              <p className="text-xs text-gray-500 mt-1">Attendance (10%)</p>
            </CardContent></Card>
            <Card className="text-center"><CardContent className="pt-4">
              <p className="text-2xl font-bold text-blue-600">{data.projectAvg}%</p>
              <p className="text-xs text-gray-500 mt-1">Projects (70%)</p>
            </CardContent></Card>
          </div>

          {data.results.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Exercise Results by Course</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Code</TableHead><TableHead>Course</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {data.results.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-sm">{r.courseCode}</TableCell>
                        <TableCell className="text-sm">{r.courseTitle}</TableCell>
                        <TableCell className="text-center">{r.total}%</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-semibold text-primary">{r.grade}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

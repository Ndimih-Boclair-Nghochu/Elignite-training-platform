"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

interface AttendanceRecord {
  id: number;
  studentId: number;
  courseId: number;
  date: string;
  status: "present" | "absent" | "late";
  course: {
    code: string;
    title: string;
  };
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/attendance/me`)
      .then((r) => r.json())
      .then(setAttendance)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Group by course
  const groupedByCourse = attendance.reduce(
    (acc, record) => {
      const courseKey = record.course.code;
      if (!acc[courseKey]) {
        acc[courseKey] = {
          course: record.course,
          records: [],
        };
      }
      acc[courseKey].records.push(record);
      return acc;
    },
    {} as Record<string, { course: any; records: AttendanceRecord[] }>
  );

  const stats = Object.entries(groupedByCourse).map(([, data]) => {
    const present = data.records.filter((r) => r.status === "present").length;
    const absent = data.records.filter((r) => r.status === "absent").length;
    const late = data.records.filter((r) => r.status === "late").length;
    const total = data.records.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
      course: data.course,
      present,
      absent,
      late,
      total,
      percentage,
      records: data.records.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    };
  });

  const totalAttended = stats.reduce((sum, s) => sum + s.present, 0);
  const totalClasses = stats.reduce((sum, s) => sum + s.total, 0);
  const totalMissed = stats.reduce((sum, s) => sum + s.absent, 0);
  const overallPercentage =
    totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

  // Get today's attendance records
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaysRecords = attendance.filter((record) => {
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);
    return recordDate.getTime() === today.getTime();
  });

  const sortedByDate = attendance
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Attendance</h1>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="text-center">
              <CardContent className="pt-5">
                <p className="text-3xl font-bold text-green-500">
                  {overallPercentage}%
                </p>
                <p className="text-sm text-gray-500">Overall</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-5">
                <p className="text-3xl font-bold text-blue-500">
                  {totalAttended}
                </p>
                <p className="text-sm text-gray-500">Attended</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-5">
                <p className="text-3xl font-bold text-red-400">{totalMissed}</p>
                <p className="text-sm text-gray-500">Missed</p>
              </CardContent>
            </Card>
          </div>

          {/* Warning if below 75% */}
          {overallPercentage < 75 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
              ⚠️ Your attendance is below the 75% minimum. You may be barred
              from exams.
            </div>
          )}

          {/* Today's Attendance */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              {todaysRecords.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No classes scheduled for today or no attendance recorded.
                </p>
              ) : (
                <div className="space-y-3">
                  {todaysRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {record.status === "present" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : record.status === "absent" ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {record.course.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {record.course.code}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          record.status === "present"
                            ? "default"
                            : record.status === "absent"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs capitalize"
                      >
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* By Course */}
          {stats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>By Course</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.map((stat) => (
                  <div key={stat.course.code}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">
                        {stat.course.title}
                      </span>
                      <span className="text-sm font-semibold">
                        {stat.present}/{stat.total} ({stat.percentage}%)
                      </span>
                    </div>
                    <Progress value={stat.percentage} className="h-2" />
                    {stat.percentage < 75 && (
                      <p className="text-xs text-red-500 mt-1">Below minimum</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Attendance History */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
            </CardHeader>
            <CardContent>
              {sortedByDate.length === 0 ? (
                <p className="text-sm text-gray-500">No attendance records yet.</p>
              ) : (
                <div className="space-y-0">
                  {sortedByDate.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between py-3 px-2 border-b last:border-0 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {record.status === "present" ? (
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : record.status === "absent" ? (
                          <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {record.course.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {record.course.code}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 whitespace-nowrap ml-2">
                          {new Date(record.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <Badge
                        variant={
                          record.status === "present"
                            ? "default"
                            : record.status === "absent"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs capitalize flex-shrink-0 ml-2"
                      >
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

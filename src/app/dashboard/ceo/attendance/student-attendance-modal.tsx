"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StudentAttendanceModalProps {
  studentId: number;
  studentName: string;
  studentIdNum: string;
  program: string;
}

interface AttendanceHistory {
  id: number;
  date: string;
  status: "present" | "absent" | "late";
  course: {
    title: string;
    code: string;
  };
}

export function StudentAttendanceModal({
  studentId,
  studentName,
  studentIdNum,
  program,
}: StudentAttendanceModalProps) {
  const { toast } = useToast();
  const [openTakeAttendance, setOpenTakeAttendance] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [history, setHistory] = useState<AttendanceHistory[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [status, setStatus] = useState<string>("present");

  // Fetch courses for this program
  useEffect(() => {
    if (openTakeAttendance) {
      fetchCourses();
    }
  }, [openTakeAttendance]);

  // Fetch attendance history
  useEffect(() => {
    if (openHistory) {
      fetchAttendanceHistory();
    }
  }, [openHistory]);

  async function fetchCourses() {
    try {
      setLoading(true);
      const res = await fetch(`/api/courses?program=${encodeURIComponent(program)}`);
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourse(data[0].id.toString());
        }
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAttendanceHistory() {
    try {
      setLoading(true);
      const res = await fetch(`/api/attendance/student/${studentId}?program=${encodeURIComponent(program)}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleTakeAttendance() {
    if (!selectedCourse || !date || !status) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          courseId: parseInt(selectedCourse),
          date,
          status,
        }),
      });

      if (res.ok) {
        toast({ title: "Attendance recorded successfully" });
        setOpenTakeAttendance(false);
        setDate(new Date().toISOString().split("T")[0]);
        setStatus("present");
        // Refresh history if it's open
        if (openHistory) {
          fetchAttendanceHistory();
        }
      } else {
        const error = await res.json();
        toast({ title: error.error || "Failed to record attendance", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error recording attendance", variant: "destructive" });
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "absent":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "late":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800";
      case "absent":
        return "bg-red-100 text-red-800";
      case "late":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex gap-2">
      {/* Take Attendance Modal */}
      <Dialog open={openTakeAttendance} onOpenChange={setOpenTakeAttendance}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            Take Attendance
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Take Attendance</DialogTitle>
            <p className="text-sm text-gray-600 mt-2">
              {studentName} ({studentIdNum})
            </p>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course..." />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.code} - {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setOpenTakeAttendance(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleTakeAttendance}
                disabled={submitting || loading || !selectedCourse}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Recording...
                  </>
                ) : (
                  "Record Attendance"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Attendance History Modal */}
      <Dialog open={openHistory} onOpenChange={setOpenHistory}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            View History
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Attendance History</DialogTitle>
            <p className="text-sm text-gray-600 mt-2">
              {studentName} ({studentIdNum}) - {program}
            </p>
          </DialogHeader>

          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No attendance records found</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {history.map((record) => (
                  <Card key={record.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{record.course.code} - {record.course.title}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(record.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <Badge className={`${getStatusColor(record.status)} flex items-center gap-1`}>
                          {getStatusIcon(record.status)}
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

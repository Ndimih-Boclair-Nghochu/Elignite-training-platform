"use client";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StudentAttendanceModal } from "./student-attendance-modal";

interface Student {
  id: number;
  studentId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  attendances: any[];
}

interface ProgramOption {
  id: number;
  title: string;
  slug: string;
  programCode: string;
  studentCount: number;
  courseCount: number;
}

interface ProgramData {
  program: string;
  programId: number;
  students: Student[];
}

export default function CEOAttendancePage() {
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [programData, setProgramData] = useState<ProgramData | null>(null);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  // Fetch programs on mount
  useEffect(() => {
    fetchPrograms();
  }, []);

  // Fetch program data when selected program changes
  useEffect(() => {
    if (selectedProgramId) {
      fetchProgramData();
    }
  }, [selectedProgramId]);

  async function fetchPrograms() {
    try {
      const res = await fetch("/api/attendance/programs");
      if (res.ok) {
        const data: ProgramOption[] = await res.json();
        setPrograms(data);
        if (data.length > 0) {
          setSelectedProgramId(String(data[0].id));
        }
      }
    } catch (error) {
      toast({ title: "Error loading programs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function fetchProgramData() {
    try {
      setLoading(true);
      const res = await fetch(`/api/programs/students?programId=${encodeURIComponent(selectedProgramId)}`);
      if (res.ok) {
        const data = await res.json();
        setProgramData(data);
      } else {
        toast({ title: "Error loading program data", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error loading program data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

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

  const attendanceSummary = useMemo(() => {
    if (!programData) return { present: 0, absent: 0, late: 0 };

    let present = 0,
      absent = 0,
      late = 0;

    programData.students.forEach((student) => {
      student.attendances.forEach((record) => {
        if (record.status === "present") present++;
        else if (record.status === "absent") absent++;
        else if (record.status === "late") late++;
      });
    });

    return { present, absent, late };
  }, [programData]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Attendance Management</h1>
      </div>

      {/* Program Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Program</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Program</Label>
            <Select value={selectedProgramId} onValueChange={setSelectedProgramId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a program..." />
              </SelectTrigger>
              <SelectContent>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={String(program.id)}>
                    <span className="mr-2 font-mono text-xs text-gray-500">{program.programCode}</span>
                    {program.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {programData && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Total Students</p>
                <p className="text-3xl font-bold text-primary">
                  {programData.students.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Present</p>
                <p className="text-3xl font-bold text-green-600">
                  {attendanceSummary.present}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Late</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {attendanceSummary.late}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Absent</p>
                <p className="text-3xl font-bold text-red-600">
                  {attendanceSummary.absent}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Students List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : programData && programData.students.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students in {programData.program}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Student Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Student ID</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {programData.students.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        {student.user.firstName} {student.user.lastName}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        {student.studentId}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{student.user.email}</td>
                      <td className="py-3 px-4">
                        <StudentAttendanceModal
                          studentId={student.id}
                          studentName={`${student.user.firstName} ${student.user.lastName}`}
                          studentIdNum={student.studentId}
                          program={programs.find((program) => String(program.id) === selectedProgramId)?.slug || ""}
                          programId={Number(selectedProgramId)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500">
              {selectedProgramId
                ? "No students found in this program."
                : "Select a program to view students."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

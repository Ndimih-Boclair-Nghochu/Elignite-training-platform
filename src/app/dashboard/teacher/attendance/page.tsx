"use client";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StudentAttendanceModal } from "../../ceo/attendance/student-attendance-modal";

interface ProgramOption { id: number; programCode: string; title: string; slug: string; }
interface Student {
  id: number; studentId: string;
  user: { firstName: string; lastName: string; email: string; };
  attendances: any[];
}

export default function TeacherAttendancePage() {
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [programTitle, setProgramTitle] = useState("");
  const [programSlug, setProgramSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { fetchTeacherPrograms(); }, []);
  useEffect(() => { if (selectedProgramId) fetchStudents(); }, [selectedProgramId]);

  async function fetchTeacherPrograms() {
    try {
      const res = await fetch("/api/teachers/programs");
      if (res.ok) {
        const data: ProgramOption[] = await res.json();
        setPrograms(data);
        if (data.length > 0) {
          setSelectedProgramId(String(data[0].id));
          setProgramTitle(data[0].title);
          setProgramSlug(data[0].slug);
        }
      }
    } catch {
      toast({ title: "Error loading programs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function fetchStudents() {
    try {
      setLoading(true);
      const res = await fetch(`/api/programs/students?programId=${selectedProgramId}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
        setProgramTitle(data.program || "");
      } else {
        toast({ title: "Error loading students", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error loading students", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function handleProgramChange(value: string) {
    setSelectedProgramId(value);
    const prog = programs.find((p) => String(p.id) === value);
    if (prog) { setProgramTitle(prog.title); setProgramSlug(prog.slug); }
  }

  const summary = useMemo(() => {
    let present = 0, absent = 0, late = 0;
    students.forEach((s) => s.attendances.forEach((a) => {
      if (a.status === "present") present++;
      else if (a.status === "absent") absent++;
      else if (a.status === "late") late++;
    }));
    return { present, absent, late };
  }, [students]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Attendance Management</h1>

      <Card>
        <CardHeader><CardTitle>Select Program</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Program</Label>
            <Select value={selectedProgramId} onValueChange={handleProgramChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a program..." />
              </SelectTrigger>
              <SelectContent>
                {programs.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    <span className="font-mono text-xs text-gray-500 mr-2">{p.programCode}</span>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {students.length > 0 && (
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: students.length, color: "text-primary" },
            { label: "Present", value: summary.present, color: "text-green-600" },
            { label: "Late", value: summary.late, color: "text-yellow-600" },
            { label: "Absent", value: summary.absent, color: "text-red-600" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600 text-sm">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : students.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students in {programTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Student Name</th>
                    <th className="text-left py-3 px-4">Student ID</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{student.user.firstName} {student.user.lastName}</td>
                      <td className="py-3 px-4 font-mono text-xs">{student.studentId}</td>
                      <td className="py-3 px-4 text-gray-600">{student.user.email}</td>
                      <td className="py-3 px-4">
                        <StudentAttendanceModal
                          studentId={student.id}
                          studentName={`${student.user.firstName} ${student.user.lastName}`}
                          studentIdNum={student.studentId}
                          program={programSlug}
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
              {selectedProgramId ? "No students found in this program." : "No programs assigned to you yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

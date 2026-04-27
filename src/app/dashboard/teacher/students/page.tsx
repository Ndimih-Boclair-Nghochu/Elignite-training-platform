"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface StudentProgram { id: number; title: string; programCode: string; duration: string; }
interface Student {
  id: number; studentId: string; firstName: string; lastName: string;
  email: string; phone?: string; status: string; programs: StudentProgram[];
}

export default function TeacherStudentsPage() {
  const { user } = useAuth();
  const teacherId = user?.teacherId;
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacherId) { setLoading(false); return; }
    fetch(`/api/teachers/${teacherId}/students`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setStudents(Array.isArray(d) ? d : []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, [teacherId]);

  const filtered = students.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.studentId}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Students</h1>
        <p className="text-gray-500 text-sm mt-1">Students enrolled in your programs</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle>{students.length} student{students.length !== 1 ? "s" : ""}</CardTitle>
            <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-white">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                className="outline-none text-sm w-44"
                placeholder="Search by name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Program(s)</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-sm">{s.studentId}</TableCell>
                    <TableCell className="font-medium">{s.firstName} {s.lastName}</TableCell>
                    <TableCell className="text-gray-500 text-sm">{s.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {s.programs.length > 0
                          ? s.programs.map((p) => (
                              <Badge key={p.id} variant="outline" className="font-mono text-xs">{p.programCode}</Badge>
                            ))
                          : <span className="text-gray-400 text-xs">—</span>
                        }
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {s.programs.length > 0
                        ? s.programs.map((p) => p.duration).filter(Boolean).join(" / ") || "—"
                        : "—"
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.status === "active" ? "default" : "secondary"} className="text-xs capitalize">
                        {s.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                      No students found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

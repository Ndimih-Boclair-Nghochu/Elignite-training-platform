"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
export default function TeacherStudentsPage() {
  const { user } = useAuth();
  const teacherId = user?.teacherId;
  const [students, setStudents] = useState<{id:number;studentId:string;firstName:string;lastName:string;email:string;level:number;status:string}[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!teacherId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/teachers/${teacherId}/students`)
      .then((r) => r.json())
      .then(setStudents)
      .finally(() => setLoading(false));
  }, [teacherId]);
  const filtered = students.filter(s=>`${s.firstName} ${s.lastName} ${s.studentId}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Students</h1>
      <Card>
        <CardHeader><div className="flex items-center justify-between"><CardTitle>{students.length} students</CardTitle>
          <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-white"><Search className="h-4 w-4 text-gray-400"/><input className="outline-none text-sm w-44" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
        </div></CardHeader>
        <CardContent className="p-0">
          {loading?<div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary"/></div>:(
            <Table>
              <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Level</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>{filtered.map(s=>(
                <TableRow key={s.id}><TableCell className="font-mono text-sm">{s.studentId}</TableCell><TableCell className="font-medium">{s.firstName} {s.lastName}</TableCell><TableCell className="text-gray-500 text-sm">{s.email}</TableCell><TableCell>Level {s.level}</TableCell><TableCell><Badge variant={s.status==="active"?"default":"secondary"} className="text-xs capitalize">{s.status}</Badge></TableCell></TableRow>
              ))}{filtered.length===0&&<TableRow><TableCell colSpan={5} className="text-center text-gray-400 py-8">No students found</TableCell></TableRow>}</TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

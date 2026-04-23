"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Loader2 } from "lucide-react";
export default function CeoAcademicPage() {
  const [courses, setCourses] = useState<{id:number;code:string;title:string;program:string;level:number;schedule:string;room:string;teacherName:string|null}[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/courses").then(r=>r.json()).then(setCourses).finally(()=>setLoading(false)); }, []);
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Academic Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{label:"Active Courses",value:courses.length},{label:"Total Students",value:247},{label:"Avg Pass Rate",value:"94%"},{label:"Current Semester",value:"Sem 1"}].map(s=>(
          <Card key={s.label}><CardContent className="pt-5 text-center"><p className="text-2xl font-bold text-primary">{s.value}</p><p className="text-sm text-gray-500">{s.label}</p></CardContent></Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5"/>Running Courses</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {loading?<div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-primary"/></div>:courses.map(c=>(
            <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3"><div className="bg-blue-100 text-blue-700 text-xs font-mono px-2 py-1 rounded">{c.code}</div>
              <div><p className="font-medium text-sm">{c.title}</p><p className="text-xs text-gray-400">{c.teacherName||"Unassigned"} · {c.schedule||"TBD"}</p></div></div>
              <Badge variant="secondary">{c.program}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

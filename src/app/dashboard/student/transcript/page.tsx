"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText } from "lucide-react";
const TRANSCRIPT = [
  {semester:"Year 1 – Semester 1",courses:[{code:"CS101",title:"Intro to Programming",credits:3,grade:"A",points:12},{code:"MATH101",title:"Calculus I",credits:3,grade:"B+",points:10.5},{code:"ENG101",title:"English I",credits:2,grade:"A",points:8},{code:"PHY101",title:"Physics I",credits:3,grade:"B",points:9}]},
  {semester:"Year 1 – Semester 2",courses:[{code:"CS102",title:"Data Structures",credits:3,grade:"A+",points:12},{code:"MATH102",title:"Calculus II",credits:3,grade:"A",points:12},{code:"ENG102",title:"English II",credits:2,grade:"B+",points:7},{code:"CS103",title:"Computer Architecture",credits:3,grade:"A",points:12}]},
];
function gpa(courses:{credits:number;points:number}[]){return(courses.reduce((s,c)=>s+c.points,0)/courses.reduce((s,c)=>s+c.credits,0)).toFixed(2);}
export default function TranscriptPage() {
  const all=TRANSCRIPT.flatMap(s=>s.courses);
  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Academic Transcript</h1><Button><Download className="h-4 w-4 mr-2"/>Download PDF</Button></div>
      <Card className="bg-blue-50 border-blue-200"><CardContent className="pt-4 flex items-center justify-between">
        <div className="flex items-center gap-3"><FileText className="h-8 w-8 text-blue-600"/><div><p className="font-bold">Student Portal · Transcript</p><p className="text-sm text-gray-500">BSc Computer Science</p></div></div>
        <div className="text-right"><p className="text-3xl font-bold text-blue-700">{gpa(all)}</p><p className="text-xs text-gray-500">Cumulative GPA</p></div>
      </CardContent></Card>
      {TRANSCRIPT.map(sem=>(
        <Card key={sem.semester}>
          <CardHeader className="pb-2"><div className="flex justify-between items-center"><CardTitle className="text-base">{sem.semester}</CardTitle><span className="text-sm font-semibold text-primary">GPA: {gpa(sem.courses)}</span></div></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Course</TableHead><TableHead className="text-center">Credits</TableHead><TableHead className="text-center">Grade</TableHead><TableHead className="text-center">Points</TableHead></TableRow></TableHeader>
              <TableBody>{sem.courses.map(c=>(
                <TableRow key={c.code}><TableCell className="font-mono text-sm">{c.code}</TableCell><TableCell className="text-sm">{c.title}</TableCell><TableCell className="text-center">{c.credits}</TableCell><TableCell className="text-center font-semibold text-primary">{c.grade}</TableCell><TableCell className="text-center">{c.points}</TableCell></TableRow>
              ))}</TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

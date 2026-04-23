"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookMarked, Clock, CheckCircle } from "lucide-react";
const EX = [
  {id:1,title:"Programming Assignment 1",course:"CS101",dueDate:"Nov 15",status:"submitted",marks:"18/20",type:"Assignment"},
  {id:2,title:"Mathematics Problem Set 3",course:"MATH201",dueDate:"Nov 18",status:"pending",marks:null,type:"Problem Set"},
  {id:3,title:"Physics Lab Report",course:"PHY101",dueDate:"Nov 12",status:"overdue",marks:null,type:"Lab Report"},
  {id:4,title:"Data Structures Project",course:"CS205",dueDate:"Nov 22",status:"pending",marks:null,type:"Project"},
];
export default function ExercisesPage() {
  const [filter,setFilter]=useState("all");
  const filtered=filter==="all"?EX:EX.filter(e=>e.status===filter);
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-2"><BookMarked className="h-6 w-6 text-primary"/><h1 className="text-2xl font-bold">Exercises & Assignments</h1></div>
      <div className="flex gap-2">{["all","pending","submitted","overdue"].map(f=>(
        <button key={f} onClick={()=>setFilter(f)} className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${filter===f?"bg-primary text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{f}</button>
      ))}</div>
      <div className="space-y-3">{filtered.map(ex=>(
        <Card key={ex.id} className={ex.status==="overdue"?"border-red-200":""}>
          <CardContent className="pt-4 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${ex.status==="submitted"?"bg-green-100":ex.status==="overdue"?"bg-red-100":"bg-blue-100"}`}>
                {ex.status==="submitted"?<CheckCircle className="h-5 w-5 text-green-600"/>:<Clock className={`h-5 w-5 ${ex.status==="overdue"?"text-red-600":"text-blue-600"}`}/>}
              </div>
              <div>
                <p className="font-semibold text-sm">{ex.title}</p>
                <p className="text-xs text-gray-400">{ex.course} · {ex.type} · Due: {ex.dueDate}</p>
                {ex.marks&&<p className="text-xs font-semibold text-green-600 mt-1">Score: {ex.marks}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={ex.status==="submitted"?"default":ex.status==="overdue"?"destructive":"secondary"} className="text-xs capitalize">{ex.status}</Badge>
              {ex.status==="pending"&&<Button size="sm" variant="outline" className="text-xs">Submit</Button>}
            </div>
          </CardContent>
        </Card>
      ))}</div>
    </div>
  );
}

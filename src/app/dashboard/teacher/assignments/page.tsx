"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
const ASSIGNMENTS=[{id:1,title:"Programming Assignment 1",course:"CS101",due:"Nov 15",submissions:38,total:45,status:"active"},{id:2,title:"Data Structures Problem Set",course:"CS205",due:"Nov 18",submissions:30,total:38,status:"active"},{id:3,title:"Database Design Project",course:"CS302",due:"Nov 22",submissions:0,total:42,status:"upcoming"}];
export default function TeacherAssignmentsPage() {
  const { toast } = useToast();
  return (
    <div className="p-6 space-y-5">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">Assignments</h1><Button onClick={()=>toast({title:"Feature coming soon"})}><Plus className="h-4 w-4 mr-2"/>New Assignment</Button></div>
      <div className="space-y-4">{ASSIGNMENTS.map(a=>(
        <Card key={a.id}><CardContent className="pt-4 flex items-center justify-between">
          <div><p className="font-semibold">{a.title}</p><p className="text-xs text-gray-400">{a.course} · Due: {a.due}</p><p className="text-xs text-gray-500 mt-1">{a.submissions}/{a.total} submissions</p></div>
          <div className="flex gap-2 items-center"><Badge variant={a.status==="active"?"default":"secondary"}>{a.status}</Badge><Button size="sm" variant="outline">View</Button></div>
        </CardContent></Card>
      ))}</div>
    </div>
  );
}

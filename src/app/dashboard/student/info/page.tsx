"use client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Calendar, MapPin } from "lucide-react";
export default function StudentInfoPage() {
  const { user } = useAuth();
  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Student Information</h1>
      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xl font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div><h2 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h2><p className="text-gray-500">{user?.email}</p><Badge className="mt-1 capitalize">{user?.role}</Badge></div>
          </div>
          {[
            {icon:GraduationCap,label:"Program",value:"BSc Computer Science"},
            {icon:GraduationCap,label:"Level",value:"200 Level · Semester 1"},
            {icon:Calendar,label:"Academic Year",value:"2024/2025"},
            {icon:Calendar,label:"Enrolled",value:"September 1, 2023"},
            {icon:Calendar,label:"Expected Graduation",value:"June 2027"},
            {icon:MapPin,label:"Campus",value:"Main Campus, Bamenda"},
          ].map(item=>(
            <div key={item.label} className="flex items-start gap-3">
              <item.icon className="h-4 w-4 text-gray-400 mt-0.5"/>
              <div><p className="text-xs text-gray-400">{item.label}</p><p className="text-sm font-medium">{item.value}</p></div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

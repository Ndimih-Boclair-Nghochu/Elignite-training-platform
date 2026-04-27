"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Calendar, User, Phone, Mail, Loader2 } from "lucide-react";

interface StudentInfo {
  studentId: string; matricle?: string;
  firstName: string; lastName: string; email: string; phone?: string;
  gender?: string; dateOfBirth?: string; address?: string;
  parentName?: string; parentPhone?: string;
  status: string; enrollmentDate?: string;
  programs: { id: number; programCode: string; title: string; duration: string; tuition: number }[];
}

export default function StudentInfoPage() {
  const [info, setInfo] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/info")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setInfo(d && !d.error ? d : null))
      .catch(() => setInfo(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!info) return <div className="p-6 text-gray-500">Could not load student information.</div>;

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Student Information</h1>
      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {info.firstName?.[0]}{info.lastName?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold">{info.firstName} {info.lastName}</h2>
              <p className="text-gray-500 text-sm">{info.email}</p>
              <div className="flex gap-2 mt-1 flex-wrap">
                <Badge className="capitalize">{info.status}</Badge>
                {info.matricle && <Badge variant="outline" className="font-mono text-xs">{info.matricle}</Badge>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Row icon={User} label="Student ID" value={info.studentId} />
            {info.gender && <Row icon={User} label="Gender" value={info.gender} />}
            {info.dateOfBirth && <Row icon={Calendar} label="Date of Birth" value={new Date(info.dateOfBirth).toLocaleDateString()} />}
            {info.phone && <Row icon={Phone} label="Phone" value={info.phone} />}
            {info.address && <Row icon={Mail} label="Address" value={info.address} />}
            {info.enrollmentDate && <Row icon={Calendar} label="Enrolled" value={new Date(info.enrollmentDate).toLocaleDateString()} />}
            {info.parentName && <Row icon={User} label="Parent / Guardian" value={info.parentName} />}
            {info.parentPhone && <Row icon={Phone} label="Parent Phone" value={info.parentPhone} />}
          </div>

          {info.programs.length > 0 && (
            <div className="border-t pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Enrolled Programs</p>
              <div className="space-y-2">
                {info.programs.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">{p.title}</p>
                        <p className="text-xs text-gray-500">Duration: {p.duration}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="font-mono text-xs">{p.programCode}</Badge>
                      <p className="text-xs text-gray-500 mt-1">₣{p.tuition.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Loader2, Users, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Program {
  id: number;
  programCode: string;
  slug: string;
  title: string;
  category: string;
  duration: string;
  description: string;
  tuition: number;
  requirements?: string;
  outcomes?: string;
}

export default function TeacherProgramsPage() {
  const { toast } = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teachers/programs")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setPrograms(Array.isArray(d) ? d : []))
      .catch(() => toast({ title: "Failed to load programs", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Programs</h1>
        <p className="text-gray-500 text-sm mt-1">
          Programs you are assigned to teach. Contact the CEO to add or create programs.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : programs.length === 0 ? (
        <Card>
          <CardContent className="pt-10 pb-10 text-center">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No programs assigned yet</p>
            <p className="text-gray-400 text-sm mt-1">Ask the CEO to assign you to a program.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {programs.map((p) => (
            <Card key={p.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg shrink-0">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="secondary" className="font-mono text-xs">{p.programCode}</Badge>
                      <Badge variant="outline" className="text-xs">{p.category}</Badge>
                    </div>
                    <p className="font-semibold">{p.title}</p>
                  </div>
                  {p.tuition != null && (
                    <span className="text-sm font-semibold text-primary shrink-0">₣{p.tuition.toLocaleString()}</span>
                  )}
                </div>
                {p.description && (
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{p.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{p.duration}</span>
                </div>
                {p.outcomes && (
                  <div className="mt-2 text-xs text-gray-500 border-t pt-2">
                    <span className="font-medium text-gray-700">Outcomes: </span>{p.outcomes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

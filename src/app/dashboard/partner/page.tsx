"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, BookOpenCheck, FileSearch, ShieldCheck, Users2 } from "lucide-react";

type Summary = {
  totalPrograms: number;
  activePrograms: number;
  applications: number;
  accepted: number;
  rejected: number;
  pending: number;
  verificationStatus: string;
  profileCompletion: number;
  recentApplications: Array<{
    id: number;
    applicantFullName: string;
    applicantEmail: string;
    status: string;
    updatedAt: string;
    partnerProgram: { title: string };
  }>;
  recentPrograms: Array<{
    id: number;
    title: string;
    status: string;
    updatedAt: string;
  }>;
};

const statusTone: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  documents_requested: "bg-purple-100 text-purple-700",
  under_review: "bg-blue-100 text-blue-700",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
  verified: "bg-emerald-100 text-emerald-700",
};

export default function PartnerOverviewPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSummary = useCallback(() => {
    fetch("/api/partner/dashboard-summary")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        Admissions data is unavailable right now.
      </div>
    );
  }

  const stats = [
    { label: "Total Programs", value: data.totalPrograms, icon: BookOpenCheck },
    { label: "Active Programs", value: data.activePrograms, icon: ShieldCheck },
    { label: "Applications", value: data.applications, icon: Users2 },
    { label: "Pending Decisions", value: data.pending, icon: FileSearch },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.label} className="border-blue-100 shadow-sm">
            <CardContent className="flex items-start justify-between p-6">
              <div>
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{item.value}</p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                <item.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-blue-100 shadow-sm">
          <CardHeader>
            <CardTitle>Profile & Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">Verification status</p>
                <Badge className={statusTone[data.verificationStatus] || "bg-slate-100 text-slate-700"}>
                  {data.verificationStatus.replace("_", " ")}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Profile completion</p>
                <p className="text-2xl font-semibold text-slate-950">{data.profileCompletion}%</p>
              </div>
            </div>
            <Progress value={data.profileCompletion} className="h-3" />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Accepted</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{data.accepted}</p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Rejected</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{data.rejected}</p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Pending</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{data.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Programs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentPrograms.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                No programs added yet.
              </div>
            ) : (
              data.recentPrograms.map((program) => (
                <div key={program.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-950">{program.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Updated {new Date(program.updatedAt).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                    <Badge className={statusTone[program.status] || "bg-slate-100 text-slate-700"}>
                      {program.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-blue-100 shadow-sm">
        <CardHeader>
          <CardTitle>Latest Applications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.recentApplications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              No applications have been assigned to your programs yet.
            </div>
          ) : (
            data.recentApplications.map((application) => (
              <div key={application.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-slate-950">{application.applicantFullName}</p>
                    <p className="text-sm text-slate-500">{application.applicantEmail}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-blue-700">
                      {application.partnerProgram.title}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <Badge className={statusTone[application.status] || "bg-slate-100 text-slate-700"}>
                      {application.status.replace("_", " ")}
                    </Badge>
                    <p className="mt-2 text-xs text-slate-500">
                      Updated {new Date(application.updatedAt).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

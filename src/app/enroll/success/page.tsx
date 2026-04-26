"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Clock, Download, GraduationCap } from "lucide-react";

interface EnrollmentData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  program: string;
  status: string;
  address?: string | null;
  matricle?: string | null;
  approvedAt?: string | null;
  createdAt: string;
}

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const enrollmentId = searchParams.get("id") || "";
  const token = searchParams.get("token") || "";
  const [enrollment, setEnrollment] = useState<EnrollmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingLetter, setDownloadingLetter] = useState(false);

  useEffect(() => {
    if (!enrollmentId || !token) {
      setLoading(false);
      return;
    }

    fetch(`/api/enrollments/${enrollmentId}?token=${encodeURIComponent(token)}`)
      .then((response) => response.json())
      .then(setEnrollment)
      .catch((error) => console.error("Error fetching enrollment:", error))
      .finally(() => setLoading(false));
  }, [enrollmentId, token]);

  const isApproved = enrollment?.status === "approved";
  const applicationDate = useMemo(() => {
    if (!enrollment?.createdAt) return "";
    return new Date(enrollment.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [enrollment?.createdAt]);

  async function downloadAdmissionLetter() {
    if (!enrollmentId || !token || !isApproved) return;
    setDownloadingLetter(true);

    try {
      const res = await fetch(
        `/api/enrollments/${enrollmentId}/admission-letter?token=${encodeURIComponent(token)}`
      );

      if (!res.ok) {
        alert("Failed to download admission letter");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `admission-letter-${enrollment?.matricle}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      anchor.remove();
    } catch (error) {
      console.error("Error downloading letter:", error);
    } finally {
      setDownloadingLetter(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
        <div className="w-full max-w-md border border-white/10 bg-white p-10 text-center shadow-2xl">
          <p className="text-slate-500">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
        <div className="w-full max-w-md border border-white/10 bg-white p-10 shadow-2xl">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-red-100 p-4">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
          </div>
          <h1 className="text-center text-2xl font-semibold text-slate-950">Application Not Found</h1>
          <p className="mt-3 text-center text-sm leading-6 text-slate-600">
            We could not verify your application link. Use the latest confirmation link from your submission.
          </p>
          <Button asChild className="mt-6 w-full">
            <Link href="/enroll">Back to Application</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-4xl overflow-hidden border border-white/10 bg-white shadow-2xl lg:grid lg:grid-cols-[0.92fr_1.08fr]">
        <div className="bg-[linear-gradient(145deg,#082f49,#0f172a)] p-8 text-white sm:p-10">
          <div className={`inline-flex rounded-full p-3 ${isApproved ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-300/15 text-amber-200"}`}>
            {isApproved ? <CheckCircle className="h-8 w-8" /> : <Clock className="h-8 w-8" />}
          </div>
          <h1 className="mt-6 text-3xl font-semibold leading-tight">
            {isApproved ? "Application approved." : "Application received."}
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {isApproved
              ? `Congratulations ${enrollment.firstName}. Your application has been approved and your onboarding is ready.`
              : "Your application has been submitted successfully and is now under review by admissions."}
          </p>

          <div className="mt-8 space-y-3 rounded-md border border-white/10 bg-white/5 p-5 text-sm">
            <div className="flex items-start justify-between gap-4">
              <span className="text-slate-400">Applicant</span>
              <span className="text-right font-medium text-white">
                {enrollment.firstName} {enrollment.lastName}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-slate-400">Program</span>
              <span className="text-right font-medium text-white">{enrollment.program}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-slate-400">Email</span>
              <span className="text-right font-medium text-white">{enrollment.email}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-slate-400">Submitted</span>
              <span className="text-right font-medium text-white">{applicationDate}</span>
            </div>
            {isApproved && enrollment.matricle && (
              <div className="flex items-start justify-between gap-4">
                <span className="text-slate-400">Matricle</span>
                <span className="text-right font-medium text-white">{enrollment.matricle}</span>
              </div>
            )}
          </div>

          <div className="mt-8 rounded-md border border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-300">
            {isApproved
              ? "Next step: create or activate your portal account, then continue with school onboarding, fees, and timetable access."
              : "You can keep this page for reference while admissions reviews your application."}
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          {isApproved ? (
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Admission Ready</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Your admission letter is available for download and your portal access can be completed right away.
              </p>

              <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-950">What to do next</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
                  <li>Download your admission letter and keep it for registration.</li>
                  <li>Create your student account with your approved matricule and application email.</li>
                  <li>Use your dashboard to track fees, timetable, and academic records.</li>
                </ul>
              </div>

              <div className="mt-6 grid gap-3">
                <Button onClick={downloadAdmissionLetter} disabled={downloadingLetter} className="h-11">
                  <Download className="mr-2 h-4 w-4" />
                  {downloadingLetter ? "Downloading..." : "Download Admission Letter"}
                </Button>
                <Button asChild variant="outline" className="h-11">
                  <Link href="/register">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Create Student Account
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Admissions Review in Progress</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Your application is in queue. Once it is reviewed, your account and admission steps will become available.
              </p>

              <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-950">What happens next</p>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-600">
                  <li>Admissions reviews your application.</li>
                  <li>You receive approval and a matricule if accepted.</li>
                  <li>You return to the platform to create or activate your portal account.</li>
                </ol>
              </div>
            </div>
          )}

          <div className="mt-8 grid gap-3">
            <Button asChild variant={isApproved ? "secondary" : "default"} className="h-11">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button asChild variant="ghost" className="h-11">
              <Link href="/contact">Contact Admissions</Link>
            </Button>
          </div>

          <p className="mt-8 text-xs text-slate-400">Reference ID: {enrollmentId}</p>
        </div>
      </div>
    </div>
  );
}

export default function EnrollSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950">
          <div className="w-full max-w-md border border-white/10 bg-white p-10 text-center shadow-2xl">
            <p className="text-slate-500">Loading application details...</p>
          </div>
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}

"use client";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, GraduationCap, Download, Clock, AlertCircle } from "lucide-react";

interface EnrollmentData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  program: string;
  status: string;
  address?: string | null;
  matricle?: string;
  approvedAt?: string;
  createdAt: string;
}

function SuccessPageContent({
  enrollmentId,
}: {
  enrollmentId: string;
}) {
  const [enrollment, setEnrollment] = useState<EnrollmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingLetter, setDownloadingLetter] = useState(false);

  useEffect(() => {
    if (!enrollmentId) return;

    fetch(`/api/enrollments/${enrollmentId}`)
      .then((r) => r.json())
      .then(setEnrollment)
      .catch((err) => console.error("Error fetching enrollment:", err))
      .finally(() => setLoading(false));
  }, [enrollmentId]);

  const isApproved = enrollment?.status === "approved";

  async function downloadAdmissionLetter() {
    if (!enrollmentId || !isApproved) return;
    setDownloadingLetter(true);
    try {
      const res = await fetch(`/api/enrollments/${enrollmentId}/admission-letter`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `admission-letter-${enrollment?.matricle}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Failed to download admission letter");
      }
    } catch (error) {
      console.error("Error downloading letter:", error);
    } finally {
      setDownloadingLetter(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
          <p className="text-gray-500">Loading enrollment details...</p>
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 rounded-full p-5">
              <AlertCircle className="h-14 w-14 text-red-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3 text-center">
            Enrollment Not Found
          </h1>
          <p className="text-gray-500 mb-6 text-center">
            We couldn't find your enrollment record.
          </p>
          <Button asChild className="w-full">
            <Link href="/enroll">Go Back to Enrollment</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className={`${isApproved ? "bg-green-100" : "bg-orange-100"} rounded-full p-5`}>
            {isApproved ? (
              <CheckCircle className="h-14 w-14 text-green-500" />
            ) : (
              <Clock className="h-14 w-14 text-orange-500" />
            )}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3 text-center">
          {isApproved ? "Application Approved! 🎓" : "Application Submitted!"}
        </h1>

        <p className="text-gray-500 mb-6 text-center">
          {isApproved
            ? `Congratulations ${enrollment.firstName}! Your application has been approved.`
            : "Thank you for applying to EduManage. Your application is under review. You will be contacted within 3–5 business days."}
        </p>

        {isApproved && (
          <div className="bg-green-50 rounded-xl p-4 mb-6 text-left space-y-2 text-sm text-green-700">
            <div className="flex items-start">
              <span className="mr-2 text-lg">✅</span>
              <span>
                <strong>Matricle:</strong> {enrollment.matricle}
              </span>
            </div>
            <div className="flex items-start">
              <span className="mr-2 text-lg">📚</span>
              <span>
                <strong>Program:</strong> {enrollment.program}
              </span>
            </div>
            <div className="flex items-start">
              <span className="mr-2 text-lg">📧</span>
              <span>
                <strong>Email:</strong> {enrollment.email}
              </span>
            </div>
          </div>
        )}

        {isApproved && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              📄 Admission Letter Preview
            </h3>
            <div className="text-sm text-gray-700 space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="text-center border-b pb-3 mb-3">
                <p className="font-bold text-xl text-blue-900">🎓 EduManage Computer Training Center</p>
                <p className="text-xs text-gray-600">Excellence in Education • Innovation in Technology</p>
                <p className="text-xs text-gray-500">Buea, Cameroon</p>
                <p className="text-xs text-gray-500">Email: info@edumanage.cm | Phone: +237 677 000 000</p>
              </div>
              <div className="text-right text-xs text-gray-500">
                Date: {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div>
                <p><strong>{enrollment.firstName} {enrollment.lastName}</strong></p>
                <p>{enrollment.address || "Address not provided"}</p>
                <p>Buea, Cameroon</p>
              </div>
              <div className="text-center font-bold text-base text-blue-900 border-t border-b py-2 my-2">
                OFFICIAL ADMISSION LETTER
              </div>
              <div>
                <p>Dear {enrollment.firstName} {enrollment.lastName},</p>
                <p className="mt-2">
                  We are delighted to extend our warmest congratulations on your admission to the{" "}
                  <strong>{enrollment.program}</strong> program at EduManage Computer Training Center.
                </p>
                <p className="mt-2">
                  Your application has been carefully reviewed, and we are pleased to inform you that you have been selected for admission based on your qualifications and potential.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 my-3">
                  <p className="font-semibold text-blue-900 text-sm mb-2">ADMISSION DETAILS</p>
                  <p className="text-xs">Matriculation Number: <strong>{enrollment.matricle}</strong></p>
                  <p className="text-xs">Program: <strong>{enrollment.program}</strong></p>
                  <p className="text-xs">Enrollment Date: <strong>{new Date(enrollment.createdAt).toLocaleDateString()}</strong></p>
                  <p className="text-xs">Admission Date: <strong>{new Date(enrollment.approvedAt!).toLocaleDateString()}</strong></p>
                </div>
                <p className="mt-2 font-semibold text-blue-900">Thank You for Choosing EduManage</p>
                <p className="mt-1 text-xs">
                  We thank you for choosing EduManage Computer Training Center for your educational needs. Your decision to join our institution reflects our shared commitment to excellence in education and professional development.
                </p>
                <p className="mt-2 font-semibold text-blue-900">Next Steps & Important Information:</p>
                <ul className="list-disc list-inside mt-1 ml-4 text-xs space-y-1">
                  <li>Bring this admission letter and your matriculation number to registration</li>
                  <li>Complete all required documentation and fee payments within 7 days</li>
                  <li>Attend the mandatory orientation session scheduled for the first week of classes</li>
                  <li>Contact the administration office if you have any questions or need assistance</li>
                  <li>Keep this letter safe as it serves as your official proof of admission</li>
                </ul>
                <p className="mt-3 text-xs">
                  We wish you every success in your studies and look forward to supporting your academic and professional growth.
                </p>
                <p className="mt-3">Best regards,</p>
                <div className="mt-4 flex justify-between">
                  <div className="text-left">
                    <p className="font-bold">Emmanuel Ngum</p>
                    <p className="text-xs">CEO & Director</p>
                    <p className="text-xs">EduManage Computer Training Center</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">Program Coordinator</p>
                    <p className="text-xs">{enrollment.program} Program</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isApproved && (
          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left space-y-2 text-sm text-gray-600">
            <div className="flex items-start">
              <span className="mr-2">✅</span>
              <span>Application form received</span>
            </div>
            <div className="flex items-start">
              <span className="mr-2">⏳</span>
              <span>Under review by admissions</span>
            </div>
            <div className="flex items-start">
              <span className="mr-2">📧</span>
              <span>Confirmation email will be sent</span>
            </div>
            <div className="flex items-start">
              <span className="mr-2">📞</span>
              <span>Admissions will call you</span>
            </div>
          </div>
        )}

        {!isApproved && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-xs text-yellow-800 font-semibold mb-2">📋 NEXT STEPS</p>
            <ol className="text-xs text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Wait for approval notification</li>
              <li>Receive your Matricle Number</li>
              <li>Download your Admission Letter</li>
              <li>Use it to activate your account</li>
            </ol>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {isApproved && (
            <>
              <Button
                onClick={downloadAdmissionLetter}
                disabled={downloadingLetter}
                className="bg-green-600 hover:bg-green-700 w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                {downloadingLetter ? "Downloading..." : "Download Admission Letter"}
              </Button>
              <Button asChild variant="outline">
                <Link href={`/login`}>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Register Now
                </Link>
              </Button>
            </>
          )}

          {!isApproved && enrollmentId && (
            <Button asChild className="bg-blue-600 hover:bg-blue-700 w-full">
              <a
                href={`/api/enrollments/${enrollmentId}/download`}
                download={`enrollment-form-${enrollmentId}.pdf`}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Enrollment Form (PDF)
              </a>
            </Button>
          )}

          <Button asChild variant={isApproved ? "default" : "secondary"}>
            <Link href="/">
              <GraduationCap className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <p className="text-xs text-gray-400 mt-6 text-center">
          Application ID: {enrollmentId || "---"}
        </p>
      </div>
    </div>
  );
}

export default function EnrollSuccessPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const enrollmentId = searchParams.id;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      }
    >
      <SuccessPageContent enrollmentId={enrollmentId || ""} />
    </Suspense>
  );
}

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { recordStudentGraduated } from "@/lib/platform-metrics";

// Generate unique certificate number
function generateCertNo(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
  return `CERT${year}${random}`;
}

// Ensure unique certificate number
async function getUniqueCertNo(): Promise<string> {
  let certNo = generateCertNo();
  let exists = await prisma.certificate.findUnique({
    where: { certNo },
  });

  while (exists) {
    certNo = generateCertNo();
    exists = await prisma.certificate.findUnique({
      where: { certNo },
    });
  }

  return certNo;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    // Only CEO can view all certificates
    if (!session.userId || session.role !== "ceo") {
      return NextResponse.json(
        { error: "Unauthorized - Only CEO can view all certificates" },
        { status: 403 }
      );
    }

    const certificates = await prisma.certificate.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(certificates);
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    // Only CEO can create certificates
    if (!session.userId || session.role !== "ceo") {
      return NextResponse.json(
        { error: "Unauthorized - Only CEO can create certificates" },
        { status: 403 }
      );
    }

    const { studentId, title, status = "pending" } = await req.json();

    if (!studentId || !title) {
      return NextResponse.json(
        { error: "Missing required fields (studentId, title)" },
        { status: 400 }
      );
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Generate unique certificate number
    const certNo = await getUniqueCertNo();

    // Create certificate
    const certificate = await prisma.certificate.create({
      data: {
        certNo,
        studentId,
        title,
        status,
        issuedDate: status === "issued" ? new Date() : null,
      },
    });

    if (status === "issued") {
      await recordStudentGraduated(studentId);
    }

    return NextResponse.json(certificate, { status: 201 });
  } catch (error) {
    console.error("Certificate creation error:", error);
    return NextResponse.json(
      { error: "Failed to create certificate" },
      { status: 500 }
    );
  }
}

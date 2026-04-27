export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.userId || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const student = await prisma.student.findUnique({
    where: { userId: session.userId },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true, photoUrl: true } },
      studentPrograms: {
        include: { program: { select: { id: true, programCode: true, title: true, duration: true, tuition: true } } },
        orderBy: { isPrimary: "desc" },
      },
    },
  });
  if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    studentId: student.studentId,
    matricle: student.matricle,
    firstName: student.user.firstName,
    lastName: student.user.lastName,
    email: student.user.email,
    phone: student.user.phone,
    photoUrl: student.user.photoUrl,
    gender: student.gender,
    dateOfBirth: student.dateOfBirth,
    address: student.address,
    parentName: student.parentName,
    parentPhone: student.parentPhone,
    status: student.status,
    enrollmentDate: student.enrollmentDate,
    programs: student.studentPrograms.map((sp) => sp.program),
  });
}

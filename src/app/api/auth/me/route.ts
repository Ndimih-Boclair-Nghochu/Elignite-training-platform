export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { normalizeRole } from "@/lib/roles";

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      phone: true,
      photoUrl: true,
    },
  });

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Fetch teacher or student ID if applicable
  let teacherId: number | undefined;
  let studentId: number | undefined;

  const normalizedRole = normalizeRole(user.role);

  if (normalizedRole === "teacher") {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id },
    });
    teacherId = teacher?.id;
  } else if (normalizedRole === "student") {
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
    });
    studentId = student?.id;
  }

  return NextResponse.json({
    user: {
      ...user,
      role: normalizedRole,
      teacherId,
      studentId,
    },
  });
}

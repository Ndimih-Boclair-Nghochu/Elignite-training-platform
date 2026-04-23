export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  
  // Only CEO can view pending activations
  if (!session.userId || session.role !== "ceo") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Get all students whose accounts are not activated yet
  const pendingStudents = await prisma.student.findMany({
    where: {
      user: {
        isActivated: false,
      },
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      },
    },
    orderBy: { enrollmentDate: "desc" },
  });

  return NextResponse.json(
    pendingStudents.map((s) => ({
      id: s.id,
      studentId: s.studentId,
      matricle: s.matricle,
      program: s.program,
      level: s.level,
      firstName: s.user.firstName,
      lastName: s.user.lastName,
      email: s.user.email,
      phone: s.user.phone,
      approvedAt: s.enrollmentDate,
      accountCreatedAt: s.user.createdAt,
    }))
  );
}

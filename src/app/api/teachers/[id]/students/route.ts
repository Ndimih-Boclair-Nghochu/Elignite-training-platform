export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = parseInt(params.id);

    // Get teacher with user info
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { user: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Get all courses for this teacher
    const courses = await prisma.course.findMany({
      where: { teacherId: teacherId },
     select: { id: true, code: true, title: true, program: true }, 
    });

    if (courses.length === 0) {
      return NextResponse.json([]);
    }

    const courseIds = courses.map((c) => c.id);

    const programs = Array.from(new Set(courses.map((course) => course.program)));

    // Get all students enrolled in programs taught by this teacher
    const students = await prisma.student.findMany({
      where: {
        program: { in: programs },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { enrollmentDate: "desc" },
    });

    return NextResponse.json(
      students.map((s) => ({
        id: s.id,
        studentId: s.studentId,
        program: s.program,
        level: s.level,
        status: s.status,
        firstName: s.user.firstName,
        lastName: s.user.lastName,
        email: s.user.email,
        phone: s.user.phone,
        enrollmentDate: s.enrollmentDate,
      }))
    );
  } catch (error) {
    console.error("Error fetching teacher students:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

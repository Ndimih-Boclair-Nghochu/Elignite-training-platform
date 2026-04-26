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
    if (session.role === "teacher" && session.teacherId !== teacherId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!["teacher", "ceo"].includes(session.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get courses for this teacher
    const courses = await prisma.course.findMany({
      where: { teacherId: teacherId },
      orderBy: { code: "asc" },
    });

    // For each course, get the number of students
    const coursesWithCounts = await Promise.all(
      courses.map(async (course) => {
        const studentCount = await prisma.result.count({
          where: { courseId: course.id },
        });

        const attendanceCount = await prisma.attendance.count({
          where: { courseId: course.id },
        });

        const totalStudents = Math.max(studentCount, attendanceCount);

        return {
          ...course,
          students: totalStudents,
        };
      })
    );

    return NextResponse.json(coursesWithCounts);
  } catch (error) {
    console.error("Error fetching teacher courses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

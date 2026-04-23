export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.userId || session.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.userId },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
    }

    const courses = await prisma.course.findMany({
      where: { teacherId: teacher.id },
      include: {
        results: true,
        attendances: true,
      },
      orderBy: { code: "asc" },
    });

    // Calculate stats for each course
    const coursesWithStats = courses.map((course) => {
      // Get unique students (from results for now, can be expanded)
      const enrolledStudents = [...new Set(course.results.map((r) => r.studentId))].length;
      
      // Calculate average grade/performance
      const avgScore = course.results.length > 0
        ? course.results.reduce((sum, r) => sum + (r.total || 0), 0) / course.results.length
        : 0;

      // Count attendance records
      const attendanceCount = course.attendances.length;

      return {
        id: course.id,
        code: course.code,
        title: course.title,
        program: course.program,
        level: course.level,
        semester: course.semester,
        year: course.year,
        schedule: course.schedule,
        room: course.room,
        enrolledStudents,
        averageScore: Math.round(avgScore * 100) / 100,
        resultCount: course.results.length,
        attendanceCount,
      };
    });

    return NextResponse.json(coursesWithStats);
  } catch (error) {
    console.error("Error fetching teacher courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

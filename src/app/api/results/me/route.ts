export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.userId || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const student = await prisma.student.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Get attendance records
    const attendances = await prisma.attendance.findMany({
      where: { studentId: student.id },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    // Get project scores
    const projectScores = await prisma.projectScore.findMany({
      where: { studentId: student.id },
      include: {
        project: {
          select: {
            id: true,
            code: true,
            title: true,
            maxScore: true,
          },
        },
      },
      orderBy: { gradedAt: { sort: "desc", nulls: "last" } },
    });

    // Get course results
    const courseResults = await prisma.result.findMany({
      where: { studentId: student.id },
      include: { course: true },
      orderBy: { year: "desc" },
    });

    // Calculate attendance statistics
    const totalClasses = attendances.length;
    const presentCount = attendances.filter((a) => a.status === "present").length;
    const absentCount = attendances.filter((a) => a.status === "absent").length;
    const lateCount = attendances.filter((a) => a.status === "late").length;
    const attendancePercentage =
      totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

    const getAttendanceRemark = (percentage: number) => {
      if (percentage >= 90) return "Excellent";
      if (percentage >= 80) return "Very Good";
      if (percentage >= 75) return "Good";
      if (percentage >= 70) return "Satisfactory";
      return "Below Required";
    };

    // Calculate project statistics
    const gradedProjects = projectScores.filter((p) => p.gradedAt);
    const avgProjectScore =
      gradedProjects.length > 0
        ? gradedProjects.reduce((sum, p) => sum + p.score, 0) /
          gradedProjects.length
        : 0;

    const getProjectRemark = (avgScore: number) => {
      if (avgScore >= 80) return "Excellent";
      if (avgScore >= 70) return "Very Good";
      if (avgScore >= 60) return "Good";
      if (avgScore >= 50) return "Satisfactory";
      return "Below Required";
    };

    // Calculate overall score (combination of attendance and projects)
    // Attendance: 30%, Projects: 70%
    const overallScore =
      attendancePercentage * 0.3 + avgProjectScore * 0.7;

    const getOverallRemark = (score: number) => {
      if (score >= 80) return "Excellent";
      if (score >= 70) return "Very Good";
      if (score >= 60) return "Good";
      if (score >= 50) return "Satisfactory";
      return "Below Required";
    };

    return NextResponse.json({
      attendance: {
        records: attendances.map((a) => ({
          id: a.id,
          date: a.date,
          status: a.status,
          course: {
            code: a.course.code,
            title: a.course.title,
          },
        })),
        totalClasses,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        percentage: attendancePercentage,
        remark: getAttendanceRemark(attendancePercentage),
      },
      projects: {
        records: projectScores.map((p) => ({
          id: p.id,
          projectId: p.projectId,
          score: p.score,
          feedback: p.feedback,
          gradedAt: p.gradedAt,
          project: {
            code: p.project.code,
            title: p.project.title,
            maxScore: p.project.maxScore,
          },
        })),
        totalProjects: projectScores.length,
        gradedProjects: gradedProjects.length,
        averageScore: Math.round(avgProjectScore * 10) / 10,
        remark: getProjectRemark(avgProjectScore),
      },
      courses: {
        records: courseResults.map((r) => ({
          id: r.id,
          ca: r.ca,
          exam: r.exam,
          total: r.total,
          grade: r.grade,
          semester: r.semester,
          year: r.year,
          courseCode: r.course.code,
          courseTitle: r.course.title,
          credits: r.course.credits,
        })),
        average: courseResults.length
          ? (
              courseResults.reduce((sum, r) => sum + r.total, 0) /
              courseResults.length
            ).toFixed(1)
          : "0",
      },
      overall: {
        score: Math.round(overallScore * 10) / 10,
        remark: getOverallRemark(overallScore),
        composition: {
          attendanceWeight: 0.3,
          projectsWeight: 0.7,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching student results:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

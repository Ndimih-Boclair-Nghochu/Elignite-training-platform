export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

function getRemark(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Very Good";
  if (score >= 60) return "Good";
  if (score >= 50) return "Satisfactory";
  return "Below Required";
}

export async function GET() {
  const session = await getSession();
  if (!session.userId || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const student = await prisma.student.findUnique({
      where: { userId: session.userId },
      select: { id: true, program: true },
    });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    // ── Attendance ──────────────────────────────────────────────────────────
    const attendances = await prisma.attendance.findMany({
      where: { studentId: student.id },
      include: { course: { select: { id: true, code: true, title: true } } },
      orderBy: { date: "desc" },
    });

    const totalClasses = attendances.length;
    const presentCount = attendances.filter((a) => a.status === "present").length;
    const absentCount = attendances.filter((a) => a.status === "absent").length;
    const lateCount = attendances.filter((a) => a.status === "late").length;
    const attendancePct = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

    // ── Projects ─────────────────────────────────────────────────────────────
    const projectScores = await prisma.projectScore.findMany({
      where: { studentId: student.id },
      include: { project: { select: { id: true, code: true, title: true, maxScore: true } } },
      orderBy: { gradedAt: { sort: "desc", nulls: "last" } },
    });

    const gradedProjects = projectScores.filter((p) => p.gradedAt !== null);
    const avgProjectScore =
      gradedProjects.length > 0
        ? gradedProjects.reduce((sum, p) => sum + (p.score / p.project.maxScore) * 100, 0) / gradedProjects.length
        : 0;

    // ── Exercises ─────────────────────────────────────────────────────────────
    const exerciseSubmissions = await prisma.exerciseSubmission.findMany({
      where: { studentId: student.id, status: "graded" },
      include: { exercise: { select: { id: true, title: true, maxScore: true, course: { select: { code: true, title: true } } } } },
      orderBy: { gradedAt: { sort: "desc", nulls: "last" } },
    });

    const avgExerciseScore =
      exerciseSubmissions.length > 0
        ? exerciseSubmissions.reduce((sum, s) => sum + ((s.score ?? 0) / s.exercise.maxScore) * 100, 0) /
          exerciseSubmissions.length
        : 0;

    // ── Overall score: Exercises 20%, Attendance 10%, Projects 70% ──────────
    const overallScore =
      avgExerciseScore * 0.2 + attendancePct * 0.1 + avgProjectScore * 0.7;

    return NextResponse.json({
      attendance: {
        records: attendances.map((a) => ({
          id: a.id,
          date: a.date,
          status: a.status,
          course: { code: a.course.code, title: a.course.title },
        })),
        totalClasses,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        percentage: attendancePct,
        remark: getRemark(attendancePct),
      },
      projects: {
        records: projectScores.map((p) => ({
          id: p.id,
          projectId: p.projectId,
          score: p.score,
          feedback: p.feedback,
          gradedAt: p.gradedAt,
          project: { code: p.project.code, title: p.project.title, maxScore: p.project.maxScore },
        })),
        totalProjects: projectScores.length,
        gradedProjects: gradedProjects.length,
        averageScore: Math.round(avgProjectScore * 10) / 10,
        remark: getRemark(avgProjectScore),
      },
      exercises: {
        records: exerciseSubmissions.map((s) => ({
          id: s.id,
          exerciseId: s.exerciseId,
          score: s.score,
          feedback: s.feedback,
          gradedAt: s.gradedAt,
          submittedAt: s.submittedAt,
          exercise: {
            title: s.exercise.title,
            maxScore: s.exercise.maxScore,
            course: s.exercise.course,
          },
        })),
        totalGraded: exerciseSubmissions.length,
        averageScore: Math.round(avgExerciseScore * 10) / 10,
        remark: getRemark(avgExerciseScore),
      },
      overall: {
        score: Math.round(overallScore * 10) / 10,
        remark: getRemark(overallScore),
        composition: { exercisesWeight: 0.2, attendanceWeight: 0.1, projectsWeight: 0.7 },
      },
    });
  } catch (error) {
    console.error("Error fetching student results:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

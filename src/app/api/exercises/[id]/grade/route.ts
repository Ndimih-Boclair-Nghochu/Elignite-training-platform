export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// POST — teacher grades a student's exercise submission
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.userId || session.role !== "teacher") {
    return NextResponse.json({ error: "Only teachers can grade exercises" }, { status: 403 });
  }

  try {
    const teacher = await prisma.teacher.findUnique({ where: { userId: session.userId }, select: { id: true } });
    if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

    const exerciseId = parseInt(params.id);
    const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
    if (!exercise) return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    if (exercise.teacherId !== teacher.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { studentId, score, feedback } = await req.json();
    if (!studentId || score === undefined) {
      return NextResponse.json({ error: "studentId and score are required" }, { status: 400 });
    }
    if (Number(score) < 0 || Number(score) > exercise.maxScore) {
      return NextResponse.json({ error: `Score must be between 0 and ${exercise.maxScore}` }, { status: 400 });
    }

    const submission = await prisma.exerciseSubmission.upsert({
      where: { exerciseId_studentId: { exerciseId, studentId: Number(studentId) } },
      create: {
        exerciseId,
        studentId: Number(studentId),
        score: Number(score),
        feedback: feedback || null,
        status: "graded",
        gradedAt: new Date(),
      },
      update: {
        score: Number(score),
        feedback: feedback || null,
        status: "graded",
        gradedAt: new Date(),
      },
      include: {
        student: { select: { id: true, studentId: true, user: { select: { firstName: true, lastName: true } } } },
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Error grading exercise:", error);
    return NextResponse.json({ error: "Failed to grade exercise" }, { status: 500 });
  }
}

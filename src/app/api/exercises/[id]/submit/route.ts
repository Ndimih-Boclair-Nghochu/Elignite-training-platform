export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// POST — student submits an answer for an exercise
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.userId || session.role !== "student") {
    return NextResponse.json({ error: "Only students can submit exercises" }, { status: 403 });
  }

  try {
    const student = await prisma.student.findUnique({ where: { userId: session.userId }, select: { id: true } });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const exerciseId = parseInt(params.id);
    const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
    if (!exercise) return NextResponse.json({ error: "Exercise not found" }, { status: 404 });

    const { content } = await req.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: "Submission content is required" }, { status: 400 });
    }

    const submission = await prisma.exerciseSubmission.upsert({
      where: { exerciseId_studentId: { exerciseId, studentId: student.id } },
      create: {
        exerciseId,
        studentId: student.id,
        content,
        status: "submitted",
        submittedAt: new Date(),
      },
      update: {
        content,
        status: "submitted",
        submittedAt: new Date(),
      },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Error submitting exercise:", error);
    return NextResponse.json({ error: "Failed to submit exercise" }, { status: 500 });
  }
}

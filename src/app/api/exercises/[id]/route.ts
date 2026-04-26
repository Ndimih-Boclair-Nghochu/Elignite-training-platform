export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET single exercise (with all submissions for teacher, own submission for student)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const exerciseId = parseInt(params.id);
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: {
        course: { select: { id: true, code: true, title: true, programId: true } },
        teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
        submissions: {
          include: {
            student: {
              select: {
                id: true,
                studentId: true,
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
          orderBy: { submittedAt: { sort: "desc", nulls: "last" } },
        },
      },
    });

    if (!exercise) return NextResponse.json({ error: "Exercise not found" }, { status: 404 });

    if (session.role === "student") {
      const student = await prisma.student.findUnique({ where: { userId: session.userId }, select: { id: true } });
      if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
      const mySubmission = exercise.submissions.find((s) => s.studentId === student.id) || null;
      return NextResponse.json({ ...exercise, submissions: undefined, submission: mySubmission });
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error("Error fetching exercise:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH — teacher updates exercise
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.userId || session.role !== "teacher") {
    return NextResponse.json({ error: "Only teachers can update exercises" }, { status: 403 });
  }

  try {
    const teacher = await prisma.teacher.findUnique({ where: { userId: session.userId }, select: { id: true } });
    if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

    const exerciseId = parseInt(params.id);
    const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
    if (!exercise) return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    if (exercise.teacherId !== teacher.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { title, description, dueDate, maxScore } = await req.json();
    const updated = await prisma.exercise.update({
      where: { id: exerciseId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
        ...(maxScore !== undefined && { maxScore: Number(maxScore) }),
      },
      include: { course: { select: { id: true, code: true, title: true } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating exercise:", error);
    return NextResponse.json({ error: "Failed to update exercise" }, { status: 500 });
  }
}

// DELETE — teacher deletes exercise
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.userId || session.role !== "teacher") {
    return NextResponse.json({ error: "Only teachers can delete exercises" }, { status: 403 });
  }

  try {
    const teacher = await prisma.teacher.findUnique({ where: { userId: session.userId }, select: { id: true } });
    if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

    const exerciseId = parseInt(params.id);
    const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
    if (!exercise) return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    if (exercise.teacherId !== teacher.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.exercise.delete({ where: { id: exerciseId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting exercise:", error);
    return NextResponse.json({ error: "Failed to delete exercise" }, { status: 500 });
  }
}

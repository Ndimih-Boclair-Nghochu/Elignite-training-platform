export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET exercises
// - Teacher: all exercises for their courses
// - Student: all exercises for courses in their enrolled programs
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const courseIdParam = searchParams.get("courseId");

    if (session.role === "teacher") {
      const teacher = await prisma.teacher.findUnique({ where: { userId: session.userId }, select: { id: true } });
      if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

      const where: any = { teacherId: teacher.id };
      if (courseIdParam) where.courseId = parseInt(courseIdParam);

      const exercises = await prisma.exercise.findMany({
        where,
        include: {
          course: { select: { id: true, code: true, title: true, programId: true, program: true } },
          submissions: { select: { id: true, status: true, score: true, studentId: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(
        exercises.map((ex) => ({
          ...ex,
          submissionCount: ex.submissions.length,
          gradedCount: ex.submissions.filter((s) => s.status === "graded").length,
          submittedCount: ex.submissions.filter((s) => s.status !== "pending").length,
        }))
      );
    }

    if (session.role === "student") {
      const student = await prisma.student.findUnique({ where: { userId: session.userId }, select: { id: true, program: true } });
      if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

      // Get all program IDs this student is enrolled in
      const sp = await prisma.studentProgram.findMany({ where: { studentId: student.id }, select: { programId: true } });
      const programIds = sp.map((s) => s.programId);

      // Also include courses that match the legacy slug
      const courseWhere: any = {
        OR: [
          ...(programIds.length > 0 ? [{ programId: { in: programIds } }] : []),
          { program: student.program },
        ],
      };
      if (courseIdParam) courseWhere.id = parseInt(courseIdParam);

      const courses = await prisma.course.findMany({ where: courseWhere, select: { id: true } });
      const courseIds = courses.map((c) => c.id);

      const exercises = await prisma.exercise.findMany({
        where: { courseId: { in: courseIds } },
        include: {
          course: { select: { id: true, code: true, title: true } },
          submissions: {
            where: { studentId: student.id },
            select: { id: true, status: true, score: true, feedback: true, submittedAt: true, gradedAt: true, content: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(
        exercises.map((ex) => ({
          id: ex.id,
          title: ex.title,
          description: ex.description,
          dueDate: ex.dueDate,
          maxScore: ex.maxScore,
          createdAt: ex.createdAt,
          course: ex.course,
          submission: ex.submissions[0] || null,
        }))
      );
    }

    if (session.role === "ceo") {
      const where: any = {};
      if (courseIdParam) where.courseId = parseInt(courseIdParam);
      const exercises = await prisma.exercise.findMany({
        where,
        include: {
          course: { select: { id: true, code: true, title: true } },
          teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
          submissions: { select: { id: true, status: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(exercises);
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — teacher creates an exercise for a course
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== "teacher") {
    return NextResponse.json({ error: "Only teachers can create exercises" }, { status: 403 });
  }

  try {
    const teacher = await prisma.teacher.findUnique({ where: { userId: session.userId }, select: { id: true } });
    if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

    const { title, description, courseId, dueDate, maxScore } = await req.json();
    if (!title || !description || !courseId) {
      return NextResponse.json({ error: "title, description, and courseId are required" }, { status: 400 });
    }

    // Verify teacher owns the course
    const course = await prisma.course.findUnique({ where: { id: Number(courseId) } });
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
    if (course.teacherId !== teacher.id) {
      return NextResponse.json({ error: "You can only create exercises for your own courses" }, { status: 403 });
    }

    const exercise = await prisma.exercise.create({
      data: {
        title,
        description,
        courseId: Number(courseId),
        teacherId: teacher.id,
        dueDate: dueDate ? new Date(dueDate) : null,
        maxScore: maxScore ? Number(maxScore) : 100,
      },
      include: { course: { select: { id: true, code: true, title: true } } },
    });

    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error("Error creating exercise:", error);
    return NextResponse.json({ error: "Failed to create exercise" }, { status: 500 });
  }
}

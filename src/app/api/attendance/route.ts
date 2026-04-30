export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ensureRuntimeSchema } from "@/lib/runtime-schema";

export async function GET(req: NextRequest) {
  await ensureRuntimeSchema();
  const session = await getSession();
  if (!session.userId || !["teacher", "ceo"].includes(session.role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId is required" },
        { status: 400 }
      );
    }

    // Verify course exists and user is authorized
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) },
      include: { teacher: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check permission: teacher must be the course instructor or user must be CEO
    if (session.role === "teacher" && course.teacherId !== session.teacherId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const matchedStudentPrograms =
      course.programId !== null
        ? await prisma.studentProgram.findMany({
            where: { programId: course.programId },
            select: { studentId: true },
          })
        : [];

    const linkedStudentIds = Array.from(new Set(matchedStudentPrograms.map((entry) => entry.studentId)));

    const students = await prisma.student.findMany({
      where: {
        OR: [
          ...(linkedStudentIds.length > 0 ? [{ id: { in: linkedStudentIds } }] : []),
          ...(course.program ? [{ program: course.program }] : []),
          {
            results: {
              some: { courseId: parseInt(courseId) },
            },
          },
          {
            attendances: {
              some: { courseId: parseInt(courseId) },
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        attendances: {
          where: { courseId: parseInt(courseId) },
          select: { date: true, status: true },
          orderBy: { date: "desc" },
        },
      },
      orderBy: { enrollmentDate: "asc" },
    });

    return NextResponse.json({
      course,
      students,
    });
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  await ensureRuntimeSchema();
  const session = await getSession();
  if (!session.userId || !["teacher", "ceo"].includes(session.role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { courseId, studentId, date, status } = body;

    if (!courseId || !studentId || !date || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["present", "absent", "late"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be: present, absent, or late" },
        { status: 400 }
      );
    }

    // Verify course exists and user is authorized
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check permission
    if (session.role === "teacher" && course.teacherId !== session.teacherId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: parseInt(studentId) },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const attendanceDate = new Date(date);

    // Upsert attendance record
    const attendance = await prisma.attendance.upsert({
      where: {
        studentId_courseId_date: {
          studentId: parseInt(studentId),
          courseId: parseInt(courseId),
          date: attendanceDate,
        },
      },
      update: {
        status,
      },
      create: {
        studentId: parseInt(studentId),
        courseId: parseInt(courseId),
        date: attendanceDate,
        status,
      },
    });

    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    console.error("Error recording attendance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

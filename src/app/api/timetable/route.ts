export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ensureRuntimeSchema } from "@/lib/runtime-schema";

export async function GET() {
  try {
    await ensureRuntimeSchema();
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let timetables;
    let program: string | null = null;

    if (session.role === "ceo") {
      // CEO sees all timetables
      timetables = await prisma.timetable.findMany({
        include: {
          course: {
            include: {
              teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
            },
          },
        },
        orderBy: [
          { dayOfWeek: "asc" },
          { startTime: "asc" },
        ],
      });
    } else if (session.role === "teacher") {
      // Teachers see timetables for courses they teach
      if (!session.teacherId) {
        return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
      }
      timetables = await prisma.timetable.findMany({
        where: {
          course: { teacherId: session.teacherId },
        },
        include: {
          course: {
            include: {
              teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
            },
          },
        },
        orderBy: [
          { dayOfWeek: "asc" },
          { startTime: "asc" },
        ],
      });
    } else {
      // Students see timetables for courses in their program
      const student = session.studentId
        ? await prisma.student.findUnique({ where: { id: session.studentId } })
        : await prisma.student.findUnique({ where: { userId: session.userId } });

      if (!student) {
        return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
      }

      program = student.program;
      timetables = await prisma.timetable.findMany({
        where: {
          course: { program },
        },
        include: {
          course: {
            include: {
              teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
            },
          },
        },
        orderBy: [
          { dayOfWeek: "asc" },
          { startTime: "asc" },
        ],
      });
    }

    const formatted = timetables.map((timetable) => ({
      id: timetable.id,
      courseId: timetable.courseId,
      courseCode: timetable.course.code,
      courseTitle: timetable.course.title,
      program: timetable.course.program,
      level: timetable.course.level,
      dayOfWeek: timetable.dayOfWeek,
      startTime: timetable.startTime,
      endTime: timetable.endTime,
      room: timetable.room,
      teacherName: timetable.course.teacher ? `${timetable.course.teacher.user.firstName} ${timetable.course.teacher.user.lastName}` : null,
      semester: timetable.semester,
      year: timetable.year,
    }));

    return NextResponse.json({ role: session.role, program, timetable: formatted });
  } catch (error) {
    console.error("Failed to load timetable:", error);
    return NextResponse.json({ error: "Failed to load timetable" }, { status: 500 });
  }
}

// POST: Create timetable entry (CEO only)
export async function POST(req: Request) {
  try {
    await ensureRuntimeSchema();
    const session = await getSession();

    if (!session?.userId || session.role !== "ceo") {
      return NextResponse.json(
        { error: "Unauthorized - Only CEO can schedule timetables" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { courseId, dayOfWeek, startTime, endTime, room, semester, year } = body;

    if (!courseId || !dayOfWeek || !startTime || !endTime || !semester || !year) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Check for scheduling conflicts
    const conflict = await prisma.timetable.findFirst({
      where: {
        dayOfWeek,
        semester,
        year: parseInt(year),
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    if (conflict) {
      return NextResponse.json(
        { error: "Scheduling conflict detected" },
        { status: 409 }
      );
    }

    const timetable = await prisma.timetable.create({
      data: {
        courseId: parseInt(courseId),
        dayOfWeek,
        startTime,
        endTime,
        room,
        semester,
        year: parseInt(year),
      },
      include: {
        course: {
          include: {
            teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
          },
        },
      },
    });

    return NextResponse.json(timetable);
  } catch (error) {
    console.error("Failed to create timetable:", error);
    return NextResponse.json(
      { error: "Failed to create timetable" },
      { status: 500 }
    );
  }
}

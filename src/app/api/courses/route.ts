export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { searchParams } = new URL(req.url);
  const program = searchParams.get("program");
  
  const courses = await prisma.course.findMany({
    where: program ? { program } : undefined,
    include: { teacher: { include: { user: { select: { firstName: true, lastName: true } } } } },
    orderBy: { code: "asc" },
  });
  return NextResponse.json(courses.map((c) => ({
    ...c,
    teacherName: c.teacher ? `${c.teacher.user.firstName} ${c.teacher.user.lastName}` : null,
  })));
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    
    // Only CEO or teacher can create courses
    if (!session.userId || !["ceo", "teacher"].includes(session.role || "")) {
      return NextResponse.json(
        { error: "Unauthorized - Only CEO or teachers can create courses" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { code, title, description, credits, program, level, semester, year, room, schedule, teacherId } = body;

    if (!code || !title || !program || level === undefined || semester === undefined || year === undefined) {
      return NextResponse.json(
        { error: "Missing required fields (code, title, program, level, semester, year)" },
        { status: 400 }
      );
    }

    // If teacher is creating, use their ID; CEO can assign to any teacher
    let actualTeacherId: number | null = null;
    if (session.role === "teacher") {
      actualTeacherId = session.teacherId || null;
    } else if (session.role === "ceo" && teacherId) {
      actualTeacherId = teacherId;
    }

    const course = await prisma.course.create({
      data: {
        code,
        title,
        description: description || null,
        credits: credits || 3,
        program,
        level: Number(level),
        semester,
        year: Number(year),
        room: room || null,
        schedule: schedule || null,
        teacherId: actualTeacherId,
      },
      include: {
        teacher: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    return NextResponse.json(
      {
        ...course,
        teacherName: course.teacher ? `${course.teacher.user.firstName} ${course.teacher.user.lastName}` : null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Course creation error:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}

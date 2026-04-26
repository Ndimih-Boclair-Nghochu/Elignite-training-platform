export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const programIdParam = searchParams.get("programId");
  const programSlug = searchParams.get("program");

  let where: any = {};
  if (programIdParam) {
    where.programId = parseInt(programIdParam);
  } else if (programSlug) {
    where.program = programSlug;
  }

  const courses = await prisma.course.findMany({
    where,
    include: { teacher: { include: { user: { select: { firstName: true, lastName: true } } } } },
    orderBy: { code: "asc" },
  });

  return NextResponse.json(
    courses.map((c) => ({ ...c, teacherName: c.teacher ? `${c.teacher.user.firstName} ${c.teacher.user.lastName}` : null }))
  );
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.userId || !["ceo", "teacher"].includes(session.role || "")) {
      return NextResponse.json({ error: "Unauthorized - Only CEO or teachers can create courses" }, { status: 403 });
    }

    const body = await req.json();
    const { code, title, description, credits, program, programId, level, semester, year, room, schedule, teacherId } = body;

    if (!code || !title || level === undefined || semester === undefined || year === undefined) {
      return NextResponse.json({ error: "Missing required fields (code, title, level, semester, year)" }, { status: 400 });
    }

    // Resolve programId — accept either programId (int) or program (slug)
    let resolvedProgramId: number | null = programId ? Number(programId) : null;
    let resolvedSlug: string = program || "";

    if (!resolvedProgramId && resolvedSlug) {
      const prog = await prisma.program.findUnique({ where: { slug: resolvedSlug }, select: { id: true } });
      if (prog) resolvedProgramId = prog.id;
    } else if (resolvedProgramId && !resolvedSlug) {
      const prog = await prisma.program.findUnique({ where: { id: resolvedProgramId }, select: { slug: true } });
      if (prog) resolvedSlug = prog.slug;
    }

    if (!resolvedSlug && !resolvedProgramId) {
      return NextResponse.json({ error: "program or programId is required" }, { status: 400 });
    }

    // Teacher: verify they're assigned to this program
    let actualTeacherId: number | null = null;
    if (session.role === "teacher") {
      actualTeacherId = session.teacherId || null;
      if (resolvedProgramId && actualTeacherId) {
        const assigned = await prisma.teacherProgram.findFirst({
          where: { teacherId: actualTeacherId, programId: resolvedProgramId },
        });
        if (!assigned) {
          return NextResponse.json({ error: "You are not assigned to this program" }, { status: 403 });
        }
      }
    } else if (session.role === "ceo" && teacherId) {
      actualTeacherId = teacherId;
    }

    const course = await prisma.course.create({
      data: {
        code,
        title,
        description: description || null,
        credits: credits || 3,
        program: resolvedSlug,
        programId: resolvedProgramId,
        level: Number(level),
        semester,
        year: Number(year),
        room: room || null,
        schedule: schedule || null,
        teacherId: actualTeacherId,
      },
      include: { teacher: { include: { user: { select: { firstName: true, lastName: true } } } } },
    });

    return NextResponse.json(
      { ...course, teacherName: course.teacher ? `${course.teacher.user.firstName} ${course.teacher.user.lastName}` : null },
      { status: 201 }
    );
  } catch (error) {
    console.error("Course creation error:", error);
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}

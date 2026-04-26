export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || !["teacher", "ceo"].includes(session.role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const programIdParam = searchParams.get("programId");
    const programSlug = searchParams.get("program"); // legacy

    if (!programIdParam && !programSlug) {
      return NextResponse.json({ error: "programId or program is required" }, { status: 400 });
    }

    let prog: { id: number; title: string; slug: string } | null = null;
    if (programIdParam) {
      prog = await prisma.program.findUnique({
        where: { id: parseInt(programIdParam) },
        select: { id: true, title: true, slug: true },
      });
    } else {
      prog = await prisma.program.findUnique({
        where: { slug: programSlug! },
        select: { id: true, title: true, slug: true },
      });
    }

    if (!prog) return NextResponse.json({ error: "Program not found" }, { status: 404 });

    // Teacher must be assigned to this program (or have a course in it)
    if (session.role === "teacher") {
      const teacher = await prisma.teacher.findUnique({ where: { userId: session.userId }, select: { id: true } });
      if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
      const assigned = await prisma.teacherProgram.findFirst({ where: { teacherId: teacher.id, programId: prog.id } });
      const hasCourse = !assigned
        ? await prisma.course.findFirst({ where: { teacherId: teacher.id, OR: [{ programId: prog.id }, { program: prog.slug }] } })
        : null;
      if (!assigned && !hasCourse) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Students via junction table
    const sp = await prisma.studentProgram.findMany({
      where: { programId: prog.id },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            attendances: {
              select: {
                id: true, date: true, status: true,
                course: { select: { id: true, title: true, code: true } },
              },
              orderBy: { date: "desc" },
            },
          },
        },
      },
    });

    const junctionIds = new Set(sp.map((s) => s.student.id));

    // Legacy: students whose primary program slug matches but not in junction yet
    const legacy = await prisma.student.findMany({
      where: { program: prog.slug, id: { notIn: Array.from(junctionIds) } },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        attendances: {
          select: {
            id: true, date: true, status: true,
            course: { select: { id: true, title: true, code: true } },
          },
          orderBy: { date: "desc" },
        },
      },
    });

    const students = [...sp.map((s) => s.student), ...legacy];

    return NextResponse.json({ program: prog.title, programId: prog.id, students });
  } catch (error) {
    console.error("Error fetching program students:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

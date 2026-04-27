export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const teacher = await prisma.teacher.findUnique({ where: { userId: session.userId }, select: { id: true } });
    if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

    const teacherPrograms = await prisma.teacherProgram.findMany({
      where: { teacherId: teacher.id },
      include: {
        program: {
          select: {
            id: true, programCode: true, title: true, slug: true,
            category: true, duration: true, description: true,
            tuition: true, requirements: true, outcomes: true, status: true,
          },
        },
      },
    });

    // Also pick up programs from courses the teacher teaches (backward compat)
    const coursePrograms = await prisma.course.findMany({
      where: { teacherId: teacher.id },
      select: { programId: true, program: true },
      distinct: ["program"],
    });

    const fromJunction = teacherPrograms.map((tp) => tp.program);

    // For courses not yet in the junction, add them if we can resolve their program
    const junctionIds = new Set(fromJunction.map((p) => p.id));
    const extraSlugs = coursePrograms.map((c) => c.program).filter(Boolean);
    if (extraSlugs.length > 0) {
      const extraPrograms = await prisma.program.findMany({
        where: { slug: { in: extraSlugs as string[] }, id: { notIn: Array.from(junctionIds) } },
        select: {
          id: true, programCode: true, title: true, slug: true,
          category: true, duration: true, description: true,
          tuition: true, requirements: true, outcomes: true, status: true,
        },
      });
      fromJunction.push(...extraPrograms);
    }

    // Deduplicate by id
    const seen = new Set<number>();
    const result = fromJunction.filter((p) => { if (seen.has(p.id)) return false; seen.add(p.id); return true; });

    return NextResponse.json(result.sort((a, b) => a.title.localeCompare(b.title)));
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

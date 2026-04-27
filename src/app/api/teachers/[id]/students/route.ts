export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const teacherId = parseInt(params.id);
    if (session.role === "teacher" && session.teacherId !== teacherId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!["teacher", "ceo"].includes(session.role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const teacherPrograms = await prisma.teacherProgram.findMany({ where: { teacherId }, select: { programId: true } });
    const programIds = teacherPrograms.map((tp) => tp.programId);

    const courses = await prisma.course.findMany({ where: { teacherId }, select: { program: true }, distinct: ["program"] });
    const programSlugs = courses.map((c) => c.program).filter(Boolean);

    let studentPrograms: { student: any; program: any }[] = [];

    if (programIds.length > 0) {
      const sp = await prisma.studentProgram.findMany({
        where: { programId: { in: programIds } },
        include: {
          student: { include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } } },
          program: { select: { id: true, title: true, programCode: true, duration: true } },
        },
      });
      studentPrograms = sp.map((s) => ({ student: s.student, program: s.program }));
    } else if (programSlugs.length > 0) {
      const fallback = await prisma.student.findMany({
        where: { program: { in: programSlugs } },
        include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } },
      });
      studentPrograms = fallback.map((s) => ({ student: s, program: null }));
    }

    // Deduplicate students, collecting all their programs
    const studentMap = new Map<number, any>();
    for (const { student: s, program: prog } of studentPrograms) {
      if (!studentMap.has(s.id)) {
        studentMap.set(s.id, {
          id: s.id,
          studentId: s.studentId,
          status: s.status,
          firstName: s.user.firstName,
          lastName: s.user.lastName,
          email: s.user.email,
          phone: s.user.phone,
          programs: [],
        });
      }
      if (prog) {
        studentMap.get(s.id).programs.push(prog);
      }
    }

    return NextResponse.json(Array.from(studentMap.values()));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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

    // Get teacher's programs via junction table
    const teacherPrograms = await prisma.teacherProgram.findMany({ where: { teacherId }, select: { programId: true } });
    const programIds = teacherPrograms.map((tp) => tp.programId);

    // Fallback: also get program slugs from courses
    const courses = await prisma.course.findMany({ where: { teacherId }, select: { program: true }, distinct: ["program"] });
    const programSlugs = courses.map((c) => c.program).filter(Boolean);

    let students: any[] = [];

    if (programIds.length > 0) {
      // Get students via StudentProgram junction
      const sp = await prisma.studentProgram.findMany({
        where: { programId: { in: programIds } },
        include: { student: { include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } } } },
        distinct: ["studentId"],
      });
      students = sp.map((s) => s.student);
    } else if (programSlugs.length > 0) {
      // Fallback: match by program slug
      students = await prisma.student.findMany({
        where: { program: { in: programSlugs } },
        include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } },
      });
    }

    return NextResponse.json(students.map((s) => ({
      id: s.id, studentId: s.studentId, program: s.program, level: s.level, status: s.status,
      firstName: s.user.firstName, lastName: s.user.lastName, email: s.user.email, phone: s.user.phone,
    })));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

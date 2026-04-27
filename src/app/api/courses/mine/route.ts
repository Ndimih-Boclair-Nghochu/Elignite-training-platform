export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// Returns all courses for the student's enrolled programs
export async function GET() {
  const session = await getSession();
  if (!session.userId || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const student = await prisma.student.findUnique({
    where: { userId: session.userId },
    select: {
      program: true,
      studentPrograms: { select: { program: { select: { id: true, slug: true } } } },
    },
  });
  if (!student) return NextResponse.json([]);

  const programIds = student.studentPrograms.map((sp) => sp.program.id);
  const programSlugs = [student.program, ...student.studentPrograms.map((sp) => sp.program.slug)].filter(Boolean) as string[];

  const courses = await prisma.course.findMany({
    where: {
      OR: [
        ...(programIds.length > 0 ? [{ programId: { in: programIds } }] : []),
        ...(programSlugs.length > 0 ? [{ program: { in: programSlugs } }] : []),
      ],
    },
    include: {
      teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { code: "asc" },
  });

  return NextResponse.json(
    courses.map((c) => ({
      id: c.id,
      code: c.code,
      title: c.title,
      description: c.description,
      credits: c.credits,
      program: c.program,
      level: c.level,
      semester: c.semester,
      year: c.year,
      room: c.room,
      schedule: c.schedule,
      teacherName: c.teacher ? `${c.teacher.user.firstName} ${c.teacher.user.lastName}` : null,
    }))
  );
}

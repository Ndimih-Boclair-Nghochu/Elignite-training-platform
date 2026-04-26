export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.role === "student") {
    const student = await prisma.student.findFirst({ where: { user: { id: session.userId } } });
    if (!student) return NextResponse.json([]);
    const results = await prisma.result.findMany({
      where: { studentId: student.id },
      include: { course: true },
      orderBy: { year: "desc" },
    });
    return NextResponse.json(results.map((r) => ({
      id: r.id, ca: r.ca, exam: r.exam, total: r.total, grade: r.grade,
      semester: r.semester, year: r.year,
      courseCode: r.course.code, courseTitle: r.course.title, credits: r.course.credits,
    })));
  }

  if (session.role === "teacher") {
    const results = await prisma.result.findMany({
      where: {
        course: {
          teacherId: session.teacherId,
        },
      },
      include: { course: true, student: { include: { user: { select: { firstName: true, lastName: true } } } } },
      orderBy: { year: "desc" },
    });
    return NextResponse.json(results);
  }

  if (session.role !== "ceo") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const results = await prisma.result.findMany({
    include: { course: true, student: { include: { user: { select: { firstName: true, lastName: true } } } } },
    orderBy: { year: "desc" },
  });
  return NextResponse.json(results);
}

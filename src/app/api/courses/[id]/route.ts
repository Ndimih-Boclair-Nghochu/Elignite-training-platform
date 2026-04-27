export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.userId || !["teacher", "ceo"].includes(session.role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const courseId = parseInt(params.id);
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  if (session.role === "teacher" && course.teacherId !== session.teacherId) {
    return NextResponse.json({ error: "You can only edit your own courses" }, { status: 403 });
  }
  const body = await req.json();
  const updated = await prisma.course.update({
    where: { id: courseId },
    data: {
      title: body.title ?? course.title,
      description: body.description ?? course.description,
      credits: body.credits !== undefined ? Number(body.credits) : course.credits,
      room: body.room ?? course.room,
      schedule: body.schedule ?? course.schedule,
      semester: body.semester ?? course.semester,
      year: body.year !== undefined ? Number(body.year) : course.year,
      level: body.level !== undefined ? Number(body.level) : course.level,
    },
    include: { teacher: { include: { user: { select: { firstName: true, lastName: true } } } } },
  });
  return NextResponse.json({ ...updated, teacherName: updated.teacher ? `${updated.teacher.user.firstName} ${updated.teacher.user.lastName}` : null });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.userId || !["teacher", "ceo"].includes(session.role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const courseId = parseInt(params.id);
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  if (session.role === "teacher" && course.teacherId !== session.teacherId) {
    return NextResponse.json({ error: "You can only delete your own courses" }, { status: 403 });
  }
  await prisma.course.delete({ where: { id: courseId } });
  return NextResponse.json({ success: true });
}

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(_req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.userId },
    select: {
      id: true,
      program: true,
      studentPrograms: { select: { program: { select: { slug: true } } } },
    },
  });
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const programSlugs = [
    student.program,
    ...student.studentPrograms.map((sp) => sp.program.slug),
  ].filter(Boolean) as string[];

  const projects = await prisma.project.findMany({
    where: { program: { in: [...new Set(programSlugs)] } },
    include: {
      teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
      scores: { where: { studentId: student.id } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    projects.map((p) => {
      const score = p.scores[0] ?? null;
      return {
        projectId: p.id,
        code: p.code,
        title: p.title,
        description: p.description,
        program: p.program,
        maxScore: p.maxScore,
        dueDate: p.dueDate,
        teacher: p.teacher,
        score: score?.score ?? null,
        feedback: score?.feedback ?? null,
        submissionLink: score?.submissionLink ?? null,
        submittedAt: score?.submittedAt ?? null,
        gradedAt: score?.gradedAt ?? null,
        scoreId: score?.id ?? null,
        status: score?.gradedAt ? "graded" : score?.submittedAt ? "submitted" : "pending",
      };
    })
  );
}

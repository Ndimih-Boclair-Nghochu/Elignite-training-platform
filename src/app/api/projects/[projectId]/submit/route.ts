export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
  const session = await getSession();
  if (!session.userId || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const student = await prisma.student.findUnique({ where: { userId: session.userId } });
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const projectId = parseInt(params.projectId);
  const { submissionLink } = await req.json();

  const score = await prisma.projectScore.upsert({
    where: { projectId_studentId: { projectId, studentId: student.id } },
    update: { submissionLink: submissionLink || null, submittedAt: new Date(), status: "submitted" } as any,
    create: {
      projectId,
      studentId: student.id,
      score: 0,
      submissionLink: submissionLink || null,
      submittedAt: new Date(),
    },
  });
  return NextResponse.json(score);
}

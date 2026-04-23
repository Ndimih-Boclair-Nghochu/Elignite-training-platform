export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();

  // Only students can access their own projects
  if (!session.userId || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the student record for this user
    const student = await prisma.student.findUnique({
      where: { userId: session.userId },
      select: { id: true, program: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student record not found" }, { status: 404 });
    }

    // Get all projects for this student's program with their scores
    const projectScores = await prisma.projectScore.findMany({
      where: { studentId: student.id },
      include: {
        project: {
          select: {
            id: true,
            code: true,
            title: true,
            description: true,
            program: true,
            maxScore: true,
            dueDate: true,
            teacher: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { gradedAt: { sort: "desc", nulls: "last" } },
    });

    return NextResponse.json(projectScores);
  } catch (error) {
    console.error("Error fetching student projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

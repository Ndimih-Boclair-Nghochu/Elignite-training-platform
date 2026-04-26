export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET project scores for a project
export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = parseInt(params.projectId);
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (session.role === "teacher" && project.teacherId !== session.teacherId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (session.role === "student") {
      const student = await prisma.student.findUnique({
        where: { userId: session.userId },
      });

      if (!student || student.program !== project.program) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (!["teacher", "ceo"].includes(session.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const student = session.role === "student"
      ? await prisma.student.findUnique({
          where: { userId: session.userId },
        })
      : null;

    const scores = await prisma.projectScore.findMany({
      where: {
        projectId,
        ...(student ? { studentId: student.id } : {}),
      },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            user: { select: { firstName: true, lastName: true, matricule: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(scores);
  } catch (error) {
    console.error("Error fetching project scores:", error);
    return NextResponse.json({ error: "Failed to fetch scores" }, { status: 500 });
  }
}

// POST update score
export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getSession();
    if (!session.userId || !["teacher", "ceo"].includes(session.role || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const projectId = parseInt(params.projectId);
    const { studentId, score, feedback } = await req.json();

    if (!studentId || score === undefined) {
      return NextResponse.json(
        { error: "Student ID and score are required" },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if teacher owns the project (if teacher)
    if (session.role === "teacher" && project.teacherId !== session.teacherId) {
      return NextResponse.json(
        { error: "You can only grade your own projects" },
        { status: 403 }
      );
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const projectScore = await prisma.projectScore.upsert({
      where: {
        projectId_studentId: {
          projectId,
          studentId,
        },
      },
      update: {
        score,
        feedback,
        gradedAt: new Date(),
        gradedBy: session.userId,
      },
      create: {
        projectId,
        studentId,
        score,
        feedback,
        gradedAt: new Date(),
        gradedBy: session.userId,
      },
      include: {
        student: {
          select: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    return NextResponse.json(projectScore);
  } catch (error) {
    console.error("Error updating project score:", error);
    return NextResponse.json(
      { error: "Failed to update score" },
      { status: 500 }
    );
  }
}

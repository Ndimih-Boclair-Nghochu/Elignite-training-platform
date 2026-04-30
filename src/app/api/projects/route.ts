export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ensureRuntimeSchema } from "@/lib/runtime-schema";

// GET projects
export async function GET(req: NextRequest) {
  try {
    await ensureRuntimeSchema();
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const program = searchParams.get("program");

    let whereClause: any = {};
    if (program) {
      whereClause.program = program;
    }

    if (session.role === "teacher") {
      whereClause.teacherId = session.teacherId;
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        teacher: {
          select: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        scores: {
          include: {
            student: {
              select: {
                id: true,
                studentId: true,
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST create project
export async function POST(req: NextRequest) {
  try {
    await ensureRuntimeSchema();
    const session = await getSession();
    if (!session.userId || !["teacher", "ceo"].includes(session.role || "")) {
      return NextResponse.json(
        { error: "Only teachers and CEO can create projects" },
        { status: 403 }
      );
    }

    const { code, title, description, program, dueDate, maxScore } = await req.json();

    if (!code || !title || !program) {
      return NextResponse.json(
        { error: "Code, title, and program are required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        code,
        title,
        description,
        program,
        dueDate: dueDate ? new Date(dueDate) : null,
        maxScore: maxScore || 100,
        teacherId: session.role === "teacher" ? session.teacherId : null,
      },
      include: {
        teacher: {
          select: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        scores: true,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

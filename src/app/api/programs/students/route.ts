export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || !["teacher", "ceo"].includes(session.role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const program = searchParams.get("program");

    if (!program) {
      return NextResponse.json(
        { error: "program is required" },
        { status: 400 }
      );
    }

    if (session.role === "teacher") {
      const assignedCourse = await prisma.course.findFirst({
        where: {
          program,
          teacherId: session.teacherId,
        },
      });

      if (!assignedCourse) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Get all students in this program
    const students = await prisma.student.findMany({
      where: { program: program },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        attendances: {
          select: {
            id: true,
            date: true,
            status: true,
            course: {
              select: {
                id: true,
                title: true,
                code: true,
              },
            },
          },
          orderBy: { date: "desc" },
        },
      },
      orderBy: { enrollmentDate: "asc" },
    });

    return NextResponse.json({
      program,
      students,
    });
  } catch (error) {
    console.error("Error fetching program students:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

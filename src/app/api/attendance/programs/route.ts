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
    if (session.role === "ceo") {
      const programs = await prisma.program.findMany({
        orderBy: { title: "asc" },
        include: {
          _count: {
            select: {
              students: true,
              courses: true,
            },
          },
        },
      });

      return NextResponse.json(
        programs.map((program) => ({
          id: program.id,
          title: program.title,
          slug: program.slug,
          programCode: program.programCode,
          studentCount: program._count.students,
          courseCount: program._count.courses,
        }))
      );
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!teacher) {
      return NextResponse.json([]);
    }

    const programs = await prisma.teacherProgram.findMany({
      where: { teacherId: teacher.id },
      include: {
        program: {
          include: {
            _count: {
              select: {
                students: true,
                courses: true,
              },
            },
          },
        },
      },
      orderBy: { program: { title: "asc" } },
    });

    return NextResponse.json(
      programs.map(({ program }) => ({
        id: program.id,
        title: program.title,
        slug: program.slug,
        programCode: program.programCode,
        studentCount: program._count.students,
        courseCount: program._count.courses,
      }))
    );
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

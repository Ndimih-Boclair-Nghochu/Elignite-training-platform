export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Get all programs this teacher teaches
    const courses = await prisma.course.findMany({
      where: { teacherId: teacher.id },
      select: { program: true },
      distinct: ["program"],
    });

    const programs = courses
      .map((c) => c.program)
      .filter((p) => p && p.trim() !== "")
      .sort();

    return NextResponse.json([...new Set(programs)]);
  } catch (error) {
    console.error("Error fetching teacher programs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

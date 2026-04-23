export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(
  req: NextRequest,
  { params }: { params: { studentId: string } }
) {
  const session = await getSession();
  if (!session.userId || !["teacher", "ceo"].includes(session.role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const program = searchParams.get("program");

    const studentId = parseInt(params.studentId);

    // Verify student exists and is in the specified program
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { program: true, id: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (program && student.program !== program) {
      return NextResponse.json(
        { error: "Student not in specified program" },
        { status: 403 }
      );
    }

    // Get attendance records for this student
    const attendances = await prisma.attendance.findMany({
      where: { studentId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(attendances);
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

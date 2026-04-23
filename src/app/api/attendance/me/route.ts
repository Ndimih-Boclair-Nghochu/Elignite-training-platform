export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  
  // Only students can access their own attendance
  if (!session.userId || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the student record for this user
    const student = await prisma.student.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student record not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date"); // Optional: filter by specific date

    let whereClause: any = { studentId: student.id };

    if (dateParam) {
      const date = new Date(dateParam);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      whereClause.date = {
        gte: date,
        lt: nextDay,
      };
    }

    // Get attendance records for this student
    const attendances = await prisma.attendance.findMany({
      where: whereClause,
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

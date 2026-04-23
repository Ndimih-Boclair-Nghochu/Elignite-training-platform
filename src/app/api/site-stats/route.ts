export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const studentCount = await prisma.student.count();
    const graduateCount = await prisma.student.count({ where: { status: "graduated" } });
    const facultyCount = await prisma.teacher.count({ where: { status: "active" } });
    const programCount = await prisma.program.count({ where: { status: "published" } });

    return NextResponse.json({
      studentCount,
      programCount,
      facultyCount,
      graduateCount,
    });
  } catch (error) {
    console.error("Error fetching site stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch site stats" },
      { status: 500 }
    );
  }
}

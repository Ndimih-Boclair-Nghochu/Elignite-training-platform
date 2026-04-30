export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncPlatformCountersFromDatabase } from "@/lib/platform-metrics";

export async function GET() {
  try {
    const [settings, facultyCount, programCount] = await Promise.all([
      syncPlatformCountersFromDatabase(),
      prisma.teacher.count({ where: { status: "active" } }),
      prisma.program.count({ where: { status: "published" } }),
    ]);

    return NextResponse.json({
      studentCount: settings.sessionStudentCount,
      programCount,
      facultyCount,
      graduateCount: settings.lifetimeGraduateCount,
      lifetimeStudentCount: settings.lifetimeStudentCount,
    });
  } catch (error) {
    console.error("Error fetching site stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch site stats" },
      { status: 500 }
    );
  }
}

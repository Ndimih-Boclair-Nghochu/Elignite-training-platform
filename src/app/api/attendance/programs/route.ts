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
    // Get all distinct programs from students
    const programs = await prisma.student.findMany({
      distinct: ["program"],
      select: {
        program: true,
      },
      where: {
        program: { not: "" },
      },
      orderBy: { program: "asc" },
    });

    return NextResponse.json(programs.map((p) => p.program));
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status");

  try {
    const where = !session.userId
      ? { status: "approved" as const }
      : session.role === "ceo"
        ? statusFilter
          ? { status: statusFilter }
          : {}
        : {
            OR: [
              { status: "approved" as const },
              { userId: session.userId }
            ]
          };

    const testimonies = await prisma.testimony.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, photoUrl: true, email: true } },
        approver: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(testimonies);
  } catch (error) {
    console.error("Error fetching testimonies:", error);
    return NextResponse.json({ error: "Failed to fetch testimonies" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();

  if (!session.userId || !["student", "teacher"].includes(session.role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, program, year, text, rating } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Testimony text is required" }, { status: 400 });
    }

    const testimony = await prisma.testimony.create({
      data: {
        userId: session.userId,
        submitterType: session.role as "student" | "teacher",
        name: name || `${session.firstName} ${session.lastName}`,
        program: program || "",
        year: year || "",
        text: text.trim(),
        rating: Math.min(Math.max(rating || 5, 1), 5), // Ensure 1-5 range
        status: "pending", // Always pending initially
      },
      include: {
        user: { select: { firstName: true, lastName: true, photoUrl: true, email: true } },
      },
    });

    return NextResponse.json(testimony, { status: 201 });
  } catch (error) {
    console.error("Error creating testimony:", error);
    return NextResponse.json({ error: "Failed to create testimony" }, { status: 500 });
  }
}

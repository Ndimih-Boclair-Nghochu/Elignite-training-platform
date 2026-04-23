export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET: Fetch all programs
export async function GET() {
  try {
    const programs = await prisma.program.findMany({
      orderBy: { title: "asc" },
    });

    return NextResponse.json(programs);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 }
    );
  }
}

// POST: Create new program (CEO only)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.userId || session.role !== "ceo") {
      return NextResponse.json(
        { error: "Unauthorized - Only CEO can create programs" },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (!body.title || body.tuition === undefined) {
      return NextResponse.json(
        { error: "Missing required fields (title, tuition)" },
        { status: 400 }
      );
    }

    const program = await prisma.program.create({
      data: {
        ...body,
        tuition: Number(body.tuition),
      },
    });

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create program" },
      { status: 500 }
    );
  }
}

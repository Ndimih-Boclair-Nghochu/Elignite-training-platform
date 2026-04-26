export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { z } from "zod";

const programSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  category: z.string().min(2),
  duration: z.string().min(2),
  description: z.string().min(10),
  tuition: z.coerce.number().min(0),
  requirements: z.string().optional().or(z.literal("")),
  outcomes: z.string().optional().or(z.literal("")),
  status: z.string().optional(),
});

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
    const payload = programSchema.safeParse(body);
    if (!payload.success) {
      return NextResponse.json({ error: payload.error.issues[0]?.message || "Invalid program data" }, { status: 400 });
    }

    const existing = await prisma.program.findUnique({ where: { slug: payload.data.slug } });
    if (existing) {
      return NextResponse.json({ error: "A program with this slug already exists" }, { status: 409 });
    }

    const program = await prisma.program.create({
      data: {
        ...payload.data,
        requirements: payload.data.requirements || null,
        outcomes: payload.data.outcomes || null,
        status: payload.data.status || "published",
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

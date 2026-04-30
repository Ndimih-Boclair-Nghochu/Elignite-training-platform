export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { z } from "zod";
import { ensureRuntimeSchema } from "@/lib/runtime-schema";

const programSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  category: z.string().min(2),
  duration: z.string().min(2),
  description: z.string().min(10),
  tuition: z.coerce.number().min(0),
  requirements: z.string().optional().or(z.literal("")),
  outcomes: z.string().optional().or(z.literal("")),
  imageUrl: z.string().optional().or(z.literal("")),
  status: z.string().optional(),
});

export async function GET() {
  try {
    await ensureRuntimeSchema();
    const programs = await prisma.program.findMany({
      orderBy: { title: "asc" },
      include: {
        teachers: { include: { teacher: { include: { user: { select: { firstName: true, lastName: true } } } } } },
        _count: { select: { students: true, courses: true } },
      },
    });
    return NextResponse.json(programs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch programs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureRuntimeSchema();
    const session = await getSession();
    if (!session?.userId || session.role !== "ceo") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const payload = programSchema.safeParse(body);
    if (!payload.success) {
      return NextResponse.json({ error: payload.error.issues[0]?.message || "Invalid data" }, { status: 400 });
    }

    const slugConflict = await prisma.program.findUnique({ where: { slug: payload.data.slug } });
    if (slugConflict) {
      return NextResponse.json({ error: "A program with this slug already exists" }, { status: 409 });
    }

    // Auto-generate programCode: PRG-001, PRG-002, ...
    // Use max existing number to avoid collisions after deletions
    const allCodes = await prisma.program.findMany({ select: { programCode: true } });
    const maxNum = allCodes.reduce((max, p) => {
      const m = p.programCode.match(/PRG-(\d+)/);
      return m ? Math.max(max, parseInt(m[1], 10)) : max;
    }, 0);
    const programCode = `PRG-${String(maxNum + 1).padStart(3, "0")}`;

    const program = await prisma.program.create({
      data: {
        ...payload.data,
        programCode,
        requirements: payload.data.requirements || null,
        outcomes: payload.data.outcomes || null,
        imageUrl: payload.data.imageUrl || null,
        status: payload.data.status || "published",
      },
    });

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create program" }, { status: 500 });
  }
}

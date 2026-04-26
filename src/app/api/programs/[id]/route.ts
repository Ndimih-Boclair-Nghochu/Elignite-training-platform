export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { z } from "zod";

const programUpdateSchema = z.object({
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

// GET: Fetch single program
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const program = await prisma.program.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!program) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(program);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch program" },
      { status: 500 }
    );
  }
}

// PATCH: Update program (CEO only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session?.userId || session.role !== "ceo") {
      return NextResponse.json(
        { error: "Unauthorized - Only CEO can update programs" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const payload = programUpdateSchema.safeParse(body);
    if (!payload.success) {
      return NextResponse.json({ error: payload.error.issues[0]?.message || "Invalid program data" }, { status: 400 });
    }

    const existing = await prisma.program.findFirst({
      where: {
        slug: payload.data.slug,
        NOT: { id: parseInt(params.id) },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Another program already uses this slug" }, { status: 409 });
    }

    const program = await prisma.program.update({
      where: { id: parseInt(params.id) },
      data: {
        ...payload.data,
        requirements: payload.data.requirements || null,
        outcomes: payload.data.outcomes || null,
        imageUrl: payload.data.imageUrl || null,
        status: payload.data.status || "published",
      },
    });

    return NextResponse.json(program);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update program" },
      { status: 500 }
    );
  }
}

// DELETE: Delete program (CEO only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session?.userId || session.role !== "ceo") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.program.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete program" },
      { status: 500 }
    );
  }
}

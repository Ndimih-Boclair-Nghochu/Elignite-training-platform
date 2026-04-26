import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  subject: z.string().min(3).max(160),
  body: z.string().min(10).max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const payload = contactSchema.parse(json);

    const message = await prisma.message.create({
      data: {
        fromName: payload.name,
        fromEmail: payload.email,
        fromRole: "guest",
        toRole: "ceo",
        subject: payload.subject,
        body: payload.body,
      },
    });

    return NextResponse.json({ id: message.id, ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid form data" }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to send message right now" }, { status: 500 });
  }
}

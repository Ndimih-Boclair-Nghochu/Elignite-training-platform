export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const messages = await prisma.message.findMany({
    where: { toRole: session.role },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const message = await prisma.message.create({
    data: {
      fromName: `${session.firstName} ${session.lastName}`,
      fromEmail: session.email!,
      fromRole: session.role!,
      toRole: body.toRole || "ceo",
      subject: body.subject,
      body: body.body,
    },
  });
  return NextResponse.json(message, { status: 201 });
}

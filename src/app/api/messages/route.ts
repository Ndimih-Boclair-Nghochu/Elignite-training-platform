export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "sent"

  if (type === "sent") {
    const msgs = await prisma.message.findMany({
      where: { fromUserId: session.userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(msgs);
  }

  // For students, also match messages targeting their program
  let programId: number | null = null;
  if (session.role === "student") {
    const student = await prisma.student.findUnique({
      where: { userId: session.userId },
      select: { studentPrograms: { where: { isPrimary: true }, take: 1, select: { programId: true } } },
    });
    programId = student?.studentPrograms[0]?.programId ?? null;
  }

  const msgs = await prisma.message.findMany({
    where: {
      OR: [
        { toRole: session.role },
        { toRole: "all" },
        { toUserId: session.userId },
        ...(programId ? [{ toProgramId: programId }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(msgs);
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
      fromUserId: session.userId,
      toRole: body.toRole || "ceo",
      toUserId: body.toUserId ? Number(body.toUserId) : null,
      toProgramId: body.toProgramId ? Number(body.toProgramId) : null,
      subject: body.subject,
      body: body.body,
    },
  });
  return NextResponse.json(message, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await prisma.message.update({ where: { id: Number(id) }, data: { read: true } });
  return NextResponse.json({ success: true });
}

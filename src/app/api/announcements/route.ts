export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const where = session.role === "student"
    ? { OR: [{ targetRole: "all" }, { targetRole: "student" }] }
    : session.role === "teacher"
    ? { OR: [{ targetRole: "all" }, { targetRole: "teacher" }] }
    : {};

  const announcements = await prisma.announcement.findMany({
    where,
    include: { user: { select: { firstName: true, lastName: true, photoUrl: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(announcements);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || !["ceo", "teacher"].includes(session.role!)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const announcement = await prisma.announcement.create({
    data: {
      ...body,
      author: `${session.firstName} ${session.lastName}`,
      userId: session.userId,
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          photoUrl: true,
          role: true,
        },
      },
    },
  });
  return NextResponse.json(announcement, { status: 201 });
}

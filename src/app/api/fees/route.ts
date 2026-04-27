export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.role === "student") {
    const student = await prisma.student.findFirst({ where: { user: { id: session.userId } } });
    if (!student) return NextResponse.json([]);
    const fees = await prisma.fee.findMany({
      where: { studentId: student.id },
      orderBy: { dueDate: "asc" },
    });
    return NextResponse.json(fees);
  }

  if (session.role !== "ceo") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");

  if (studentId) {
    const fees = await prisma.fee.findMany({
      where: { studentId: parseInt(studentId) },
      orderBy: { dueDate: "asc" },
    });
    return NextResponse.json(fees);
  }

  const fees = await prisma.fee.findMany({
    include: { student: { include: { user: { select: { firstName: true, lastName: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(fees);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== "ceo") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const fee = await prisma.fee.create({
    data: { ...body, dueDate: new Date(body.dueDate), amount: Number(body.amount) },
  });
  return NextResponse.json(fee, { status: 201 });
}

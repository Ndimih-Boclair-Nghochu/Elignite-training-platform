export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.userId || session.role !== "ceo") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const feeId = parseInt(params.id);
  if (isNaN(feeId)) return NextResponse.json({ error: "Invalid fee ID" }, { status: 400 });

  const body = await req.json();
  const { status, paidDate, description, amount, dueDate } = body;

  const data: Record<string, unknown> = {};
  if (status !== undefined) data.status = status;
  if (description !== undefined) data.description = description;
  if (amount !== undefined) data.amount = Number(amount);
  if (dueDate !== undefined) data.dueDate = new Date(dueDate);
  if (paidDate !== undefined) data.paidDate = paidDate ? new Date(paidDate) : null;

  if (status === "paid" && !paidDate) {
    data.paidDate = new Date();
    data.receiptNo = `REC-${Date.now()}`;
  }
  if (status === "pending" || status === "overdue") {
    data.paidDate = null;
    data.receiptNo = null;
  }

  const fee = await prisma.fee.update({ where: { id: feeId }, data });
  return NextResponse.json(fee);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.userId || session.role !== "ceo") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const feeId = parseInt(params.id);
  if (isNaN(feeId)) return NextResponse.json({ error: "Invalid fee ID" }, { status: 400 });

  await prisma.fee.delete({ where: { id: feeId } });
  return NextResponse.json({ ok: true });
}

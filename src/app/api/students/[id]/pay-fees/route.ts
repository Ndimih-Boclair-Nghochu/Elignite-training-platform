export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  
  // Debug logging
  console.log("[POST /api/students/[id]/pay-fees] Session:", {
    userId: session.userId,
    email: session.email,
    role: session.role,
  });
  
  if (!session.userId) {
    return NextResponse.json(
      { error: "Unauthorized - Please login first", details: "No session found" },
      { status: 401 }
    );
  }
  
  if (session.role !== "ceo") {
    return NextResponse.json(
      {
        error: "Unauthorized - Only CEO can record payments",
        details: `Your role is '${session.role}', but 'ceo' is required`,
        yourRole: session.role,
        requiredRole: "ceo"
      },
      { status: 403 }
    );
  }

  const studentId = Number(params.id);
  if (Number.isNaN(studentId)) {
    return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });
  }

  const body = await req.json();
  const amount = Number(body.amount ?? 0);
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Payment amount must be greater than zero" }, { status: 400 });
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { fees: true, payments: true },
  });
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const invoiceTotal = student.fees.reduce((total, fee) => total + fee.amount, 0);
  const paidAmount = student.payments.reduce((total, payment) => total + payment.amount, 0);
  const outstanding = Math.max(invoiceTotal - paidAmount, 0);

  if (amount > outstanding) {
    return NextResponse.json({ error: "Amount exceeds outstanding balance" }, { status: 400 });
  }

  const payment = await prisma.payment.create({
    data: {
      studentId,
      amount,
    },
  });

  if (amount >= outstanding && outstanding > 0) {
    await prisma.fee.updateMany({
      where: {
        studentId,
        status: { in: ["pending", "overdue"] },
      },
      data: {
        status: "paid",
        paidDate: new Date(),
        receiptNo: `REC-${Date.now()}`,
      },
    });
  }

  return NextResponse.json({ payment, outstanding: outstanding - amount });
}

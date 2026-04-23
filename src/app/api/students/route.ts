export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const students = await prisma.student.findMany({
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true, isActivated: true } },
      fees: true,
      payments: true,
    },
    orderBy: { enrollmentDate: "desc" },
  });

  return NextResponse.json(students.map((s) => {
    const invoiceTotal = s.fees.reduce((total, fee) => total + fee.amount, 0);
    const paidAmount = s.payments.reduce((total, payment) => total + payment.amount, 0);
    const feeDue = Math.max(invoiceTotal - paidAmount, 0);
    const allFeesPaid = invoiceTotal > 0 ? feeDue <= 0 : true;

    return {
      id: s.id,
      studentId: s.studentId,
      program: s.program,
      level: s.level,
      status: s.status,
      gender: s.gender,
      address: s.address,
      firstName: s.user.firstName,
      lastName: s.user.lastName,
      email: s.user.email,
      phone: s.user.phone,
      isActivated: s.user.isActivated,
      enrollmentDate: s.enrollmentDate,
      feeDue,
      paidAmount,
      totalFeeAmount: invoiceTotal,
      allFeesPaid,
    };
  }));
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== "ceo") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { firstName, lastName, email, phone, program, level, gender, address, parentName, parentPhone } = body;

  // Create user first
  const { default: bcrypt } = await import("bcryptjs");
  const password = await bcrypt.hash("student123", 10);

  const user = await prisma.user.create({
    data: { firstName, lastName, email, password, role: "student", phone },
  });

  const student = await prisma.student.create({
    data: {
      studentId: `STU${Date.now().toString().slice(-6)}`,
      userId: user.id, program, level: Number(level) || 1,
      gender, address, parentName, parentPhone,
    },
  });

  return NextResponse.json({ ...student, firstName, lastName, email }, { status: 201 });
}

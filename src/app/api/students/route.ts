export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { recordStudentCreated } from "@/lib/platform-metrics";

export async function GET() {
  const session = await getSession();
  if (!session.userId || session.role !== "ceo") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const students = await prisma.student.findMany({
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true, isActivated: true } },
      fees: true,
      payments: true,
      studentPrograms: { include: { program: { select: { id: true, programCode: true, title: true, duration: true } } } },
    },
    orderBy: { enrollmentDate: "desc" },
  });

  return NextResponse.json(
    students.map((s) => {
      const invoiceTotal = s.fees.reduce((total, fee) => total + fee.amount, 0);
      const paidAmount = s.payments.reduce((total, payment) => total + payment.amount, 0);
      const feeDue = Math.max(invoiceTotal - paidAmount, 0);
      return {
        id: s.id,
        studentId: s.studentId,
        program: s.program,
        programs: s.studentPrograms.map((sp) => sp.program),
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
        allFeesPaid: invoiceTotal > 0 ? feeDue <= 0 : true,
      };
    })
  );
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== "ceo") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { firstName, lastName, email, phone, programIds, level, gender, address, parentName, parentPhone } = body;

  // programIds is an array of Program IDs (max 2). First one is primary.
  const validIds: number[] = Array.isArray(programIds) ? programIds.slice(0, 2) : [];

  if (validIds.length === 0) {
    return NextResponse.json({ error: "At least one program is required" }, { status: 400 });
  }

  // Resolve primary program slug for backward compat
  const primaryProgram = await prisma.program.findUnique({ where: { id: validIds[0] } });
  if (!primaryProgram) {
    return NextResponse.json({ error: "Primary program not found" }, { status: 400 });
  }

  const { default: bcrypt } = await import("bcryptjs");
  const tempPassword = `Stu${Math.random().toString(36).slice(2, 10)}A1!`;
  const password = await bcrypt.hash(tempPassword, 10);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: { firstName, lastName, email, password, role: "student", phone, isActivated: false },
  });

  const student = await prisma.student.create({
    data: {
      studentId: `STU${Date.now().toString().slice(-6)}`,
      userId: user.id,
      program: primaryProgram.slug, // keep primary slug for compat
      level: Number(level) || 1,
      gender,
      address,
      parentName,
      parentPhone,
    },
  });

  // Create StudentProgram entries (up to 2 programs)
  await prisma.studentProgram.createMany({
    data: validIds.map((pid, i) => ({ studentId: student.id, programId: pid, isPrimary: i === 0 })),
    skipDuplicates: true,
  });

  await recordStudentCreated();

  return NextResponse.json({ ...student, firstName, lastName, email }, { status: 201 });
}

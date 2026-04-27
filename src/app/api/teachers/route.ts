export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.userId || session.role !== "ceo") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teachers = await prisma.teacher.findMany({
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      teacherPrograms: { include: { program: { select: { id: true, programCode: true, title: true } } } },
    },
    orderBy: { joinDate: "desc" },
  });

  return NextResponse.json(
    teachers.map((t) => ({
      id: t.id,
      teacherId: t.teacherId,
      matricle: t.matricle,
      specialization: t.specialization,
      qualifications: t.qualifications,
      office: t.office,
      status: t.status,
      programs: t.teacherPrograms.map((tp) => tp.program),
      user: {
        id: t.user.id,
        firstName: t.user.firstName,
        lastName: t.user.lastName,
        email: t.user.email,
        phone: t.user.phone,
      },
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== "ceo") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { firstName, lastName, email, phone, specialization, qualifications, office, programIds } = await req.json();

  if (!firstName || !lastName || !email) {
    return NextResponse.json({ error: "First name, last name and email are required" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const { default: bcrypt } = await import("bcryptjs");
  const tempPassword = `Temp${Math.random().toString(36).slice(2, 10)}A1!`;
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const user = await prisma.user.create({
    data: { firstName, lastName, email, password: hashedPassword, role: "teacher", phone, isActivated: false },
  });

  const teacherId = `TCH${Date.now().toString().slice(-6)}`;
  const matricle = `MAT${Date.now().toString().slice(-8)}`;

  const teacher = await prisma.teacher.create({
    data: {
      teacherId, matricle, userId: user.id, status: "inactive",
      ...(specialization && { specialization }),
      ...(qualifications && { qualifications }),
      ...(office && { office }),
    },
  });

  if (Array.isArray(programIds) && programIds.length > 0) {
    await prisma.teacherProgram.createMany({
      data: programIds.map((pid: number) => ({ teacherId: teacher.id, programId: pid })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json(
    {
      id: teacher.id, teacherId: teacher.teacherId, matricle: teacher.matricle,
      status: teacher.status,
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone },
    },
    { status: 201 }
  );
}

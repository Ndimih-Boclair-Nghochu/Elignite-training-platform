export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { recordStudentCreated } from "@/lib/platform-metrics";

// GET all users (CEO only)
export async function GET() {
  const session = await getSession();
  if (!session.userId || session.role !== "ceo") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const users = await prisma.user.findMany({
    select: { id: true, email: true, firstName: true, lastName: true, role: true, phone: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

// POST create user (CEO only)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== "ceo") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { firstName, lastName, email, password, role, phone } = await req.json();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 409 });

  const tempPassword = password || `Temp${Math.random().toString(36).slice(2, 10)}A1!`;
  const hashed = await bcrypt.hash(tempPassword, 10);
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashed,
      role,
      phone,
      isActivated: role === "ceo",
    },
  });

  if (role === "student") {
    await prisma.student.create({
      data: { studentId: `STU${Date.now().toString().slice(-6)}`, userId: user.id, program: "", level: 1 },
    });
    await recordStudentCreated();
  } else if (role === "teacher") {
    await prisma.teacher.create({
      data: { teacherId: `TCH${Date.now().toString().slice(-6)}`, userId: user.id, department: "" },
    });
  }

  return NextResponse.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }, { status: 201 });
}

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.userId || session.role !== "ceo") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { identifier, password, confirmPassword, email } = await req.json();
    const loginValue = (identifier ?? "").trim();

    if (!loginValue || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Student identifier and password are required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { matricle: loginValue },
          { studentId: loginValue },
        ],
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student record not found for the provided identifier" },
        { status: 404 }
      );
    }

    let linkedUser = null;
    if (student.userId) {
      linkedUser = await prisma.user.findUnique({ where: { id: student.userId } });
    }

    if (linkedUser) {
      return NextResponse.json(
        { error: "This student already has a valid account linked." },
        { status: 409 }
      );
    }

    const existingUserWithMatricule = await prisma.user.findUnique({
      where: { matricule: loginValue },
    });

    if (existingUserWithMatricule) {
      return NextResponse.json(
        {
          error:
            "A user already exists with this identifier. Please resolve the duplicate user before repairing the student record.",
        },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        matricule: loginValue,
        email: email || `${loginValue}@school.local`,
        password: hashed,
        firstName: "",
        lastName: "",
        role: "student",
        isActivated: true,
      },
    });

    await prisma.student.update({
      where: { id: student.id },
      data: { userId: user.id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Student account repaired and re-linked successfully.",
        user: {
          id: user.id,
          matricule: user.matricule,
          email: user.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Repair error:", error);
    return NextResponse.json({ error: "Repair failed. Please try again." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { default as bcrypt } from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { identifier, email, password, confirmPassword } = await req.json();
    const loginValue = String(identifier || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    // Validate inputs
    if (!loginValue || !normalizedEmail || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Identifier, email, and password fields are required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Find the student or teacher by matricle or generated student ID / teacher ID
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { matricle: loginValue },
          { studentId: loginValue },
        ],
      },
      include: {
        user: true,
      },
    });

    let targetUser = student?.user;
    let teacherRecord = null;

    if (!targetUser) {
      teacherRecord = await prisma.teacher.findFirst({
        where: {
          OR: [
            { matricle: loginValue },
            { teacherId: loginValue },
          ],
        },
        include: {
          user: true,
        },
      });
      targetUser = teacherRecord?.user || undefined;
    }

    if (!targetUser) {
      const directUser = await prisma.user.findUnique({
        where: { matricule: loginValue },
      });
      targetUser = directUser || undefined;
    }

    if (!targetUser) {
      return NextResponse.json(
        { error: "Invalid matricle" },
        { status: 404 }
      );
    }

    if ((targetUser.email || "").toLowerCase() !== normalizedEmail) {
      return NextResponse.json(
        { error: "Email does not match this account." },
        { status: 403 }
      );
    }

    // Check if account is already activated
    if (targetUser.isActivated) {
      return NextResponse.json(
        { error: "Account is already activated" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user with new password and activate account
    await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        password: hashedPassword,
        isActivated: true,
      },
    });

    if (teacherRecord) {
      await prisma.teacher.update({
        where: { id: teacherRecord.id },
        data: { status: "active" },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Account activated successfully. You can now login.",
    });
  } catch (error) {
    console.error("Activation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

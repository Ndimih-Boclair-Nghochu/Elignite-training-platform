export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { default as bcrypt } from "bcryptjs";
import { z } from "zod";

const activateSchema = z.object({
  identifier: z.string().trim().min(1, "Identifier is required"),
  email: z.string().trim().email("A valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Password confirmation is required"),
}).superRefine((value, ctx) => {
  if (value.password !== value.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["confirmPassword"],
      message: "Passwords do not match",
    });
  }
});

export async function POST(req: NextRequest) {
  try {
    const parsed = activateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid activation payload" },
        { status: 400 }
      );
    }

    const loginValue = parsed.data.identifier;
    const normalizedEmail = parsed.data.email.toLowerCase();
    const password = parsed.data.password;

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

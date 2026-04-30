export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { normalizeRole } from "@/lib/roles";

export async function POST(req: NextRequest) {
  try {
    const { identifier, email, matricle, password } = await req.json();
    const loginValue = (identifier ?? email ?? matricle ?? "").trim();

    if (!loginValue || !password) {
      return NextResponse.json(
        { error: "Identifier and password are required" },
        { status: 400 }
      );
    }

    let user = null;
    const isEmail = loginValue.includes("@");

    if (isEmail) {
      user = await prisma.user.findUnique({
        where: { email: loginValue.toLowerCase() },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { matricule: loginValue },
      });

      if (!user) {
        const student = await prisma.student.findFirst({
          where: {
            OR: [{ matricle: loginValue }, { studentId: loginValue }],
          },
          include: { user: true },
        });

        if (student) user = student.user;
      }

      if (!user) {
        const teacher = await prisma.teacher.findUnique({
          where: { teacherId: loginValue },
        });

        if (teacher) {
          user = await prisma.user.findUnique({
            where: { id: teacher.userId },
          });
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid identifier or password" },
        { status: 401 }
      );
    }

    const normalizedRole = normalizeRole(user.role);

    // Check activation BEFORE password so unactivated users get the right error
    // (pre-created accounts have an unknown random temp password, so bcrypt would
    // always fail and hide the real reason they can't log in)
    if (
      (normalizedRole === "student" || normalizedRole === "teacher" || normalizedRole === "partner") &&
      !user.isActivated
    ) {
      return NextResponse.json(
        {
          error:
            "Your account has not been activated yet. Please visit /activate.",
          requiresActivation: true,
        },
        { status: 403 }
      );
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: "Invalid identifier or password" },
        { status: 401 }
      );
    }

    let teacherId: number | undefined;
    let studentId: number | undefined;
    let partnerProfileId: number | undefined;

    if (normalizedRole === "teacher") {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: user.id },
      });
      teacherId = teacher?.id;
    }

    if (normalizedRole === "student") {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
      });
      studentId = student?.id;
    }

    if (normalizedRole === "partner") {
      const partnerProfile = await prisma.schoolPartnerProfile.findUnique({
        where: { userId: user.id },
      });
      partnerProfileId = partnerProfile?.id;
    }

    const session = await getSession();
    session.userId = user.id;
    session.email =
      (user.email || user.matricule || user.id.toString()) as string;
    session.firstName = user.firstName || "";
    session.lastName = user.lastName || "";
    session.role = normalizedRole;
    session.teacherId = teacherId;
    session.studentId = studentId;
    session.partnerProfileId = partnerProfileId;

    await session.save();

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: normalizedRole,
        teacherId,
        studentId,
        partnerProfileId,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { recordStudentCreated } from "@/lib/platform-metrics";

export async function POST(req: NextRequest) {
  try {
    const { matricule, email, password, confirmPassword } = await req.json();
    const normalizedMatricule = String(matricule || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    // Validate required fields
    if (!normalizedMatricule || !normalizedEmail || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Matricule, email, password, and password confirmation are required" },
        { status: 400 }
      );
    }

    // Check password match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Check password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    let enrollmentData = null;
    let existingStudent = null;
    let enrollment = await prisma.enrollment.findUnique({
      where: { matricle: normalizedMatricule },
    });

    // If no enrollment, try to find existing student record
    if (!enrollment) {
      existingStudent = await prisma.student.findFirst({
        where: {
          OR: [
            { matricle: normalizedMatricule },
            { studentId: normalizedMatricule },
          ],
        },
        include: {
          user: true,
        },
      });

      if (!existingStudent) {
        return NextResponse.json(
          { error: "Invalid matricule number. Please verify and try again." },
          { status: 404 }
        );
      }

      if (existingStudent.user?.email?.toLowerCase() !== normalizedEmail) {
        return NextResponse.json(
          { error: "Email does not match the student record for this matricule." },
          { status: 403 }
        );
      }

      if (existingStudent.userId) {
        const linkedUser = await prisma.user.findUnique({
          where: { id: existingStudent.userId },
        });

        if (linkedUser) {
          return NextResponse.json(
            { error: "Account already exists for this student" },
            { status: 409 }
          );
        }
      }

      enrollmentData = {
        matricle: existingStudent.matricle || normalizedMatricule,
        firstName: existingStudent.user?.firstName || "",
        lastName: existingStudent.user?.lastName || "",
        email: normalizedEmail,
        program: existingStudent.program,
        status: "approved",
      } as const;
    } else {
      if (enrollment.status !== "approved") {
        return NextResponse.json(
          {
            error: `Your enrollment is ${enrollment.status}. Please contact admissions.`,
          },
          { status: 403 }
        );
      }

      if (enrollment.email.toLowerCase() !== normalizedEmail) {
        return NextResponse.json(
          { error: "Email does not match the approved enrollment for this matricule." },
          { status: 403 }
        );
      }

      enrollmentData = enrollment;
    }

    // Check if user already exists with this matricule
    const existing = await prisma.user.findUnique({ where: { matricule: normalizedMatricule } });
    if (existing) {
      return NextResponse.json(
        { error: "Matricule already registered" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        matricule: normalizedMatricule,
        email: normalizedEmail,
        password: hashed,
        firstName: enrollmentData?.firstName || "",
        lastName: enrollmentData?.lastName || "",
        role: "student",
        isActivated: true,
      },
    });

    let studentId: number | undefined;
    if (!existingStudent) {
      existingStudent = await prisma.student.findFirst({
        where: {
          OR: [
            { matricle: normalizedMatricule },
            { studentId: normalizedMatricule },
          ],
        },
      });
    }

    if (existingStudent) {
      await prisma.student.update({
        where: { id: existingStudent.id },
        data: { userId: user.id },
      });
      studentId = existingStudent.id;
    } else {
      const student = await prisma.student.create({
        data: {
          studentId: `STU${Date.now().toString().slice(-6)}`,
          matricle: normalizedMatricule,
          userId: user.id,
          program: enrollmentData?.program || "General",
          level: 1,
        },
      });
      studentId = student.id;
      await recordStudentCreated();
    }

    const session = await getSession();
    session.userId = user.id;
    session.email = user.email || normalizedMatricule;
    session.firstName = user.firstName || "";
    session.lastName = user.lastName || "";
    session.role = "student";
    if (studentId) session.studentId = studentId;
    await session.save();

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: {
          id: user.id,
          matricule: user.matricule,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}

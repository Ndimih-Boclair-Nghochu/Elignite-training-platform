export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { matricule, password, confirmPassword, role = "student" } = await req.json();

    // Validate required fields
    if (!matricule || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Matricule, password, and password confirmation are required" },
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

    // For student role, matricule must be verified
    let enrollmentData = null;
    let existingStudent = null;
    if (role === "student" || !role) {
      // Try to find enrollment first (for pending students)
      let enrollment = await prisma.enrollment.findUnique({
        where: { matricle: matricule },
      });

      // If no enrollment, try to find existing student record
      if (!enrollment) {
        existingStudent = await prisma.student.findFirst({
          where: {
            OR: [
              { matricle: matricule },
              { studentId: matricule }, // Support studentId format like STU678565
            ],
          },
        });

        if (!existingStudent) {
          return NextResponse.json(
            { error: "Invalid matricule number. Please verify and try again." },
            { status: 404 }
          );
        }

        // If this student already has a user account, verify the linked user still exists
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

          // Broken link exists, allow repair through registration and relink below
        }

        enrollmentData = {
          matricle: existingStudent.matricle || matricule,
          firstName: "",
          lastName: "",
          email: "",
          program: existingStudent.program,
          status: "approved",
        } as any;
      } else {
        // Verify enrollment is approved
        if (enrollment.status !== "approved") {
          return NextResponse.json(
            {
              error: `Your enrollment is ${enrollment.status}. Please contact admissions.`,
            },
            { status: 403 }
          );
        }
        enrollmentData = enrollment;
      }
    }

    // Check if user already exists with this matricule
    const existing = await prisma.user.findUnique({ where: { matricule } });
    if (existing) {
      return NextResponse.json(
        { error: "Matricule already registered" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        matricule,
        email: enrollmentData?.email || `${matricule}@school.local`,
        password: hashed,
        firstName: enrollmentData?.firstName || "",
        lastName: enrollmentData?.lastName || "",
        role,
      },
    });

    // Auto-create or link student profile if role is student
    let studentId: number | undefined;
    if (role === "student" || !role) {
      if (!existingStudent) {
        existingStudent = await prisma.student.findFirst({
          where: {
            OR: [
              { matricle: matricule },
              { studentId: matricule },
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
            matricle: matricule,
            userId: user.id,
            program: enrollmentData?.program || "General",
            level: 1,
          },
        });
        studentId = student.id;
      }
    }

    const session = await getSession();
    session.userId = user.id;
    session.email = user.email || matricule;
    session.firstName = user.firstName || "";
    session.lastName = user.lastName || "";
    session.role = user.role as "ceo" | "teacher" | "student";
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

// Helper function to get program from enrollment
async function getProgramFromEnrollment(matricle?: string): Promise<string> {
  if (!matricle) return "";

  const enrollment = await prisma.enrollment.findUnique({
    where: { matricle },
  });

  return enrollment?.program || "";
}

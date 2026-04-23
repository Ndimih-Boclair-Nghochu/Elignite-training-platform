export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { matricle, email } = await req.json();

    if (!matricle || !email) {
      return NextResponse.json(
        { error: "Matricle and email are required" },
        { status: 400 }
      );
    }

    // Find enrollment by matricle and email
    const enrollment = await prisma.enrollment.findUnique({
      where: { matricle },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Invalid matricle number" },
        { status: 404 }
      );
    }

    // Verify email matches
    if (enrollment.email !== email) {
      return NextResponse.json(
        { error: "Email does not match enrollment record" },
        { status: 400 }
      );
    }

    // Verify enrollment is approved
    if (enrollment.status !== "approved") {
      return NextResponse.json(
        { error: `Enrollment status is ${enrollment.status}. Only approved enrollments can create accounts.` },
        { status: 400 }
      );
    }

    // Verify no user already exists with this enrollment
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Account already exists for this email" },
        { status: 409 }
      );
    }

    // Return enrollment details for registration
    return NextResponse.json({
      valid: true,
      enrollment: {
        firstName: enrollment.firstName,
        lastName: enrollment.lastName,
        email: enrollment.email,
        program: enrollment.program,
        dob: enrollment.dob,
        gender: enrollment.gender,
        address: enrollment.address,
        matricle: enrollment.matricle,
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

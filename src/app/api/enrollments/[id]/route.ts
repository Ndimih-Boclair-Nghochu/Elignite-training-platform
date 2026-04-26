export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// Utility function to generate unique matricle
function generateMatricle(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
  return `MAT${year}${randomNum}`;
}

// Ensure unique matricle
async function getUniqueMatricle(): Promise<string> {
  let matricle = generateMatricle();
  let exists = await prisma.enrollment.findUnique({
    where: { matricle },
  });

  while (exists) {
    matricle = generateMatricle();
    exists = await prisma.enrollment.findUnique({
      where: { matricle },
    });
  }

  return matricle;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    
    // Only CEO can approve/reject enrollments
    if (!session.userId || session.role !== "ceo") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { status, rejectedReason } = await req.json();

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Generate matricle if approving
    let matricle = null;
    if (status === "approved") {
      matricle = await getUniqueMatricle();
    }

    const updated = await prisma.enrollment.update({
      where: { id: parseInt(params.id) },
      data: {
        status,
        matricle: status === "approved" ? matricle : null,
        approvedAt: status === "approved" ? new Date() : null,
        approvedBy: status === "approved" ? session.userId : null,
        rejectedReason: status === "rejected" ? rejectedReason : null,
      },
    });

    // If approved, create a Student record automatically
    if (status === "approved" && matricle) {
      // Check if student already exists
      const existingStudent = await prisma.student.findFirst({
        where: { matricle },
      });

      if (!existingStudent) {
        // Create a User record for the student with temporary password (not activated yet)
        // Student will set their own password upon account activation
        const { default: bcrypt } = await import("bcryptjs");
        const tempPassword = Math.random().toString(36).slice(-10); // Random temporary password
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const user = await prisma.user.create({
          data: {
            firstName: enrollment.firstName,
            lastName: enrollment.lastName,
            email: enrollment.email,
            password: hashedPassword,
            role: "student",
            phone: enrollment.phone,
            photoUrl: null,
            isActivated: false, // Account not activated yet
          },
        });

        // Create Student record
        await prisma.student.create({
          data: {
            studentId: `STU${Date.now().toString().slice(-6)}`,
            matricle,
            userId: user.id,
            program: enrollment.program,
            level: 1,
            gender: enrollment.gender,
            dateOfBirth: enrollment.dob,
            address: enrollment.address,
            parentName: enrollment.parentName,
            parentPhone: enrollment.parentPhone,
            status: "active",
          },
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Approval error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    const isAuthorized =
      (session.userId && session.role === "ceo") ||
      (token && token === enrollment.publicAccessToken);

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(enrollment);
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

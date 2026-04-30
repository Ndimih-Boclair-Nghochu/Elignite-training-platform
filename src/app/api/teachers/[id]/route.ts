export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ensureRuntimeSchema } from "@/lib/runtime-schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureRuntimeSchema();
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized - Please login first" }, { status: 401 });
    }
    if (session.role !== "ceo") {
      return NextResponse.json({ error: "Unauthorized - Only CEO can update staff" }, { status: 403 });
    }

    const body = await req.json();
    const { status, programIds, firstName, lastName, email, phone, specialization, qualifications, office } = body;
    const teacherId = parseInt(params.id);

    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId }, include: { user: true } });
    if (!teacher) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    // Update user fields (never allow changing matricule or teacherId)
    await prisma.user.update({
      where: { id: teacher.userId },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
      },
    });

    const updated = await prisma.teacher.update({
      where: { id: teacherId },
      data: {
        ...(status !== undefined && { status }),
        ...(specialization !== undefined && { specialization }),
        ...(qualifications !== undefined && { qualifications }),
        ...(office !== undefined && { office }),
        // Remove occupation, department, quotes — set to null
        occupation: null,
        department: teacher.department, // keep existing department
        quotes: null,
      },
      include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } },
    });

    // Update program assignments if provided
    if (Array.isArray(programIds)) {
      await prisma.teacherProgram.deleteMany({ where: { teacherId } });
      if (programIds.length > 0) {
        await prisma.teacherProgram.createMany({
          data: programIds.map((pid: number) => ({ teacherId, programId: pid })),
          skipDuplicates: true,
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating staff:", error);
    return NextResponse.json({ error: "Failed to update staff" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureRuntimeSchema();
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized - Please login first" }, { status: 401 });
    }
    if (session.role !== "ceo") {
      return NextResponse.json({ error: "Unauthorized - Only CEO can delete staff" }, { status: 403 });
    }

    const teacherId = parseInt(params.id);

    // Verify teacher exists
    const teacher = await prisma.teacher.findUnique({ 
      where: { id: teacherId },
      include: { user: true }
    });
    if (!teacher) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    // Delete teacher first (cascading)
    await prisma.teacher.delete({ where: { id: teacherId } });

    // Delete associated user
    await prisma.user.delete({ where: { id: teacher.userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting staff:", error);
    return NextResponse.json({ error: "Failed to delete staff" }, { status: 500 });
  }
}

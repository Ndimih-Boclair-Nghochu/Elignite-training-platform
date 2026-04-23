export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized - Please login first" }, { status: 401 });
    }
    if (session.role !== "ceo") {
      return NextResponse.json({ error: "Unauthorized - Only CEO can update staff" }, { status: 403 });
    }

    const { status } = await req.json();
    const teacherId = parseInt(params.id);

    // Verify teacher exists
    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
    if (!teacher) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    // Update status
    const updated = await prisma.teacher.update({
      where: { id: teacherId },
      data: { status },
      include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } },
    });

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

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();

  // Only CEO can approve/reject testimonies
  if (!session.userId || session.role !== "ceo") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const { status, rejectionNote } = body;

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Check if testimony exists
    const testimony = await prisma.testimony.findUnique({
      where: { id },
    });

    if (!testimony) {
      return NextResponse.json({ error: "Testimony not found" }, { status: 404 });
    }

    // Update testimony
    const updated = await prisma.testimony.update({
      where: { id },
      data: {
        status,
        approvedBy: session.userId,
        rejectionNote: status === "rejected" ? rejectionNote || "" : null,
        updatedAt: new Date(),
      },
      include: {
        user: { select: { firstName: true, lastName: true, photoUrl: true, email: true } },
        approver: { select: { firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating testimony:", error);
    return NextResponse.json({ error: "Failed to update testimony" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();

  // Only CEO can delete testimonies, or the user who created it (and it must be pending)
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = parseInt(params.id);

    const testimony = await prisma.testimony.findUnique({
      where: { id },
    });

    if (!testimony) {
      return NextResponse.json({ error: "Testimony not found" }, { status: 404 });
    }

    // Check permissions
    const isCreator = testimony.userId === session.userId;
    const isCEO = session.role === "ceo";
    const isPending = testimony.status === "pending";

    if (!isCEO && !isCreator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Users can only delete their own pending testimonies
    if (isCreator && !isPending) {
      return NextResponse.json(
        { error: "Can only delete pending testimonies" },
        { status: 403 }
      );
    }

    await prisma.testimony.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting testimony:", error);
    return NextResponse.json({ error: "Failed to delete testimony" }, { status: 500 });
  }
}

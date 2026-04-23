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

    // Only CEO can update certificates
    if (!session.userId || session.role !== "ceo") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { status, title } = await req.json();
    const certId = parseInt(params.id);

    // Verify certificate exists
    const cert = await prisma.certificate.findUnique({
      where: { id: certId },
    });

    if (!cert) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    // Update certificate
    const updated = await prisma.certificate.update({
      where: { id: certId },
      data: {
        ...(status && { status }),
        ...(title && { title }),
        ...(status === "issued" && { issuedDate: new Date() }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Certificate update error:", error);
    return NextResponse.json(
      { error: "Failed to update certificate" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    // Only CEO can delete certificates
    if (!session.userId || session.role !== "ceo") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.certificate.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Certificate deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete certificate" },
      { status: 500 }
    );
  }
}

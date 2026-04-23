export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    // Only CEO can view school settings
    if (!session.userId || session.role !== "ceo") {
      return NextResponse.json(
        { error: "Unauthorized - Only CEO can view school settings" },
        { status: 403 }
      );
    }

    let schoolSettings = await prisma.schoolSettings.findFirst();

    // Create default settings if not exist
    if (!schoolSettings) {
      schoolSettings = await prisma.schoolSettings.create({
        data: {
          schoolName: "Computer Training Institute",
          ceoFirstName: "Dr.",
          ceoLastName: "John Smith",
          ceoTitle: "Chief Executive Officer",
        },
      });
    }

    return NextResponse.json(schoolSettings);
  } catch (error) {
    console.error("Error fetching school settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch school settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();

    // Only CEO can update school settings
    if (!session.userId || session.role !== "ceo") {
      return NextResponse.json(
        { error: "Unauthorized - Only CEO can update school settings" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      schoolName,
      schoolLogoUrl,
      ceoFirstName,
      ceoLastName,
      ceoTitle,
      schoolMotto,
      schoolAddress,
      schoolPhone,
      schoolEmail,
    } = body;

    // Get or create school settings
    let schoolSettings = await prisma.schoolSettings.findFirst();

    if (!schoolSettings) {
      schoolSettings = await prisma.schoolSettings.create({
        data: {
          schoolName: schoolName || "Computer Training Institute",
          schoolLogoUrl: schoolLogoUrl || null,
          ceoFirstName: ceoFirstName || "Dr.",
          ceoLastName: ceoLastName || "John Smith",
          ceoTitle: ceoTitle || "Chief Executive Officer",
          schoolMotto: schoolMotto || null,
          schoolAddress: schoolAddress || null,
          schoolPhone: schoolPhone || null,
          schoolEmail: schoolEmail || null,
        },
      });
    } else {
      schoolSettings = await prisma.schoolSettings.update({
        where: { id: schoolSettings.id },
        data: {
          ...(schoolName !== undefined && { schoolName }),
          ...(schoolLogoUrl !== undefined && { schoolLogoUrl }),
          ...(ceoFirstName !== undefined && { ceoFirstName }),
          ...(ceoLastName !== undefined && { ceoLastName }),
          ...(ceoTitle !== undefined && { ceoTitle }),
          ...(schoolMotto !== undefined && { schoolMotto }),
          ...(schoolAddress !== undefined && { schoolAddress }),
          ...(schoolPhone !== undefined && { schoolPhone }),
          ...(schoolEmail !== undefined && { schoolEmail }),
        },
      });
    }

    return NextResponse.json(schoolSettings);
  } catch (error) {
    console.error("Error updating school settings:", error);
    return NextResponse.json(
      { error: "Failed to update school settings" },
      { status: 500 }
    );
  }
}

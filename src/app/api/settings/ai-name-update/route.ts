export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    // Verify user is CEO
    if (!session.userId || session.role !== "ceo") {
      return NextResponse.json(
        { error: "Unauthorized - Only CEO can update settings" },
        { status: 403 }
      );
    }

    const { aiName } = await req.json();

    if (!aiName || typeof aiName !== "string" || aiName.trim().length === 0) {
      return NextResponse.json(
        { error: "AI name is required and must be non-empty" },
        { status: 400 }
      );
    }

    // Find or create settings
    let settings = await prisma.schoolSettings.findFirst();

    if (!settings) {
      settings = await prisma.schoolSettings.create({
        data: {
          aiName: aiName.trim(),
        },
      });
    } else {
      settings = await prisma.schoolSettings.update({
        where: { id: settings.id },
        data: { aiName: aiName.trim() },
      });
    }

    return NextResponse.json({
      success: true,
      message: `AI name updated to "${settings.aiName}"`,
      aiName: settings.aiName,
    });
  } catch (error) {
    console.error("Error updating AI name:", error);
    return NextResponse.json(
      { error: "Failed to update AI name" },
      { status: 500 }
    );
  }
}

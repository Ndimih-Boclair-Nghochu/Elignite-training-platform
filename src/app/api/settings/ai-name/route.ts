export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.schoolSettings.findFirst();
    
    if (!settings) {
      return NextResponse.json(
        { aiName: "EduAssistant" },
        { status: 200 }
      );
    }

    return NextResponse.json({
      aiName: settings.aiName || "EduAssistant",
    });
  } catch (error) {
    console.error("Error fetching AI name:", error);
    return NextResponse.json(
      { aiName: "EduAssistant" },
      { status: 200 }
    );
  }
}

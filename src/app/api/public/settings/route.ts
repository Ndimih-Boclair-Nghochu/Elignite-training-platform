export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.schoolSettings.findFirst();
    return NextResponse.json({
      schoolName: settings?.schoolName || "ELIGNITE",
      schoolLogoUrl: settings?.schoolLogoUrl || null,
      schoolMotto: settings?.schoolMotto || null,
    });
  } catch {
    return NextResponse.json({ schoolName: "ELIGNITE", schoolLogoUrl: null, schoolMotto: null });
  }
}

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { syncPlatformCountersFromDatabase } from "@/lib/platform-metrics";

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst();

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          applicationsOpen: true,
          applicationYear: "2024/2025",
          maintenanceMode: false,
        },
      });
    }

    settings = await syncPlatformCountersFromDatabase();
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    
    // Only CEO can update settings
    if (!session.userId || session.role !== "ceo") {
      return NextResponse.json(
        { error: "Unauthorized - Only CEO can update settings" },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    const { applicationsOpen, applicationYear, maintenanceMode } = body;
    
    let settings = await prisma.settings.findFirst();

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          applicationsOpen: applicationsOpen ?? true,
          applicationYear: applicationYear ?? "2024/2025",
          maintenanceMode: maintenanceMode ?? false,
          updatedBy: session.userId,
        },
      });
    } else {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          ...(applicationsOpen !== undefined && { applicationsOpen }),
          ...(applicationYear && { applicationYear }),
          ...(maintenanceMode !== undefined && { maintenanceMode }),
          updatedBy: session.userId,
        },
      });
    }

    settings = await syncPlatformCountersFromDatabase();
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

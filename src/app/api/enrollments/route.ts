export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const enrollments = await prisma.enrollment.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(enrollments);
}

export async function POST(req: NextRequest) {
  try {
    // Check if applications are open
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
    
    if (!settings.applicationsOpen) {
      return NextResponse.json(
        { error: "Applications are currently closed. Please check back soon." },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    const enrollment = await prisma.enrollment.create({ data: body });
    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json(
      { error: "Failed to submit enrollment" },
      { status: 500 }
    );
  }
}

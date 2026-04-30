export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { randomUUID } from "crypto";
import { ensureRuntimeSchema } from "@/lib/runtime-schema";

export async function GET() {
  await ensureRuntimeSchema();
  const session = await getSession();
  if (!session.userId || session.role !== "ceo") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const enrollments = await prisma.enrollment.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(enrollments);
}

export async function POST(req: NextRequest) {
  try {
    await ensureRuntimeSchema();
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
    if (!body.firstName || !body.lastName || !body.email || !body.phone || !body.program) {
      return NextResponse.json(
        { error: "First name, last name, email, phone, and program are required." },
        { status: 400 }
      );
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        firstName: String(body.firstName || "").trim(),
        lastName: String(body.lastName || "").trim(),
        email: String(body.email || "").trim().toLowerCase(),
        phone: String(body.phone || "").trim(),
        dob: body.dob ? String(body.dob) : null,
        gender: body.gender ? String(body.gender) : null,
        program: String(body.program || "").trim(),
        address: body.address ? String(body.address).trim() : null,
        parentName: body.parentName ? String(body.parentName).trim() : null,
        parentPhone: body.parentPhone ? String(body.parentPhone).trim() : null,
        message: body.message ? String(body.message).trim() : null,
        publicAccessToken: randomUUID(),
      },
      select: {
        id: true,
        publicAccessToken: true,
      },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json(
      { error: "Failed to submit enrollment" },
      { status: 500 }
    );
  }
}

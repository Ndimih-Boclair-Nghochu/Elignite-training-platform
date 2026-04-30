export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateUniquePartnerProgramSlug, getPartnerProfileForSession } from "@/lib/partner-dashboard";

export async function GET() {
  try {
    const { profile } = await getPartnerProfileForSession();
    const programs = await prisma.partnerProgram.findMany({
      where: { ownerId: profile.id },
      include: {
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(programs);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { profile } = await getPartnerProfileForSession();
    const body = await req.json();

    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const degreeType = String(body.degreeType || "").trim();
    const duration = String(body.duration || "").trim();
    const tuitionFee = Number(body.tuitionFee);
    const currency = String(body.currency || "USD").trim() || "USD";

    if (!title || !description || !degreeType || !duration || Number.isNaN(tuitionFee)) {
      return NextResponse.json({ error: "Missing required program fields" }, { status: 400 });
    }

    const slug = await generateUniquePartnerProgramSlug(title);

    const program = await prisma.partnerProgram.create({
      data: {
        ownerId: profile.id,
        title,
        slug,
        description,
        degreeType,
        duration,
        tuitionFee,
        currency,
        intakeDates: body.intakeDates ? String(body.intakeDates).trim() : null,
        admissionRequirements: body.admissionRequirements ? String(body.admissionRequirements).trim() : null,
        requiredDocuments: body.requiredDocuments ? String(body.requiredDocuments).trim() : null,
        languageRequirements: body.languageRequirements ? String(body.languageRequirements).trim() : null,
        applicationDeadline: body.applicationDeadline ? new Date(body.applicationDeadline) : null,
        availableSeats:
          body.availableSeats !== undefined && body.availableSeats !== null && body.availableSeats !== ""
            ? Number(body.availableSeats)
            : null,
        status: "draft",
      },
    });

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create program" }, { status: 400 });
  }
}


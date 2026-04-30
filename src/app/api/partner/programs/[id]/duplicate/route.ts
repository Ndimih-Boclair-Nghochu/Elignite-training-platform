export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateUniquePartnerProgramSlug, getPartnerProfileForSession } from "@/lib/partner-dashboard";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { profile } = await getPartnerProfileForSession();
    const id = parseInt(params.id, 10);
    const existing = await prisma.partnerProgram.findFirst({
      where: { id, ownerId: profile.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    const title = `${existing.title} Copy`;
    const slug = await generateUniquePartnerProgramSlug(title);

    const duplicate = await prisma.partnerProgram.create({
      data: {
        ownerId: profile.id,
        title,
        slug,
        description: existing.description,
        degreeType: existing.degreeType,
        duration: existing.duration,
        tuitionFee: existing.tuitionFee,
        currency: existing.currency,
        intakeDates: existing.intakeDates,
        admissionRequirements: existing.admissionRequirements,
        requiredDocuments: existing.requiredDocuments,
        languageRequirements: existing.languageRequirements,
        applicationDeadline: existing.applicationDeadline,
        availableSeats: existing.availableSeats,
        status: "draft",
      },
    });

    return NextResponse.json(duplicate, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to duplicate program" }, { status: 400 });
  }
}


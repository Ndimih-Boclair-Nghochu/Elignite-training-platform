export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateUniquePartnerProgramSlug, getPartnerProfileForSession } from "@/lib/partner-dashboard";

async function getOwnedProgram(id: number, ownerId: number) {
  return prisma.partnerProgram.findFirst({
    where: { id, ownerId },
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { profile } = await getPartnerProfileForSession();
    const id = parseInt(params.id, 10);
    const existing = await getOwnedProgram(id, profile.id);

    if (!existing) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    const body = await req.json();
    const nextTitle = body.title !== undefined ? String(body.title).trim() : existing.title;
    const slug = nextTitle !== existing.title ? await generateUniquePartnerProgramSlug(nextTitle, existing.id) : existing.slug;

    const updated = await prisma.partnerProgram.update({
      where: { id: existing.id },
      data: {
        ...(body.title !== undefined && { title: nextTitle, slug }),
        ...(body.description !== undefined && { description: String(body.description).trim() }),
        ...(body.degreeType !== undefined && { degreeType: String(body.degreeType).trim() }),
        ...(body.duration !== undefined && { duration: String(body.duration).trim() }),
        ...(body.tuitionFee !== undefined && { tuitionFee: Number(body.tuitionFee) }),
        ...(body.currency !== undefined && { currency: String(body.currency).trim() || "USD" }),
        ...(body.intakeDates !== undefined && { intakeDates: body.intakeDates ? String(body.intakeDates).trim() : null }),
        ...(body.admissionRequirements !== undefined && { admissionRequirements: body.admissionRequirements ? String(body.admissionRequirements).trim() : null }),
        ...(body.requiredDocuments !== undefined && { requiredDocuments: body.requiredDocuments ? String(body.requiredDocuments).trim() : null }),
        ...(body.languageRequirements !== undefined && { languageRequirements: body.languageRequirements ? String(body.languageRequirements).trim() : null }),
        ...(body.applicationDeadline !== undefined && { applicationDeadline: body.applicationDeadline ? new Date(body.applicationDeadline) : null }),
        ...(body.availableSeats !== undefined && {
          availableSeats:
            body.availableSeats !== null && body.availableSeats !== "" ? Number(body.availableSeats) : null,
        }),
        ...(body.status !== undefined &&
          ["draft", "pending_review", "closed"].includes(String(body.status)) && {
            status: String(body.status),
          }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update program" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { profile } = await getPartnerProfileForSession();
    const id = parseInt(params.id, 10);
    const existing = await getOwnedProgram(id, profile.id);

    if (!existing) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    await prisma.partnerProgram.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete program" }, { status: 400 });
  }
}


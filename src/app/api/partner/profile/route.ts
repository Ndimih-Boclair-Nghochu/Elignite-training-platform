export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computePartnerProfileCompletion, getPartnerProfileForSession } from "@/lib/partner-dashboard";

export async function GET() {
  try {
    const { profile } = await getPartnerProfileForSession();
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 403 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { profile } = await getPartnerProfileForSession();
    const body = await req.json();

    const verificationDocuments = Array.isArray(body.verificationDocuments)
      ? body.verificationDocuments
          .filter((item: unknown) => typeof item === "string")
          .map((item: string) => item.trim())
          .filter(Boolean)
      : [];

    const nextData = {
      institutionName: String(body.institutionName || profile.institutionName).trim(),
      logoUrl: body.logoUrl ? String(body.logoUrl).trim() : null,
      country: body.country ? String(body.country).trim() : null,
      city: body.city ? String(body.city).trim() : null,
      address: body.address ? String(body.address).trim() : null,
      website: body.website ? String(body.website).trim() : null,
      contactPerson: body.contactPerson ? String(body.contactPerson).trim() : null,
      contactEmail: body.contactEmail ? String(body.contactEmail).trim().toLowerCase() : null,
      contactPhone: body.contactPhone ? String(body.contactPhone).trim() : null,
      description: body.description ? String(body.description).trim() : null,
      accreditationInfo: body.accreditationInfo ? String(body.accreditationInfo).trim() : null,
      verificationDocuments,
    };

    const profileCompletion = computePartnerProfileCompletion(nextData);

    const updated = await prisma.schoolPartnerProfile.update({
      where: { id: profile.id },
      data: {
        ...nextData,
        profileCompletion,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update profile" }, { status: 400 });
  }
}


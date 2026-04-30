export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPartnerProfileForSession } from "@/lib/partner-dashboard";

export async function GET() {
  try {
    const { profile } = await getPartnerProfileForSession();
    const applications = await prisma.partnerApplication.findMany({
      where: {
        partnerProgram: {
          ownerId: profile.id,
        },
      },
      include: {
        partnerProgram: {
          select: {
            id: true,
            title: true,
            degreeType: true,
            status: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 403 });
  }
}


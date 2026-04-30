export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPartnerProfileForSession } from "@/lib/partner-dashboard";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { profile } = await getPartnerProfileForSession();
    const id = parseInt(params.id, 10);
    const existing = await prisma.partnerApplication.findFirst({
      where: {
        id,
        partnerProgram: {
          ownerId: profile.id,
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const body = await req.json();
    const nextStatus = body.status !== undefined ? String(body.status) : existing.status;
    const allowedStatuses = ["pending", "documents_requested", "under_review", "accepted", "rejected"];

    if (!allowedStatuses.includes(nextStatus)) {
      return NextResponse.json({ error: "Invalid application status" }, { status: 400 });
    }

    const updated = await prisma.partnerApplication.update({
      where: { id: existing.id },
      data: {
        status: nextStatus,
        ...(body.requestMessage !== undefined && { requestMessage: body.requestMessage ? String(body.requestMessage).trim() : null }),
        ...(body.partnerNotes !== undefined && { partnerNotes: body.partnerNotes ? String(body.partnerNotes).trim() : null }),
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
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update application" }, { status: 400 });
  }
}


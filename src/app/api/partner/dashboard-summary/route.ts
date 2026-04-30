export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPartnerProfileForSession } from "@/lib/partner-dashboard";

export async function GET() {
  try {
    const { profile } = await getPartnerProfileForSession();

    const [programs, applications, recentApplications, recentPrograms] = await Promise.all([
      prisma.partnerProgram.findMany({
        where: { ownerId: profile.id },
        select: { id: true, status: true, title: true, updatedAt: true, createdAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.partnerApplication.findMany({
        where: { partnerProgram: { ownerId: profile.id } },
        select: { id: true, status: true },
      }),
      prisma.partnerApplication.findMany({
        where: { partnerProgram: { ownerId: profile.id } },
        include: {
          partnerProgram: {
            select: { title: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.partnerProgram.findMany({
        where: { ownerId: profile.id },
        select: { id: true, title: true, status: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
    ]);

    const summary = {
      totalPrograms: programs.length,
      activePrograms: programs.filter((item) => item.status === "approved").length,
      applications: applications.length,
      accepted: applications.filter((item) => item.status === "accepted").length,
      rejected: applications.filter((item) => item.status === "rejected").length,
      pending: applications.filter((item) => item.status === "pending" || item.status === "under_review" || item.status === "documents_requested").length,
      recentApplications,
      recentPrograms,
      verificationStatus: profile.verificationStatus,
      profileCompletion: profile.profileCompletion,
    };

    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 403 });
  }
}


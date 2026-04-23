export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const aboutUs = await prisma.aboutUs.findFirst();
  return NextResponse.json(aboutUs ?? {});
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== "ceo") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { vision, visionImageUrl, mission, missionImageUrl } = await req.json();

  if (!vision || !visionImageUrl || !mission || !missionImageUrl) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await prisma.aboutUs.findFirst();

  const aboutUs = existing
    ? await prisma.aboutUs.update({
        where: { id: existing.id },
        data: { vision, visionImageUrl, mission, missionImageUrl },
      })
    : await prisma.aboutUs.create({
        data: { vision, visionImageUrl, mission, missionImageUrl },
      });

  return NextResponse.json(aboutUs);
}

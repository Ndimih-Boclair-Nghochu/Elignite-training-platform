export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const services = await prisma.service.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(services);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== "ceo") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, category, icon, imageUrl, isActive } = await req.json();

  if (!name || !description || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const service = await prisma.service.create({
    data: { name, description, category, icon, imageUrl, isActive: isActive ?? true },
  });

  return NextResponse.json(service, { status: 201 });
}

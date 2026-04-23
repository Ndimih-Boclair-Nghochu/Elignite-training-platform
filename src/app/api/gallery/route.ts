export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const gallery = await prisma.gallery.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(gallery);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== "ceo") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, category, url } = await req.json();

  if (!title || !url) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const galleryItem = await prisma.gallery.create({
    data: {
      title,
      category: category || "General",
      url,
    },
  });

  return NextResponse.json(galleryItem, { status: 201 });
}

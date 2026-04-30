export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { slugifyProgramValue } from "@/lib/programs";

export async function GET() {
  try {
    const session = await getSession();
    const isCeo = !!session.userId && session.role === "ceo";

    const events = await prisma.event.findMany({
      where: isCeo ? undefined : { isPublished: true },
      orderBy: { eventDate: "desc" },
    });

    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.userId || session.role !== "ceo") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const title = String(body.title || "").trim();
    const excerpt = String(body.excerpt || "").trim();
    const description = String(body.description || "").trim();
    const category = String(body.category || "").trim();
    const coverImageUrl = String(body.coverImageUrl || "").trim();

    if (!title || !excerpt || !description || !category || !coverImageUrl || !body.eventDate) {
      return NextResponse.json({ error: "Missing required event fields" }, { status: 400 });
    }

    const baseSlug = slugifyProgramValue(title);
    let slug = baseSlug;
    let counter = 2;

    while (await prisma.event.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    const galleryItems = Array.isArray(body.galleryItems)
      ? body.galleryItems.filter((item: unknown) => typeof item === "string" && item.trim())
      : [];

    const event = await prisma.event.create({
      data: {
        title,
        slug,
        excerpt,
        description,
        category,
        eventDate: new Date(body.eventDate),
        location: body.location ? String(body.location).trim() : null,
        coverImageUrl,
        videoUrl: body.videoUrl ? String(body.videoUrl).trim() : null,
        galleryItems,
        isPublished: body.isPublished !== false,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

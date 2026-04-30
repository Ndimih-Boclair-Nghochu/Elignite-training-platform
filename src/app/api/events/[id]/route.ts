export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ensureRuntimeSchema } from "@/lib/runtime-schema";

const MAX_INLINE_VIDEO_LENGTH = 950000;

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await ensureRuntimeSchema();
    const session = await getSession();
    if (!session.userId || session.role !== "ceo") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const videoUrl = body.videoUrl ? String(body.videoUrl).trim() : null;

    if (videoUrl?.startsWith("data:") && videoUrl.length > MAX_INLINE_VIDEO_LENGTH) {
      return NextResponse.json(
        { error: "Inline video upload is too large. Please use a hosted video URL for large files." },
        { status: 413 }
      );
    }

    const galleryItems = Array.isArray(body.galleryItems)
      ? body.galleryItems.filter((item: unknown) => typeof item === "string" && item.trim())
      : [];

    const event = await prisma.event.update({
      where: { id: parseInt(params.id, 10) },
      data: {
        ...(body.title !== undefined && { title: String(body.title).trim() }),
        ...(body.excerpt !== undefined && { excerpt: String(body.excerpt).trim() }),
        ...(body.description !== undefined && { description: String(body.description).trim() }),
        ...(body.category !== undefined && { category: String(body.category).trim() }),
        ...(body.eventDate !== undefined && { eventDate: new Date(body.eventDate) }),
        ...(body.location !== undefined && { location: body.location ? String(body.location).trim() : null }),
        ...(body.coverImageUrl !== undefined && { coverImageUrl: String(body.coverImageUrl).trim() }),
        ...(body.videoUrl !== undefined && { videoUrl }),
        ...(body.galleryItems !== undefined && { galleryItems }),
        ...(body.isPublished !== undefined && { isPublished: Boolean(body.isPublished) }),
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Update event error:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await ensureRuntimeSchema();
    const session = await getSession();
    if (!session.userId || session.role !== "ceo") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.event.delete({
      where: { id: parseInt(params.id, 10) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}

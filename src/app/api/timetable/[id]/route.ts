export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ensureRuntimeSchema } from "@/lib/runtime-schema";

// PATCH: Update timetable entry (CEO only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureRuntimeSchema();
    const session = await getSession();

    if (!session?.userId || session.role !== "ceo") {
      return NextResponse.json(
        { error: "Unauthorized - Only CEO can update timetables" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { courseId, dayOfWeek, startTime, endTime, room, semester, year } = body;

    if (!courseId || !dayOfWeek || !startTime || !endTime || !semester || !year) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if timetable entry exists
    const existingTimetable = await prisma.timetable.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!existingTimetable) {
      return NextResponse.json(
        { error: "Timetable entry not found" },
        { status: 404 }
      );
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Check for scheduling conflicts (excluding current entry)
    const conflict = await prisma.timetable.findFirst({
      where: {
        id: { not: parseInt(params.id) },
        dayOfWeek,
        semester,
        year: parseInt(year),
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    if (conflict) {
      return NextResponse.json(
        { error: "Scheduling conflict detected" },
        { status: 409 }
      );
    }

    const timetable = await prisma.timetable.update({
      where: { id: parseInt(params.id) },
      data: {
        courseId: parseInt(courseId),
        dayOfWeek,
        startTime,
        endTime,
        room,
        semester,
        year: parseInt(year),
      },
      include: {
        course: {
          include: {
            teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
          },
        },
      },
    });

    return NextResponse.json(timetable);
  } catch (error) {
    console.error("Failed to update timetable:", error);
    return NextResponse.json(
      { error: "Failed to update timetable" },
      { status: 500 }
    );
  }
}

// DELETE: Delete timetable entry (CEO only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureRuntimeSchema();
    const session = await getSession();

    if (!session?.userId || session.role !== "ceo") {
      return NextResponse.json(
        { error: "Unauthorized - Only CEO can delete timetables" },
        { status: 403 }
      );
    }

    // Check if timetable entry exists
    const existingTimetable = await prisma.timetable.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!existingTimetable) {
      return NextResponse.json(
        { error: "Timetable entry not found" },
        { status: 404 }
      );
    }

    await prisma.timetable.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: "Timetable entry deleted successfully" });
  } catch (error) {
    console.error("Failed to delete timetable:", error);
    return NextResponse.json(
      { error: "Failed to delete timetable" },
      { status: 500 }
    );
  }
}

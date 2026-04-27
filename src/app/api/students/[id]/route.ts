export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.userId || session.role !== "ceo") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const studentId = parseInt(params.id);
  const body = await req.json();
  const { firstName, lastName, email, phone, gender, address, parentName, parentPhone, status, programIds } = body;

  const student = await prisma.student.findUnique({ where: { id: studentId }, include: { user: true } });
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  // Update user fields
  await prisma.user.update({
    where: { id: student.userId },
    data: {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
    },
  });

  // Update student fields
  await prisma.student.update({
    where: { id: studentId },
    data: {
      ...(gender !== undefined && { gender }),
      ...(address !== undefined && { address }),
      ...(parentName !== undefined && { parentName }),
      ...(parentPhone !== undefined && { parentPhone }),
      ...(status !== undefined && { status }),
    },
  });

  // Update program assignments if provided
  if (Array.isArray(programIds) && programIds.length > 0) {
    const validIds = programIds.slice(0, 2) as number[];
    const primary = await prisma.program.findUnique({ where: { id: validIds[0] } });
    if (primary) {
      await prisma.studentProgram.deleteMany({ where: { studentId } });
      await prisma.studentProgram.createMany({
        data: validIds.map((pid, i) => ({ studentId, programId: pid, isPrimary: i === 0 })),
        skipDuplicates: true,
      });
      await prisma.student.update({ where: { id: studentId }, data: { program: primary.slug } });
    }
  }

  return NextResponse.json({ success: true });
}

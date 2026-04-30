export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { addDivider, addKeyValueLines, addPdfHeader, addSectionTitle, createPdfDocument } from "@/lib/pdf";
import { ensureRuntimeSchema } from "@/lib/runtime-schema";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureRuntimeSchema();
  const session = await getSession();
  if (!session.userId || session.role !== "ceo") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const teacherId = parseInt(params.id, 10);
  const t = await prisma.teacher.findUnique({
    where: { id: teacherId },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true } },
      teacherPrograms: { include: { program: { select: { programCode: true, title: true, duration: true } } } },
    },
  });
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const school = await prisma.schoolSettings.findFirst();
  const programs = t.teacherPrograms.map((tp) => `${tp.program.programCode} - ${tp.program.title} (${tp.program.duration})`).join(", ");

  const { doc, done } = createPdfDocument(`Staff ${t.teacherId}`);
  addPdfHeader(
    doc,
    `${school?.schoolName || "Training Platform"} Staff Profile`,
    `Generated ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`
  );

  addSectionTitle(doc, "Identity");
  addKeyValueLines(doc, [
    { label: "Staff ID", value: t.teacherId },
    { label: "Matricle", value: t.matricle || "-" },
    { label: "Full Name", value: `${t.user.firstName || ""} ${t.user.lastName || ""}`.trim() || "Unnamed" },
    { label: "Email", value: t.user.email || "-" },
    { label: "Phone", value: t.user.phone || "-" },
  ]);

  addDivider(doc);
  addSectionTitle(doc, "Professional Details");
  addKeyValueLines(doc, [
    { label: "Specialization", value: t.specialization || "-" },
    { label: "Qualifications", value: t.qualifications || "-" },
    { label: "Office", value: t.office || "-" },
    { label: "Programs", value: programs || "-" },
    { label: "Status", value: t.status },
    { label: "Join Date", value: new Date(t.joinDate).toLocaleDateString("en-GB") },
  ]);

  doc.end();
  const pdf = await done;

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="staff-${t.teacherId}.pdf"`,
    },
  });
}

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

  const studentId = parseInt(params.id, 10);
  const s = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true, isActivated: true } },
      studentPrograms: { include: { program: { select: { title: true, programCode: true, duration: true } } } },
    },
  });

  if (!s) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const school = await prisma.schoolSettings.findFirst();
  const schoolName = school?.schoolName || "Training Platform";
  const programs =
    s.studentPrograms.map((sp) => `${sp.program.programCode} - ${sp.program.title} (${sp.program.duration})`).join(", ") ||
    s.program ||
    "Not assigned";

  const { doc, done } = createPdfDocument(`Student ${s.studentId}`);
  addPdfHeader(
    doc,
    `${schoolName} Student Profile`,
    `Generated ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`
  );

  addSectionTitle(doc, "Identity");
  addKeyValueLines(doc, [
    { label: "Student ID", value: s.studentId },
    { label: "Matricle", value: s.matricle || "-" },
    { label: "Full Name", value: `${s.user.firstName || ""} ${s.user.lastName || ""}`.trim() || "Unnamed" },
    { label: "Email", value: s.user.email || "-" },
    { label: "Phone", value: s.user.phone || "-" },
    { label: "Gender", value: s.gender || "-" },
    { label: "Date of Birth", value: s.dateOfBirth || "-" },
  ]);

  addDivider(doc);
  addSectionTitle(doc, "Enrollment");
  addKeyValueLines(doc, [
    { label: "Programs", value: programs },
    { label: "Status", value: s.status },
    { label: "Level", value: String(s.level) },
    { label: "Enrollment Date", value: new Date(s.enrollmentDate).toLocaleDateString("en-GB") },
    { label: "Account Activation", value: s.user.isActivated ? "Activated" : "Pending activation" },
  ]);

  addDivider(doc);
  addSectionTitle(doc, "Contact and Guardian");
  addKeyValueLines(doc, [
    { label: "Address", value: s.address || "-" },
    { label: "Parent Name", value: s.parentName || "-" },
    { label: "Parent Phone", value: s.parentPhone || "-" },
  ]);

  doc.end();
  const pdf = await done;

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="student-${s.studentId}.pdf"`,
    },
  });
}

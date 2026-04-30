export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { addDivider, addPdfHeader, addPdfStatRow, addSectionTitle, createPdfDocument, ensurePdfSpace } from "@/lib/pdf";
import { ensureRuntimeSchema } from "@/lib/runtime-schema";

export async function GET() {
  await ensureRuntimeSchema();
  const session = await getSession();
  if (!session.userId || session.role !== "ceo") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const teachers = await prisma.teacher.findMany({
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true } },
      teacherPrograms: { include: { program: { select: { programCode: true, title: true } } } },
    },
    orderBy: { id: "asc" },
  });
  const school = await prisma.schoolSettings.findFirst();

  const { doc, done } = createPdfDocument("Staff Directory");
  addPdfHeader(
    doc,
    `${school?.schoolName || "Training Platform"} Staff Directory`,
    `Generated ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`
  );

  const activeCount = teachers.filter((teacher) => teacher.status === "active").length;
  addPdfStatRow(doc, [
    { label: "Staff", value: String(teachers.length) },
    { label: "Active", value: String(activeCount) },
    { label: "Inactive", value: String(teachers.length - activeCount) },
  ]);

  addSectionTitle(doc, "Staff Listing");
  teachers.forEach((teacher, index) => {
    const programs = teacher.teacherPrograms.map((tp) => `${tp.program.programCode} - ${tp.program.title}`).join(", ");
    ensurePdfSpace(doc, 92);
    doc.roundedRect(40, doc.y, 515, 84, 10).fillAndStroke("#ffffff", "#dbeafe");
    const top = doc.y + 12;
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#0f172a").text(`${index + 1}. ${teacher.user.firstName} ${teacher.user.lastName}`, 54, top);
    doc.font("Helvetica").fontSize(9.5).fillColor("#334155")
      .text(`Staff ID: ${teacher.teacherId} | Status: ${teacher.status}`, 54, top + 16)
      .text(`Email: ${teacher.user.email || "-"} | Phone: ${teacher.user.phone || "-"}`, 54, top + 30)
      .text(`Programs: ${programs || "No programs assigned"}`, 54, top + 44, { width: 487 })
      .text(`Specialization: ${teacher.specialization || "-"}`, 54, top + 58, { width: 487 });
    doc.y = top + 84;
    doc.moveDown(0.2);
  });

  addDivider(doc);
  doc.font("Helvetica").fontSize(8).fillColor("#94a3b8").text(`Total staff members: ${teachers.length}`, 40, doc.y);
  doc.end();
  const pdf = await done;

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="staff-list-${new Date().toISOString().split("T")[0]}.pdf"`,
    },
  });
}

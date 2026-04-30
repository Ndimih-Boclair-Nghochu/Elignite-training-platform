export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { addDivider, addPdfHeader, addPdfStatRow, addSectionTitle, createPdfDocument, ensurePdfSpace, formatCurrency } from "@/lib/pdf";
import { ensureRuntimeSchema } from "@/lib/runtime-schema";

export async function GET() {
  await ensureRuntimeSchema();
  const session = await getSession();
  if (!session.userId || session.role !== "ceo") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const students = await prisma.student.findMany({
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      fees: true,
      payments: true,
      studentPrograms: { include: { program: { select: { title: true, programCode: true } } } },
    },
    orderBy: { enrollmentDate: "desc" },
  });
  const school = await prisma.schoolSettings.findFirst();

  const grandTotal = students.reduce((sum, student) => sum + student.fees.reduce((t, fee) => t + fee.amount, 0), 0);
  const grandPaid = students.reduce((sum, student) => sum + student.payments.reduce((t, payment) => t + payment.amount, 0), 0);
  const grandOutstanding = Math.max(grandTotal - grandPaid, 0);

  const { doc, done } = createPdfDocument("Finance Report");
  addPdfHeader(
    doc,
    `${school?.schoolName || "Training Platform"} Finance Report`,
    `Generated ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`
  );
  addPdfStatRow(doc, [
    { label: "Assigned", value: formatCurrency(grandTotal) },
    { label: "Collected", value: formatCurrency(grandPaid) },
    { label: "Outstanding", value: formatCurrency(grandOutstanding) },
  ]);

  addSectionTitle(doc, "Student Fee Positions");
  students.forEach((student, index) => {
    const totalFees = student.fees.reduce((sum, fee) => sum + fee.amount, 0);
    const totalPaid = student.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const due = Math.max(totalFees - totalPaid, 0);
    const programs = student.studentPrograms.map((sp) => sp.program.programCode).join(", ") || student.program;

    ensurePdfSpace(doc, 86);
    doc.roundedRect(40, doc.y, 515, 78, 10).fillAndStroke("#ffffff", "#dbeafe");
    const top = doc.y + 12;
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#0f172a").text(`${index + 1}. ${student.user.firstName} ${student.user.lastName}`, 54, top);
    doc.font("Helvetica").fontSize(9.5).fillColor("#334155")
      .text(`Student ID: ${student.studentId} | Program: ${programs}`, 54, top + 16, { width: 487 })
      .text(
        `Assigned: ${formatCurrency(totalFees)} | Paid: ${formatCurrency(totalPaid)} | Outstanding: ${formatCurrency(due)}`,
        54,
        top + 32,
        { width: 487 }
      )
      .text(
        `Status: ${due <= 0 && totalFees > 0 ? "PAID" : due > 0 ? "OUTSTANDING" : "NO FEES"} | Email: ${student.user.email || "-"}`,
        54,
        top + 48,
        { width: 487 }
      );
    doc.y = top + 78;
    doc.moveDown(0.2);
  });

  addDivider(doc);
  doc.font("Helvetica").fontSize(8).fillColor("#94a3b8").text(`Total students covered: ${students.length}`, 40, doc.y);
  doc.end();
  const pdf = await done;

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="finance-report-${new Date().toISOString().split("T")[0]}.pdf"`,
    },
  });
}

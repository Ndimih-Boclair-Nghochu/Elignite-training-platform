export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { addDivider, addKeyValueLines, addPdfHeader, addSectionTitle, createPdfDocument } from "@/lib/pdf";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session.userId || (session.role !== "student" && session.role !== "ceo")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const certificate = await prisma.certificate.findUnique({
      where: { id: parseInt(params.id, 10) },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    if (session.role === "student") {
      const student = await prisma.student.findUnique({
        where: { userId: session.userId },
      });

      if (!student || student.id !== certificate.studentId) {
        return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
      }
    }

    const school = await prisma.schoolSettings.findFirst();
    const schoolName = school?.schoolName || "Training Platform";
    const programRecord = await prisma.program.findFirst({
      where: { slug: certificate.student.program },
      select: { title: true, category: true, duration: true },
    });

    const { doc, done } = createPdfDocument(`Certificate ${certificate.certNo}`);
    addPdfHeader(
      doc,
      `${schoolName} Certificate`,
      `Certificate No: ${certificate.certNo}`
    );

    doc.moveDown(0.5);
    doc
      .font("Helvetica")
      .fontSize(13)
      .fillColor("#334155")
      .text("This certifies that", { align: "center" });
    doc.moveDown(0.5);
    doc
      .font("Helvetica-Bold")
      .fontSize(24)
      .fillColor("#0f172a")
      .text(`${certificate.student.user.firstName || ""} ${certificate.student.user.lastName || ""}`.trim(), {
        align: "center",
      });
    doc.moveDown(0.8);
    doc
      .font("Helvetica")
      .fontSize(12)
      .fillColor("#334155")
      .text(`has successfully completed ${certificate.title}.`, { align: "center" });

    addDivider(doc);
    addSectionTitle(doc, "Certificate Details");
    addKeyValueLines(doc, [
      { label: "Certificate Number", value: certificate.certNo },
      { label: "Learner ID", value: certificate.student.studentId },
      { label: "Award Title", value: certificate.title },
      { label: "Program", value: programRecord?.title || certificate.student.program || "-" },
      { label: "Category", value: programRecord?.category || "-" },
      { label: "Duration", value: programRecord?.duration || "-" },
      {
        label: "Issued Date",
        value: certificate.issuedDate
          ? new Date(certificate.issuedDate).toLocaleDateString("en-GB")
          : new Date(certificate.createdAt).toLocaleDateString("en-GB"),
      },
      { label: "Status", value: certificate.status },
    ]);

    addDivider(doc);
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#475569")
      .text(
        `${schoolName} confirms that this award was issued through the official ELIGNITE platform records.`,
        40,
        doc.y,
        { width: 515, align: "center" }
      );

    doc.end();
    const pdf = await done;

    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${certificate.certNo}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Certificate download error:", error);
    return NextResponse.json(
      { error: "Failed to generate certificate", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

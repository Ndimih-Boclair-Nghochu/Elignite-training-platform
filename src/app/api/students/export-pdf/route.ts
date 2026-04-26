export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.userId || session.role !== "ceo") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { program, search } = await req.json();

    let students = await prisma.student.findMany({
      where: {
        ...(program && program !== "all" && { program }),
      },
      include: { user: true },
      orderBy: { studentId: "asc" },
    });

    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      students = students.filter((s) =>
        `${s.user?.firstName || ""} ${s.user?.lastName || ""} ${s.user?.email || ""} ${s.studentId}`
          .toLowerCase()
          .includes(searchLower)
      );
    }

    const pdfBuffer = await generateStudentsPDF(students);
    const body = new Uint8Array(pdfBuffer);

    return new Response(body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="students-list-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function generateStudentsPDF(students: any[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4", layout: "landscape" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const headerColor = "#1e40af";
    const textColor = "#333";
    const tableHeaderBg = "#e0e7ff";

    doc.fontSize(24).fillColor(headerColor).text("Student List Report", { align: "center" });
    doc.fontSize(10).fillColor("#666").text(
      `Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
      { align: "center" }
    );
    doc.moveDown(0.5);
    doc.strokeColor(headerColor).lineWidth(2).moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
    doc.moveDown(1);

    const columnPositions = { studentId: 50, firstName: 130, lastName: 220, email: 310, phone: 450, program: 550, level: 680 };
    const columnWidths = { studentId: 75, firstName: 85, lastName: 85, email: 135, phone: 95, program: 125, level: 40 };

    const drawTableHeader = (y: number) => {
      doc.fillColor(tableHeaderBg).rect(40, y, doc.page.width - 80, 25).fill();
      doc.fillColor(textColor).fontSize(9);
      doc.text("Student ID", columnPositions.studentId, y + 6, { width: columnWidths.studentId });
      doc.text("First Name", columnPositions.firstName, y + 6, { width: columnWidths.firstName });
      doc.text("Last Name", columnPositions.lastName, y + 6, { width: columnWidths.lastName });
      doc.text("Email", columnPositions.email, y + 6, { width: columnWidths.email });
      doc.text("Phone", columnPositions.phone, y + 6, { width: columnWidths.phone });
      doc.text("Program", columnPositions.program, y + 6, { width: columnWidths.program });
      doc.text("Level", columnPositions.level, y + 6, { width: columnWidths.level });
    };

    const headerY = doc.y;
    drawTableHeader(headerY);
    doc.moveDown(1.5);

    let rowY = doc.y;
    const rowHeight = 18;
    const pageBottom = doc.page.height - 40;

    students.forEach((student, index) => {
      if (rowY + rowHeight > pageBottom) {
        doc.addPage();
        rowY = 40;
        drawTableHeader(rowY);
        doc.fontSize(8).fillColor(textColor);
        rowY += 25 + 8;
      }

      if (index % 2 === 1) {
        doc.fillColor("#f8f9fa").rect(40, rowY - 2, doc.page.width - 80, rowHeight).fill();
        doc.fillColor(textColor);
      }

      doc.fontSize(8).fillColor(textColor);
      doc.text(student.studentId, columnPositions.studentId, rowY, { width: columnWidths.studentId });
      doc.text(student.user?.firstName || "", columnPositions.firstName, rowY, { width: columnWidths.firstName });
      doc.text(student.user?.lastName || "", columnPositions.lastName, rowY, { width: columnWidths.lastName });
      doc.text(student.user?.email || "", columnPositions.email, rowY, { width: columnWidths.email });
      doc.text(student.user?.phone || "", columnPositions.phone, rowY, { width: columnWidths.phone });
      doc.text(student.program || "", columnPositions.program, rowY, { width: columnWidths.program });
      doc.text(student.level.toString(), columnPositions.level, rowY, { width: columnWidths.level });

      rowY += rowHeight;
    });

    doc.fontSize(8).fillColor("#999").text(`Total Students: ${students.length}`, 40, doc.page.height - 30, { align: "left" });
    doc.end();
  });
}

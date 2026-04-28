export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type ReportStudent = {
  studentId: string;
  program: string;
  level: number;
  status: string;
  gender: string | null;
  address: string | null;
  parentName: string | null;
  parentPhone: string | null;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    isActivated: boolean;
  };
  fees: Array<{ amount: number }>;
  payments: Array<{ amount: number }>;
  studentPrograms: Array<{
    program: {
      id: number;
      title: string;
      programCode: string;
      duration: string;
    };
  }>;
};

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.userId || session.role !== "ceo") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { program, search } = await req.json();

    const studentsRaw = await prisma.student.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            isActivated: true,
          },
        },
        fees: { select: { amount: true } },
        payments: { select: { amount: true } },
        studentPrograms: {
          include: {
            program: {
              select: {
                id: true,
                title: true,
                programCode: true,
                duration: true,
              },
            },
          },
        },
      },
      orderBy: { studentId: "asc" },
    });

    let students = studentsRaw.filter((student) => {
      if (!program || program === "all") {
        return true;
      }

      return student.studentPrograms.some((entry) => String(entry.program.id) === program);
    });

    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      students = students.filter((student) =>
        [
          student.studentId,
          student.user.firstName || "",
          student.user.lastName || "",
          student.user.email || "",
          student.program,
          student.studentPrograms.map((entry) => entry.program.title).join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchLower)
      );
    }

    const reportBuffer = await generateStudentsReport(students, {
      selectedProgram: program,
      search,
    });

    return new Response(new Uint8Array(reportBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="students-report-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function generateStudentsReport(
  students: ReportStudent[],
  filters: { selectedProgram?: string; search?: string }
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 42, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const colors = {
      primary: "#1d4ed8",
      text: "#0f172a",
      muted: "#475569",
      border: "#cbd5e1",
      surface: "#f8fafc",
      success: "#16a34a",
      warning: "#d97706",
    };

    const totalPaid = students.reduce(
      (sum, student) => sum + student.payments.reduce((paymentTotal, payment) => paymentTotal + payment.amount, 0),
      0
    );
    const totalInvoiced = students.reduce(
      (sum, student) => sum + student.fees.reduce((feeTotal, fee) => feeTotal + fee.amount, 0),
      0
    );
    const totalBalance = Math.max(totalInvoiced - totalPaid, 0);
    const activeCount = students.filter((student) => student.status === "active").length;
    const activatedCount = students.filter((student) => student.user.isActivated).length;

    doc.rect(0, 0, doc.page.width, 110).fill(colors.primary);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(22).text("ELIGNITE Student Master Report", 42, 36);
    doc.font("Helvetica").fontSize(10).text(
      `Generated ${new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}`,
      42,
      66
    );

    doc
      .fontSize(10)
      .text(
        `Filter: ${filters.selectedProgram && filters.selectedProgram !== "all" ? `Program ID ${filters.selectedProgram}` : "All programs"}${filters.search ? ` | Search: ${filters.search}` : ""}`,
        42,
        82
      );

    let y = 132;

    const summaryCards = [
      { label: "Students", value: `${students.length}` },
      { label: "Active", value: `${activeCount}` },
      { label: "Activated", value: `${activatedCount}` },
      { label: "Outstanding", value: `${totalBalance.toLocaleString()} XAF` },
    ];

    summaryCards.forEach((card, index) => {
      const x = 42 + index * 128;
      doc.roundedRect(x, y, 116, 64, 14).fillAndStroke(colors.surface, colors.border);
      doc.fillColor(colors.muted).font("Helvetica").fontSize(9).text(card.label, x + 12, y + 12);
      doc.fillColor(colors.text).font("Helvetica-Bold").fontSize(15).text(card.value, x + 12, y + 32);
    });

    y += 88;

    doc.fillColor(colors.text).font("Helvetica-Bold").fontSize(14).text("Student Records", 42, y);
    y += 24;

    if (students.length === 0) {
      doc.roundedRect(42, y, doc.page.width - 84, 72, 14).fillAndStroke(colors.surface, colors.border);
      doc.fillColor(colors.muted).font("Helvetica").fontSize(11).text("No students matched the selected filters.", 58, y + 28);
      doc.end();
      return;
    }

    students.forEach((student, index) => {
      const paidAmount = student.payments.reduce((sum, payment) => sum + payment.amount, 0);
      const invoiceAmount = student.fees.reduce((sum, fee) => sum + fee.amount, 0);
      const balance = Math.max(invoiceAmount - paidAmount, 0);
      const cardHeight = 160;

      if (y + cardHeight > doc.page.height - 48) {
        doc.addPage();
        y = 42;
      }

      doc.roundedRect(42, y, doc.page.width - 84, cardHeight, 16).fillAndStroke("#ffffff", colors.border);

      doc.fillColor(colors.primary).font("Helvetica-Bold").fontSize(12).text(
        `${index + 1}. ${student.user.firstName || ""} ${student.user.lastName || ""}`.trim() || student.studentId,
        58,
        y + 16
      );
      doc.fillColor(colors.muted).font("Helvetica").fontSize(9).text(student.studentId, 58, y + 36);

      const programLabel =
        student.studentPrograms.length > 0
          ? student.studentPrograms.map((entry) => `${entry.program.programCode} (${entry.program.title})`).join(", ")
          : student.program;
      const durationLabel =
        student.studentPrograms.length > 0
          ? student.studentPrograms.map((entry) => entry.program.duration).filter(Boolean).join(" / ")
          : "Not set";
      const statusColor = student.status === "active" ? colors.success : colors.warning;
      const activationLabel = student.user.isActivated ? "Activated" : "Pending activation";

      doc.fillColor(colors.text).font("Helvetica").fontSize(10);
      doc.text(`Programs: ${programLabel}`, 58, y + 56, { width: 320 });
      doc.text(`Duration: ${durationLabel}`, 58, y + 74, { width: 320 });
      doc.text(`Level: ${student.level} | Status: ${student.status}`, 58, y + 92, { width: 320 });

      doc.text(`Email: ${student.user.email || "Not provided"}`, 360, y + 56, { width: 170 });
      doc.text(`Phone: ${student.user.phone || "Not provided"}`, 360, y + 74, { width: 170 });
      doc.fillColor(statusColor).text(activationLabel, 360, y + 92, { width: 170 });

      doc.fillColor(colors.text);
      doc.text(`Fees billed: ${invoiceAmount.toLocaleString()} XAF`, 58, y + 118);
      doc.text(`Payments: ${paidAmount.toLocaleString()} XAF`, 240, y + 118);
      doc.text(`Balance: ${balance.toLocaleString()} XAF`, 410, y + 118);

      doc.fillColor(colors.muted).fontSize(9);
      doc.text(
        `Address: ${student.address || "Not provided"} | Parent/Guardian: ${student.parentName || "Not provided"} | Contact: ${student.parentPhone || "Not provided"}`,
        58,
        y + 138,
        { width: doc.page.width - 116 }
      );

      y += cardHeight + 14;
    });

    doc.end();
  });
}

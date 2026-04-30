export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  addDivider,
  addPdfHeader,
  addPdfStatRow,
  addSectionTitle,
  createPdfDocument,
  ensurePdfSpace,
  formatCurrency,
} from "@/lib/pdf";
import { ensureRuntimeSchema } from "@/lib/runtime-schema";

type StudentExportRow = {
  studentId: string;
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
      slug: string;
      duration: string;
    };
  }>;
};

export async function POST(req: NextRequest) {
  try {
    await ensureRuntimeSchema();
    const session = await getSession();
    if (!session.userId || session.role !== "ceo") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { program, search, reportType } = await req.json();
    const mode = reportType === "directory" ? "directory" : "full";

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
                slug: true,
                duration: true,
              },
            },
          },
        },
      },
      orderBy: { studentId: "asc" },
    });

    let students = studentsRaw.filter((student) => {
      if (!program || program === "all") return true;
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
          student.studentPrograms.map((entry) => entry.program.title).join(" "),
          student.studentPrograms.map((entry) => entry.program.slug).join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchLower)
      );
    }

    const school = await prisma.schoolSettings.findFirst();
    const pdf = await buildStudentReportPdf(
      students,
      school?.schoolName || "ELIGNITE Training Platform",
      { selectedProgram: program, search, reportType: mode }
    );

    const today = new Date().toISOString().split("T")[0];
    const filename =
      mode === "directory" ? `student-directory-${today}.pdf` : `students-report-${today}.pdf`;

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Student report export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function buildStudentReportPdf(
  students: StudentExportRow[],
  schoolName: string,
  filters: { selectedProgram?: string; search?: string; reportType: "full" | "directory" }
) {
  const { doc, done } = createPdfDocument(
    filters.reportType === "directory" ? "Student Directory Report" : "Student Master Report"
  );

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

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

  addPdfHeader(
    doc,
    `${schoolName} ${filters.reportType === "directory" ? "Student Directory" : "Student Master Report"}`,
    `Generated ${today}`
  );

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#475569")
    .text(
      `Filter: ${
        filters.selectedProgram && filters.selectedProgram !== "all"
          ? `Program ID ${filters.selectedProgram}`
          : "All programs"
      } | Search: ${filters.search?.trim() ? filters.search.trim() : "none"}`,
      40,
      doc.y,
      { width: 515 }
    );
  doc.moveDown(1);

  const statItems =
    filters.reportType === "directory"
      ? [
          { label: "Students", value: String(students.length) },
          { label: "Active", value: String(activeCount) },
          { label: "Activated", value: String(activatedCount) },
        ]
      : [
          { label: "Students", value: String(students.length) },
          { label: "Active", value: String(activeCount) },
          { label: "Activated", value: String(activatedCount) },
          { label: "Outstanding", value: formatCurrency(totalBalance) },
        ];

  addPdfStatRow(doc, statItems);

  students.forEach((student, index) => {
    const programLabel =
      student.studentPrograms.length > 0
        ? student.studentPrograms
            .map((entry) => entry.program.title)
            .join(", ")
        : "Not assigned";
    const durationLabel =
      student.studentPrograms.length > 0
        ? student.studentPrograms.map((entry) => entry.program.duration).join(" / ")
        : "Not set";

    ensurePdfSpace(doc, filters.reportType === "directory" ? 120 : 180);
    doc.roundedRect(40, doc.y, 515, filters.reportType === "directory" ? 112 : 165, 12).fillAndStroke("#ffffff", "#dbeafe");
    const blockTop = doc.y + 14;

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("#0f172a")
      .text(`${index + 1}. ${student.user.firstName || ""} ${student.user.lastName || ""}`.trim() || "Unnamed", 54, blockTop, {
        width: 340,
      });
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#64748b")
      .text(student.studentId, 54, blockTop + 18);

    let y = blockTop + 38;
    const leftRows = [
      `Email: ${student.user.email || "No email"}`,
      `Phone: ${student.user.phone || "No phone"}`,
      `Programs: ${programLabel}`,
      `Duration: ${durationLabel}`,
      `Level ${student.level} | Status: ${student.status} | ${student.user.isActivated ? "Activated" : "Pending activation"}`,
      `Gender: ${student.gender || "Not set"}`,
      `Address: ${student.address || "No address"}`,
    ];

    leftRows.forEach((line) => {
      doc.font("Helvetica").fontSize(9.5).fillColor("#334155").text(line, 54, y, { width: 487 });
      y += 14;
    });

    if (filters.reportType === "full") {
      const paidAmount = student.payments.reduce((sum, payment) => sum + payment.amount, 0);
      const invoiceAmount = student.fees.reduce((sum, fee) => sum + fee.amount, 0);
      const balance = Math.max(invoiceAmount - paidAmount, 0);

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#1e3a8a")
        .text("Finance Snapshot", 54, y + 4);
      doc
        .font("Helvetica")
        .fontSize(9.5)
        .fillColor("#334155")
        .text(
          `Assigned: ${formatCurrency(invoiceAmount)} | Paid: ${formatCurrency(paidAmount)} | Outstanding: ${formatCurrency(balance)}`,
          54,
          y + 20,
          { width: 487 }
        );
      y += 48;

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#1e3a8a")
        .text("Guardian Details", 54, y);
      doc
        .font("Helvetica")
        .fontSize(9.5)
        .fillColor("#334155")
        .text(
          `Name: ${student.parentName || "No guardian"} | Phone: ${student.parentPhone || "No guardian phone"}`,
          54,
          y + 16,
          { width: 487 }
        );
    }

    doc.y = blockTop + (filters.reportType === "directory" ? 112 : 165);
    doc.moveDown(0.3);
  });

  if (filters.reportType === "full") {
    addSectionTitle(doc, "Financial Totals");
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#334155")
      .text(
        `Total invoiced: ${formatCurrency(totalInvoiced)} | Total paid: ${formatCurrency(totalPaid)} | Outstanding: ${formatCurrency(totalBalance)}`,
        40,
        doc.y,
        { width: 515 }
      );
  }

  addDivider(doc);
  doc.font("Helvetica").fontSize(8).fillColor("#94a3b8").text(`Generated by ${schoolName}`, 40, doc.y);
  doc.end();
  return done;
}

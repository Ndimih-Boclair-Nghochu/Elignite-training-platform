export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

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
          student.studentPrograms.map((entry) => entry.program.title).join(" "),
          student.studentPrograms.map((entry) => entry.program.programCode).join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchLower)
      );
    }

    const school = await prisma.schoolSettings.findFirst();
    const html = renderReportHtml(students, school?.schoolName || "ELIGNITE Training Platform", {
      selectedProgram: program,
      search,
    });

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="students-report-${new Date().toISOString().split("T")[0]}.html"`,
      },
    });
  } catch (error) {
    console.error("Student report export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function renderReportHtml(
  students: StudentExportRow[],
  schoolName: string,
  filters: { selectedProgram?: string; search?: string }
) {
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

  const rows = students
    .map((student, index) => {
      const paidAmount = student.payments.reduce((sum, payment) => sum + payment.amount, 0);
      const invoiceAmount = student.fees.reduce((sum, fee) => sum + fee.amount, 0);
      const balance = Math.max(invoiceAmount - paidAmount, 0);
      const programLabel =
        student.studentPrograms.length > 0
          ? student.studentPrograms
              .map((entry) => `${escapeHtml(entry.program.programCode)} - ${escapeHtml(entry.program.title)}`)
              .join("<br />")
          : "Not assigned";
      const durationLabel =
        student.studentPrograms.length > 0
          ? student.studentPrograms.map((entry) => escapeHtml(entry.program.duration)).join(" / ")
          : "Not set";

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(student.studentId)}</td>
          <td>
            <strong>${escapeHtml(`${student.user.firstName || ""} ${student.user.lastName || ""}`.trim() || "Unnamed")}</strong><br />
            <span class="muted">${escapeHtml(student.user.email || "No email")}</span><br />
            <span class="muted">${escapeHtml(student.user.phone || "No phone")}</span>
          </td>
          <td>${programLabel}</td>
          <td>${durationLabel}</td>
          <td>Level ${student.level}<br /><span class="muted">${escapeHtml(student.status)}</span></td>
          <td>${student.user.isActivated ? "Activated" : "Pending activation"}</td>
          <td>${invoiceAmount.toLocaleString()} XAF<br /><span class="muted">Paid ${paidAmount.toLocaleString()} XAF</span><br /><strong>${balance.toLocaleString()} XAF due</strong></td>
          <td>
            ${escapeHtml(student.address || "No address")}<br />
            <span class="muted">${escapeHtml(student.parentName || "No guardian")} | ${escapeHtml(student.parentPhone || "No guardian phone")}</span>
          </td>
        </tr>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Student Master Report</title>
    <style>
      body { font-family: Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 32px; }
      .sheet { max-width: 1400px; margin: 0 auto; background: #ffffff; border: 1px solid #dbeafe; border-radius: 20px; padding: 28px; box-shadow: 0 24px 80px -48px rgba(37,99,235,0.35); }
      .hero { background: linear-gradient(135deg, #1d4ed8, #2563eb); color: white; border-radius: 18px; padding: 24px 28px; }
      .hero h1 { margin: 0; font-size: 28px; }
      .hero p { margin: 8px 0 0; color: rgba(255,255,255,0.86); }
      .stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin: 24px 0; }
      .stat { border: 1px solid #dbeafe; background: #eff6ff; border-radius: 16px; padding: 18px; }
      .stat .label { color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
      .stat .value { margin-top: 10px; font-size: 24px; font-weight: 700; color: #0f172a; }
      .meta { display: flex; justify-content: space-between; gap: 12px; margin-top: 20px; color: #475569; font-size: 13px; }
      table { width: 100%; border-collapse: collapse; margin-top: 18px; font-size: 13px; }
      th { background: #dbeafe; color: #1e3a8a; text-align: left; padding: 12px; border-bottom: 1px solid #bfdbfe; }
      td { padding: 12px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
      tr:nth-child(even) td { background: #f8fafc; }
      .muted { color: #64748b; font-size: 12px; }
      @media print { body { background: white; padding: 0; } .sheet { box-shadow: none; border: none; padding: 0; } }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="hero">
        <h1>${escapeHtml(schoolName)} Student Master Report</h1>
        <p>Generated ${escapeHtml(
          new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
        )}</p>
      </div>
      <div class="meta">
        <div>Filter: ${escapeHtml(filters.selectedProgram && filters.selectedProgram !== "all" ? `Program ID ${filters.selectedProgram}` : "All programs")}</div>
        <div>${escapeHtml(filters.search ? `Search: ${filters.search}` : "Search: none")}</div>
      </div>
      <div class="stats">
        <div class="stat"><div class="label">Students</div><div class="value">${students.length}</div></div>
        <div class="stat"><div class="label">Active</div><div class="value">${activeCount}</div></div>
        <div class="stat"><div class="label">Activated</div><div class="value">${activatedCount}</div></div>
        <div class="stat"><div class="label">Outstanding</div><div class="value">${totalBalance.toLocaleString()} XAF</div></div>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Student ID</th>
            <th>Learner</th>
            <th>Programs</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Account</th>
            <th>Finance</th>
            <th>Guardian / Address</th>
          </tr>
        </thead>
        <tbody>
          ${rows || `<tr><td colspan="9" style="text-align:center;padding:24px;color:#64748b;">No students matched the selected filters.</td></tr>`}
        </tbody>
      </table>
      <p class="muted" style="margin-top:18px;">Total invoiced: ${totalInvoiced.toLocaleString()} XAF | Total paid: ${totalPaid.toLocaleString()} XAF</p>
    </div>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
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

  const rows = students.map((s) => {
    const totalFees = s.fees.reduce((sum, f) => sum + f.amount, 0);
    const totalPaid = s.payments.reduce((sum, p) => sum + p.amount, 0);
    const due = Math.max(totalFees - totalPaid, 0);
    const programs = s.studentPrograms.map((sp) => sp.program.programCode).join(", ") || s.program;
    return `<tr>
      <td>${s.studentId}</td>
      <td>${s.user.firstName} ${s.user.lastName}</td>
      <td>${programs}</td>
      <td>₣${totalFees.toLocaleString()}</td>
      <td style="color:#16a34a">₣${totalPaid.toLocaleString()}</td>
      <td style="color:${due > 0 ? "#dc2626" : "#16a34a"}">₣${due.toLocaleString()}</td>
      <td style="color:${due <= 0 && totalFees > 0 ? "#16a34a" : due > 0 ? "#dc2626" : "#6b7280"}">${due <= 0 && totalFees > 0 ? "PAID" : due > 0 ? "OUTSTANDING" : "NO FEES"}</td>
    </tr>`;
  }).join("");

  const grandTotal = students.reduce((s, st) => s + st.fees.reduce((t, f) => t + f.amount, 0), 0);
  const grandPaid = students.reduce((s, st) => s + st.payments.reduce((t, p) => t + p.amount, 0), 0);

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Finance Report</title>
<style>body{font-family:Arial,sans-serif;padding:30px}h1,h2{color:#1e3a8a}
table{width:100%;border-collapse:collapse;font-size:12px;margin-top:16px}
th{background:#1e3a8a;color:white;padding:7px 8px;text-align:left}
td{padding:6px 8px;border-bottom:1px solid #e5e7eb}tr:nth-child(even){background:#f9fafb}
.header{text-align:center;margin-bottom:24px}.summary{display:flex;gap:24px;margin:20px 0}
.stat{background:#f0f9ff;padding:14px 20px;border-radius:8px;text-align:center}
</style></head><body>
<div class="header"><h2 style="color:#1e3a8a;margin:0">${school?.schoolName || "Training Platform"}</h2>
<p style="color:#666">Finance Report — ${new Date().toLocaleDateString()}</p></div>
<div class="summary">
  <div class="stat"><p style="margin:0;color:#666;font-size:12px">Total Assigned</p><p style="margin:0;font-size:20px;font-weight:bold;color:#1e3a8a">₣${grandTotal.toLocaleString()}</p></div>
  <div class="stat"><p style="margin:0;color:#666;font-size:12px">Total Collected</p><p style="margin:0;font-size:20px;font-weight:bold;color:#16a34a">₣${grandPaid.toLocaleString()}</p></div>
  <div class="stat"><p style="margin:0;color:#666;font-size:12px">Outstanding</p><p style="margin:0;font-size:20px;font-weight:bold;color:#dc2626">₣${Math.max(grandTotal - grandPaid, 0).toLocaleString()}</p></div>
</div>
<table><thead><tr><th>Student ID</th><th>Name</th><th>Programs</th><th>Total Fees</th><th>Paid</th><th>Outstanding</th><th>Status</th></tr></thead>
<tbody>${rows}</tbody></table>
<p style="margin-top:24px;font-size:11px;color:#999">Total: ${students.length} students</p>
</body></html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html;charset=utf-8",
      "Content-Disposition": `attachment; filename="finance-report-${new Date().toISOString().split("T")[0]}.html"`,
    },
  });
}

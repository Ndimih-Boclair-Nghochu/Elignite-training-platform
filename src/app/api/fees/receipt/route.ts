export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.userId || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const student = await prisma.student.findUnique({
    where: { userId: session.userId },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      fees: { orderBy: { createdAt: "asc" } },
      payments: { orderBy: { paidAt: "asc" } },
      studentPrograms: { include: { program: { select: { title: true, tuition: true } } } },
    },
  });
  if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const school = await prisma.schoolSettings.findFirst();
  const totalFees = student.fees.reduce((s, f) => s + f.amount, 0);
  const totalPaid = student.payments.reduce((s, p) => s + p.amount, 0);
  const outstanding = Math.max(totalFees - totalPaid, 0);

  const feeRows = student.fees.map((f) => `
    <tr>
      <td>${f.receiptNo || "—"}</td>
      <td>${f.description}</td>
      <td>₣${f.amount.toLocaleString()}</td>
      <td>${new Date(f.dueDate).toLocaleDateString()}</td>
      <td>${f.paidDate ? new Date(f.paidDate).toLocaleDateString() : "—"}</td>
      <td style="color:${f.status === "paid" ? "#16a34a" : f.status === "overdue" ? "#dc2626" : "#d97706"}">${f.status.toUpperCase()}</td>
    </tr>`).join("");

  const paymentRows = student.payments.map((p) => `
    <tr>
      <td>${new Date(p.paidAt).toLocaleDateString()}</td>
      <td>₣${p.amount.toLocaleString()}</td>
      <td style="color:#16a34a">RECORDED</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Fee Receipt</title>
<style>body{font-family:Arial,sans-serif;padding:40px;color:#333}h1,h2{color:#1e3a8a}
table{width:100%;border-collapse:collapse;margin:16px 0;font-size:13px}
th{background:#1e3a8a;color:white;padding:8px;text-align:left}
td{padding:6px 8px;border-bottom:1px solid #e5e7eb}
.header{text-align:center;margin-bottom:30px}.totals{background:#f0f9ff;padding:16px;border-radius:8px;margin:20px 0}
.row{display:flex;justify-content:space-between;margin-bottom:6px}
</style></head><body>
<div class="header">
  <div style="font-size:44px">🎓</div>
  <h2 style="margin:8px 0">${school?.schoolName || "Training Platform"}</h2>
  <p style="color:#666">Official Fee Statement & Receipt</p>
  <p style="color:#666;font-size:13px">Generated: ${new Date().toLocaleDateString()}</p>
</div>
<h1>Student: ${student.user.firstName} ${student.user.lastName}</h1>
<p><strong>Student ID:</strong> ${student.studentId} &nbsp;|&nbsp;
   <strong>Programs:</strong> ${student.studentPrograms.map((sp) => sp.program.title).join(", ") || student.program}</p>

<h2>Fee Schedule</h2>
<table><thead><tr><th>Receipt No</th><th>Description</th><th>Amount</th><th>Due Date</th><th>Paid Date</th><th>Status</th></tr></thead>
<tbody>${feeRows || "<tr><td colspan='6' style='text-align:center'>No fee records</td></tr>"}</tbody></table>

<h2>Payment History</h2>
<table><thead><tr><th>Date</th><th>Amount Paid</th><th>Status</th></tr></thead>
<tbody>${paymentRows || "<tr><td colspan='3' style='text-align:center'>No payments recorded</td></tr>"}</tbody></table>

<div class="totals">
  <div class="row"><span><strong>Total Fees Assigned:</strong></span><span>₣${totalFees.toLocaleString()}</span></div>
  <div class="row"><span><strong>Total Paid:</strong></span><span style="color:#16a34a">₣${totalPaid.toLocaleString()}</span></div>
  <div class="row"><span><strong>Outstanding Balance:</strong></span><span style="color:${outstanding > 0 ? "#dc2626" : "#16a34a"}">₣${outstanding.toLocaleString()}</span></div>
</div>
<p style="font-size:11px;color:#999;margin-top:40px">This is an official document from ${school?.schoolName || "Training Platform"}. For queries contact the accounts office.</p>
</body></html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html;charset=utf-8",
      "Content-Disposition": `attachment; filename="receipt-${student.studentId}-${new Date().toISOString().split("T")[0]}.html"`,
    },
  });
}

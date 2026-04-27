export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
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

  const rows = teachers.map((t) => {
    const programs = t.teacherPrograms.map((tp) => `${tp.program.programCode} — ${tp.program.title}`).join(", ");
    return `<tr>
      <td>${t.teacherId}</td>
      <td>${t.user.firstName} ${t.user.lastName}</td>
      <td>${t.user.email || "—"}</td>
      <td>${t.user.phone || "—"}</td>
      <td>${programs || "—"}</td>
      <td>${t.status}</td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Staff List</title>
<style>body{font-family:Arial,sans-serif;padding:30px}h1{color:#1e3a8a}
table{width:100%;border-collapse:collapse;font-size:13px}
th{background:#1e3a8a;color:white;padding:8px;text-align:left}
td{padding:7px 8px;border-bottom:1px solid #e5e7eb}
tr:nth-child(even){background:#f9fafb}
.header{text-align:center;margin-bottom:24px}
</style></head><body>
<div class="header"><h2 style="color:#1e3a8a;margin:0">${school?.schoolName || "Training Platform"}</h2>
<p style="color:#666;margin:4px 0">Staff Directory — Generated ${new Date().toLocaleDateString()}</p></div>
<table><thead><tr><th>Staff ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Programs</th><th>Status</th></tr></thead>
<tbody>${rows}</tbody></table>
<p style="margin-top:30px;font-size:11px;color:#999">Total: ${teachers.length} staff members</p>
</body></html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html;charset=utf-8",
      "Content-Disposition": `attachment; filename="staff-list-${new Date().toISOString().split("T")[0]}.html"`,
    },
  });
}

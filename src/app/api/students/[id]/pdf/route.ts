export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.userId || session.role !== "ceo") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const studentId = parseInt(params.id);
  const s = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true } },
      studentPrograms: { include: { program: { select: { title: true, programCode: true, duration: true } } } },
    },
  });
  if (!s) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const school = await prisma.schoolSettings.findFirst();
  const schoolName = school?.schoolName || "Training Platform";
  const programs = s.studentPrograms.map((sp) => `${sp.program.programCode} — ${sp.program.title} (${sp.program.duration})`).join(", ");

  const logoHtml = school?.schoolLogoUrl
    ? `<img src="${school.schoolLogoUrl}" alt="Logo" style="height:60px;width:auto;object-fit:contain;" />`
    : `<div style="font-size:48px">🎓</div>`;

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Student Profile</title>
<style>body{font-family:Arial,sans-serif;padding:40px;color:#333}h1{color:#1e3a8a;border-bottom:3px solid #1e3a8a;padding-bottom:10px}
.row{display:flex;gap:20px;margin-bottom:8px}.label{font-weight:bold;min-width:160px;color:#555}.value{color:#222}
.header{text-align:center;margin-bottom:30px}.school{font-size:22px;font-weight:bold;color:#1e3a8a}
</style></head><body>
<div class="header">${logoHtml}<div class="school">${schoolName}</div>
<p style="color:#666;margin:4px 0">Student Profile Document</p></div>
<h1>Student Information</h1>
${[
  ["Student ID", s.studentId],
  ["Matricle", s.matricle || "—"],
  ["Full Name", `${s.user.firstName} ${s.user.lastName}`],
  ["Email", s.user.email || "—"],
  ["Phone", s.user.phone || "—"],
  ["Gender", s.gender || "—"],
  ["Date of Birth", s.dateOfBirth || "—"],
  ["Address", s.address || "—"],
  ["Programs", programs || s.program || "—"],
  ["Status", s.status],
  ["Enrollment Date", new Date(s.enrollmentDate).toLocaleDateString()],
  ["Parent Name", s.parentName || "—"],
  ["Parent Phone", s.parentPhone || "—"],
].map(([l, v]) => `<div class="row"><span class="label">${l}:</span><span class="value">${v}</span></div>`).join("")}
<p style="margin-top:40px;font-size:12px;color:#999">Generated on ${new Date().toLocaleDateString()} · ${schoolName}</p>
</body></html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html;charset=utf-8",
      "Content-Disposition": `attachment; filename="student-${s.studentId}.html"`,
    },
  });
}

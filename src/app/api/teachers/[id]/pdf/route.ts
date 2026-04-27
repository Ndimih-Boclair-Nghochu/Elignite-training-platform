export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.userId || session.role !== "ceo") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const teacherId = parseInt(params.id);
  const t = await prisma.teacher.findUnique({
    where: { id: teacherId },
    include: {
      user: { select: { firstName: true, lastName: true, email: true, phone: true } },
      teacherPrograms: { include: { program: { select: { programCode: true, title: true, duration: true } } } },
    },
  });
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const school = await prisma.schoolSettings.findFirst();
  const programs = t.teacherPrograms.map((tp) => `${tp.program.programCode} — ${tp.program.title} (${tp.program.duration})`).join(", ");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Staff Profile</title>
<style>body{font-family:Arial,sans-serif;padding:40px;color:#333}h1{color:#1e3a8a;border-bottom:3px solid #1e3a8a;padding-bottom:10px}
.row{display:flex;gap:20px;margin-bottom:8px}.label{font-weight:bold;min-width:160px;color:#555}.value{color:#222}
.header{text-align:center;margin-bottom:30px}.school{font-size:22px;font-weight:bold;color:#1e3a8a}
</style></head><body>
<div class="header"><div style="font-size:48px">👨‍🏫</div><div class="school">${school?.schoolName || "Training Platform"}</div>
<p style="color:#666;margin:4px 0">Staff Profile Document</p></div>
<h1>Staff Information</h1>
${[
  ["Staff ID", t.teacherId],
  ["Matricle", t.matricle || "—"],
  ["Full Name", `${t.user.firstName} ${t.user.lastName}`],
  ["Email", t.user.email || "—"],
  ["Phone", t.user.phone || "—"],
  ["Specialization", t.specialization || "—"],
  ["Qualifications", t.qualifications || "—"],
  ["Office", t.office || "—"],
  ["Programs", programs || "—"],
  ["Status", t.status],
  ["Join Date", new Date(t.joinDate).toLocaleDateString()],
].map(([l, v]) => `<div class="row"><span class="label">${l}:</span><span class="value">${v}</span></div>`).join("")}
<p style="margin-top:40px;font-size:12px;color:#999">Generated on ${new Date().toLocaleDateString()} · ${school?.schoolName || "Training Platform"}</p>
</body></html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html;charset=utf-8",
      "Content-Disposition": `attachment; filename="staff-${t.teacherId}.html"`,
    },
  });
}

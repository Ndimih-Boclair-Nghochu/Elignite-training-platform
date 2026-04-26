export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session.userId || (session.role !== "student" && session.role !== "ceo")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const certificate = await prisma.certificate.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        }
      },
    });

    // Fetch teacher from the student's program
    const programRecord = certificate ? await prisma.program.findFirst({
      where: { slug: certificate.student.program },
      include: {
        teacher: {
          include: { user: { select: { firstName: true, lastName: true } } }
        }
      }
    }) : null;

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    if (session.role === "student") {
      const student = await prisma.student.findUnique({
        where: { userId: session.userId },
      });

      if (!student || student.id !== certificate.studentId) {
        return NextResponse.json(
          { error: "Certificate not found" },
          { status: 404 }
        );
      }
    }

    // Fetch school settings
    let schoolSettings = await prisma.schoolSettings.findFirst();
    if (!schoolSettings) {
      // Create default settings if not exist
      schoolSettings = await prisma.schoolSettings.create({
        data: {
          schoolName: "Computer Training Institute",
          ceoFirstName: "Dr.",
          ceoLastName: "John Smith",
          ceoTitle: "Chief Executive Officer",
        },
      });
    }

    const studentName = `${certificate.student.user.firstName} ${certificate.student.user.lastName}`;
    const programName = certificate.student.program || "Program";
    const ceoName = `${schoolSettings.ceoFirstName} ${schoolSettings.ceoLastName}`;
    const teacherName = programRecord?.teacher
      ? `${programRecord.teacher.user.firstName} ${programRecord.teacher.user.lastName}`
      : null;
    const teacherTitle = programRecord?.teacher?.occupation || "Program Instructor";
    const issueDate = certificate.issuedDate 
      ? new Date(certificate.issuedDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : "Not yet issued";

    // Generate professional HTML certificate for download
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${certificate.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Georgia', 'Times New Roman', serif; 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      min-height: 100vh; 
      background: #f0f0f0;
      padding: 20px;
    }
    .certificate-container {
      background: linear-gradient(to bottom, #ffffff 0%, #fafaf9 100%);
      width: 100%;
      max-width: 1000px;
      aspect-ratio: 16 / 12;
      border: 12px solid #1e3a8a;
      border-radius: 15px;
      box-shadow: 0 20px 80px rgba(0, 0, 0, 0.25);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 70px 90px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .certificate-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        radial-gradient(circle at 20% 50%, rgba(30, 58, 138, 0.02) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(30, 58, 138, 0.02) 0%, transparent 50%);
      pointer-events: none;
    }
    
    .certificate-content {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
    }

    .header {
      margin-bottom: 20px;
    }

    .school-logo {
      font-size: 56px;
      margin-bottom: 12px;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .school-logo img {
      max-width: 100px;
      max-height: 70px;
      object-fit: contain;
    }

    .school-name {
      font-size: 32px;
      color: #1e3a8a;
      font-weight: bold;
      letter-spacing: 1.5px;
      margin-bottom: 8px;
    }

    .school-motto {
      font-size: 14px;
      color: #666;
      font-style: italic;
      margin-bottom: 15px;
    }

    .divider {
      width: 220px;
      height: 3px;
      background: linear-gradient(90deg, transparent, #1e3a8a, transparent);
      margin: 15px auto;
    }

    .certificate-title {
      font-size: 48px;
      color: #1e3a8a;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 4px;
      margin: 25px 0;
      font-family: 'Georgia', serif;
    }

    .presentation-text {
      font-size: 18px;
      color: #555;
      margin: 15px 0;
      font-style: italic;
    }

    .student-name {
      font-size: 36px;
      color: #1e3a8a;
      font-weight: 700;
      margin: 25px 0;
      text-decoration: underline;
      text-decoration-thickness: 3px;
      text-underline-offset: 12px;
    }

    .program-info {
      font-size: 16px;
      color: #555;
      margin: 15px 0;
      font-style: italic;
    }

    .achievement-text {
      font-size: 15px;
      color: #555;
      line-height: 1.7;
      margin: 18px 0;
      max-width: 750px;
      margin-left: auto;
      margin-right: auto;
    }

    .certificate-details {
      font-size: 13px;
      color: #666;
      margin: 15px 0;
      line-height: 1.7;
    }

    .signature-section {
      display: flex;
      justify-content: center;
      margin-top: 35px;
      align-items: flex-end;
      gap: 100px;
    }

    .sig-block {
      text-align: center;
      min-width: 180px;
    }

    .signature-line {
      width: 160px;
      border-top: 2px solid #333;
      margin: 25px auto 10px;
    }

    .sig-name {
      font-weight: 600;
      font-size: 14px;
      color: #333;
    }

    .sig-title {
      font-size: 12px;
      color: #666;
      font-style: italic;
    }

    .footer-info {
      font-size: 11px;
      color: #999;
      margin-top: 15px;
      display: flex;
      justify-content: space-between;
    }

    .cert-number {
      font-size: 11px;
      color: #999;
    }

    .issue-date {
      font-size: 11px;
      color: #999;
    }

    @media print {
      body { background: white; }
      .certificate-container { 
        box-shadow: none; 
        border-width: 2px;
        max-width: 100%;
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <div class="certificate-container">
    <div class="certificate-content">
      <div class="header">
        <div class="school-logo">${schoolSettings.schoolLogoUrl ? `<img src="${schoolSettings.schoolLogoUrl}" alt="School Logo" />` : '🎓'}</div>
        <div class="school-name">${schoolSettings.schoolName}</div>
        ${schoolSettings.schoolMotto ? `<div class="school-motto">"${schoolSettings.schoolMotto}"</div>` : ''}
      </div>

      <div class="divider"></div>

      <div>
        <div class="certificate-title">${certificate.title}</div>

        <div class="presentation-text">This Certificate is Proudly Presented to</div>

        <div class="student-name">${studentName}</div>

        <div class="program-info">For Program: <strong>${programName}</strong></div>

        <div class="achievement-text">
          In recognition of outstanding dedication, hard work, and successful completion of all requirements for this program. This certificate acknowledges the achievement and commitment demonstrated throughout the course of study.
        </div>
      </div>

      <div>
        <div class="certificate-details">
          <p>Certificate No: <strong>${certificate.certNo}</strong></p>
          <p>Status: <strong>${certificate.status === "issued" ? "Officially Issued" : "Pending"}</strong></p>
          <p>Date of Issue: <strong>${issueDate}</strong></p>
        </div>

        <div class="signature-section">
          ${teacherName ? `
          <div class="sig-block">
            <div class="signature-line"></div>
            <div class="sig-name">${teacherName}</div>
            <div class="sig-title">${teacherTitle}</div>
          </div>` : ""}
          <div class="sig-block">
            <div class="signature-line"></div>
            <div class="sig-name">${ceoName}</div>
            <div class="sig-title">${schoolSettings.ceoTitle}</div>
          </div>
        </div>
      </div>

      <div class="footer-info">
        <div class="issue-date">Issued: ${certificate.issuedDate ? new Date(certificate.issuedDate).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }) : "Pending"}</div>
        <div class="cert-number">${certificate.certNo}</div>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });

    return new Response(blob, {
      status: 200,
      headers: {
        "Content-Type": "text/html;charset=utf-8",
        "Content-Disposition": `attachment; filename="${certificate.certNo}.html"`,
      },
    });
  } catch (error) {
    console.error("Certificate download error:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    }
    return NextResponse.json(
      { error: "Failed to generate certificate", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

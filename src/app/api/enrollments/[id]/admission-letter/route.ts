export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";
import { getSession } from "@/lib/session";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const enrollmentId = parseInt(params.id);
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (isNaN(enrollmentId)) {
      return NextResponse.json({ error: "Invalid enrollment ID" }, { status: 400 });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        user: true, // CEO who approved
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    if (enrollment.status !== "approved" || !enrollment.matricle) {
      return NextResponse.json(
        { error: "Only approved enrollments can download admission letters" },
        { status: 403 }
      );
    }

    const isAuthorized =
      (session.userId && session.role === "ceo") ||
      (token && token === enrollment.publicAccessToken);

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the program and its teacher
    const program = await prisma.program.findFirst({
      where: { title: enrollment.program },
      include: {
        teachers: {
          include: { teacher: { include: { user: true } } },
          take: 1,
        },
      },
    });

    // Create PDF document
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    // Set response headers for PDF download
    const buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {});

    // Header with Logo and Institution Name
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .fillColor("#1e3a8a")
      .text("🎓", { align: "center" })
      .moveDown(0.2);

    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fillColor("#1e3a8a")
      .text("EduManage Computer Training Center", { align: "center" })
      .moveDown(0.3);

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#666")
      .text("Excellence in Education • Innovation in Technology", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#333")
      .text("Buea, Cameroon", { align: "center" })
      .text("Email: info@edumanage.cm | Phone: +237 677 000 000 | Website: www.edumanage.cm", { align: "center" })
      .moveDown(1);

    // Decorative line
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke("#1e3a8a")
      .moveDown(1);

    // Date
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#333")
      .text(currentDate, { align: "right" })
      .moveDown(1);

    // Student address
    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`${enrollment.firstName} ${enrollment.lastName}`)
      .text(enrollment.address || "Address not provided")
      .text("Buea, Cameroon")
      .moveDown(1.5);

    // Subject
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .fillColor("#1e3a8a")
      .text("OFFICIAL ADMISSION LETTER", { align: "center" })
      .moveDown(0.5);

    // Decorative line
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke("#1e3a8a")
      .moveDown(1);

    // Salutation
    doc
      .fontSize(12)
      .font("Helvetica")
      .fillColor("#333")
      .text("Dear " + enrollment.firstName + " " + enrollment.lastName + ",")
      .moveDown(1);

    // Body
    doc
      .fontSize(11)
      .text(
        "We are delighted to extend our warmest congratulations on your admission to the " +
          enrollment.program +
          " program at EduManage Computer Training Center."
      )
      .moveDown(0.8);

    doc
      .text(
        "Your application has been carefully reviewed, and we are pleased to inform you that you have been selected for admission based on your qualifications and potential. This is an exciting step in your educational journey, and we look forward to welcoming you to our community of learners."
      )
      .moveDown(1);

    // Admission Details Box
    const boxY = doc.y;
    doc
      .rect(50, boxY, 495, 80)
      .fillAndStroke("#f8f9fa", "#1e3a8a")
      .fillColor("#333");

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#1e3a8a")
      .text("ADMISSION DETAILS", 60, boxY + 10)
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#333")
      .text(`Matriculation Number: ${enrollment.matricle}`, 60, doc.y)
      .text(`Program: ${enrollment.program}`, 60, doc.y + 15)
      .text(`Enrollment Date: ${new Date(enrollment.createdAt).toLocaleDateString()}`, 60, doc.y + 30)
      .text(`Admission Date: ${new Date(enrollment.approvedAt!).toLocaleDateString()}`, 60, doc.y + 45);

    doc.y = boxY + 90;
    doc.moveDown(1);

    // Thank you message
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#1e3a8a")
      .text("Thank You for Choosing EduManage", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#333")
      .text(
        "We thank you for choosing EduManage Computer Training Center for your educational needs. Your decision to join our institution reflects our shared commitment to excellence in education and professional development. We are honored to be part of your journey toward success.",
        { align: "justify" }
      )
      .moveDown(1);

    // Important information
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#1e3a8a")
      .text("Next Steps & Important Information:")
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#333");

    const bulletPoints = [
      "Bring this admission letter and your matriculation number to registration",
      "Complete all required documentation and fee payments within 7 days",
      "Attend the mandatory orientation session scheduled for the first week of classes",
      "Contact the administration office if you have any questions or need assistance",
      "Keep this letter safe as it serves as your official proof of admission"
    ];

    bulletPoints.forEach(point => {
      doc.text("• " + point).moveDown(0.3);
    });

    doc.moveDown(1);

    // Closing
    doc
      .fontSize(11)
      .font("Helvetica")
      .text("We wish you every success in your studies and look forward to supporting your academic and professional growth.")
      .moveDown(1);

    doc
      .text("Best regards,")
      .moveDown(1.5);

    // Signatures section
    const signatureY = doc.y;

    // CEO Signature (Left)
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("Emmanuel Ngum", 50, signatureY)
      .fontSize(9)
      .font("Helvetica")
      .text("CEO & Director", 50, signatureY + 15)
      .text("EduManage Computer Training Center", 50, signatureY + 25);

    // Course Creator Signature (Right)
    const programTeacher = program?.teachers?.[0]?.teacher;
    if (programTeacher) {
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(`${programTeacher.user.firstName} ${programTeacher.user.lastName}`, 350, signatureY)
        .fontSize(9)
        .font("Helvetica")
        .text("Program Coordinator", 350, signatureY + 15)
        .text(`${enrollment.program} Program`, 350, signatureY + 25);
    } else {
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("Academic Department", 350, signatureY)
        .fontSize(9)
        .font("Helvetica")
        .text("Program Coordinator", 350, signatureY + 15)
        .text(`${enrollment.program} Program`, 350, signatureY + 25);
    }

    // Footer
    doc.y = 750; // Near bottom of A4 page
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke("#1e3a8a")
      .moveDown(0.5);

    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("#666")
      .text(
        "This is an official admission letter issued by EduManage Computer Training Center. Please keep it safe for your records.",
        { align: "center" }
      )
      .text(
        "For inquiries: admissions@edumanage.cm | +237 677 000 000 | www.edumanage.cm",
        { align: "center" }
      );

    doc.end();

    // Wait for PDF to finish
    await new Promise<void>((resolve) => {
      doc.on("end", resolve);
    });

    const pdfBuffer = Buffer.concat(buffers);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="admission-letter-${enrollment.matricle}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating admission letter:", error);
    return NextResponse.json(
      { error: "Failed to generate admission letter" },
      { status: 500 }
    );
  }
}

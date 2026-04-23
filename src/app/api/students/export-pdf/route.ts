export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { program, search } = await req.json();

    // Fetch students with optional filters
    let students = await prisma.student.findMany({
      where: {
        ...(program && program !== "all" && { program }),
      },
      include: {
        user: true,
      },
      orderBy: { studentId: "asc" },
    });

    // Apply search filter if provided
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      students = students.filter(
        (s) =>
          `${s.user?.firstName || ""} ${s.user?.lastName || ""} ${s.user?.email || ""} ${s.studentId}`
            .toLowerCase()
            .includes(searchLower)
      );
    }

    const pdfBuffer = await generateStudentsPDF(students);
    const body = new Uint8Array(pdfBuffer);

    return new Response(body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="students-list-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function generateStudentsPDF(students: any[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4", layout: "landscape" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Paths
    const fontPath = path.join(
      process.cwd(),
      "public/fonts/Roboto-Regular.ttf"
    );

    // Use custom font
    try {
      doc.font(fontPath);
    } catch (e) {
      // Fallback to default font if custom font not found
    }

    const headerColor = "#1e40af";
    const textColor = "#333";
    const tableHeaderBg = "#e0e7ff";

    // ================= HEADER =================
    doc
      .fontSize(24)
      .fillColor(headerColor)
      .text("Student List Report", { align: "center" });

    doc
      .fontSize(10)
      .fillColor("#666")
      .text(
        `Generated on ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        { align: "center" }
      );

    doc.moveDown(0.5);

    doc
      .strokeColor(headerColor)
      .lineWidth(2)
      .moveTo(40, doc.y)
      .lineTo(doc.page.width - 40, doc.y)
      .stroke();

    doc.moveDown(1);

    // ================= TABLE =================
    const columnPositions = {
      studentId: 50,
      firstName: 130,
      lastName: 220,
      email: 310,
      phone: 450,
      program: 550,
      level: 680,
    };

    const columnWidths = {
      studentId: 75,
      firstName: 85,
      lastName: 85,
      email: 135,
      phone: 95,
      program: 125,
      level: 40,
    };

    // Table header
    const headerY = doc.y;
    const headerHeight = 25;

    // Draw header background
    doc
      .fillColor(tableHeaderBg)
      .rect(40, headerY, doc.page.width - 80, headerHeight)
      .fill();

    // Header text
    doc.fillColor(textColor).fontSize(9).font(fontPath, "bold");

    doc.text("Student ID", columnPositions.studentId, headerY + 6, {
      width: columnWidths.studentId,
    });
    doc.text("First Name", columnPositions.firstName, headerY + 6, {
      width: columnWidths.firstName,
    });
    doc.text("Last Name", columnPositions.lastName, headerY + 6, {
      width: columnWidths.lastName,
    });
    doc.text("Email", columnPositions.email, headerY + 6, {
      width: columnWidths.email,
    });
    doc.text("Phone", columnPositions.phone, headerY + 6, {
      width: columnWidths.phone,
    });
    doc.text("Program", columnPositions.program, headerY + 6, {
      width: columnWidths.program,
    });
    doc.text("Level", columnPositions.level, headerY + 6, {
      width: columnWidths.level,
    });

    doc.moveDown(1.5);

    // Table rows
    const PROGRAMS: Record<string, string> = {
      "bsc-computer-science": "BSc Computer Science",
      "bsc-business-administration": "BSc Business Admin",
      "bsc-nursing": "BSc Nursing",
      "bsc-education": "BSc Education",
      "hnd-accounting": "HND Accounting",
      "bsc-civil-engineering": "BSc Civil Engineering",
    };

    doc.font(fontPath).fontSize(8).fillColor(textColor);

    let rowY = doc.y;
    const rowHeight = 18;
    const pageBottom = doc.page.height - 40;

    students.forEach((student, index) => {
      // Check if we need a new page
      if (rowY + rowHeight > pageBottom) {
        doc.addPage();
        rowY = 40;

        // Repeat header on new page
        doc.fillColor(tableHeaderBg).rect(40, rowY, doc.page.width - 80, headerHeight).fill();
        doc.fillColor(textColor).fontSize(9).font(fontPath, "bold");
        doc.text("Student ID", columnPositions.studentId, rowY + 6, {
          width: columnWidths.studentId,
        });
        doc.text("First Name", columnPositions.firstName, rowY + 6, {
          width: columnWidths.firstName,
        });
        doc.text("Last Name", columnPositions.lastName, rowY + 6, {
          width: columnWidths.lastName,
        });
        doc.text("Email", columnPositions.email, rowY + 6, {
          width: columnWidths.email,
        });
        doc.text("Phone", columnPositions.phone, rowY + 6, {
          width: columnWidths.phone,
        });
        doc.text("Program", columnPositions.program, rowY + 6, {
          width: columnWidths.program,
        });
        doc.text("Level", columnPositions.level, rowY + 6, {
          width: columnWidths.level,
        });

        doc.font(fontPath).fontSize(8).fillColor(textColor);
        rowY += headerHeight + 8;
      }

      // Alternate row backgrounds
      if (index % 2 === 1) {
        doc.fillColor("#f8f9fa").rect(40, rowY - 2, doc.page.width - 80, rowHeight).fill();
        doc.fillColor(textColor);
      }

      const firstName = student.user?.firstName || "";
      const lastName = student.user?.lastName || "";
      const email = student.user?.email || "";
      const phone = student.user?.phone || "";
      const programName = PROGRAMS[student.program] || student.program;

      doc.text(student.studentId, columnPositions.studentId, rowY, {
        width: columnWidths.studentId,
      });
      doc.text(firstName, columnPositions.firstName, rowY, {
        width: columnWidths.firstName,
      });
      doc.text(lastName, columnPositions.lastName, rowY, {
        width: columnWidths.lastName,
      });
      doc.text(email, columnPositions.email, rowY, {
        width: columnWidths.email,
      });
      doc.text(phone, columnPositions.phone, rowY, {
        width: columnWidths.phone,
      });
      doc.text(programName, columnPositions.program, rowY, {
        width: columnWidths.program,
      });
      doc.text(student.level.toString(), columnPositions.level, rowY, {
        width: columnWidths.level,
      });

      rowY += rowHeight;
    });

    // Footer
    const footerY = doc.page.height - 30;
    doc
      .fontSize(8)
      .fillColor("#999")
      .text(`Total Students: ${students.length}`, 40, footerY, {
        align: "left",
      });

    doc.end();
  });
}

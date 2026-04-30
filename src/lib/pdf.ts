import PDFDocument from "pdfkit";

export function createPdfDocument(title?: string) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    info: title ? { Title: title } : undefined,
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  return {
    doc,
    done: new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
    }),
  };
}

export function addPdfHeader(doc: any, title: string, subtitle: string, accent = "#2563eb") {
  doc.save();
  doc.roundedRect(40, 36, 515, 76, 16).fill(accent);
  doc
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .fontSize(21)
    .text(title, 58, 56, { width: 470 });
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#dbeafe")
    .text(subtitle, 58, 84, { width: 470 });
  doc.restore();
  doc.moveDown(4.6);
}

export function addPdfStatRow(
  doc: any,
  stats: Array<{ label: string; value: string }>,
  topY = doc.y
) {
  const startX = 40;
  const gap = 10;
  const width = (515 - gap * (stats.length - 1)) / stats.length;
  const height = 54;

  stats.forEach((stat, index) => {
    const x = startX + index * (width + gap);
    doc.roundedRect(x, topY, width, height, 10).fillAndStroke("#eff6ff", "#bfdbfe");
    doc
      .fillColor("#64748b")
      .font("Helvetica")
      .fontSize(8)
      .text(stat.label.toUpperCase(), x + 12, topY + 10, { width: width - 24 });
    doc
      .fillColor("#0f172a")
      .font("Helvetica-Bold")
      .fontSize(15)
      .text(stat.value, x + 12, topY + 26, { width: width - 24 });
  });

  doc.y = topY + height + 16;
}

export function ensurePdfSpace(doc: any, neededHeight: number) {
  if (doc.y + neededHeight > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
}

export function addSectionTitle(doc: any, title: string) {
  ensurePdfSpace(doc, 28);
  doc.moveDown(0.2);
  doc.font("Helvetica-Bold").fontSize(13).fillColor("#1e3a8a").text(title);
  doc.moveDown(0.4);
}

export function addKeyValueLines(
  doc: any,
  rows: Array<{ label: string; value: string }>,
  options?: { lineGap?: number }
) {
  const lineGap = options?.lineGap ?? 6;

  rows.forEach((row) => {
    ensurePdfSpace(doc, 20);
    const y = doc.y;
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#334155").text(`${row.label}:`, 40, y, {
      width: 150,
    });
    doc.font("Helvetica").fontSize(10).fillColor("#0f172a").text(row.value, 160, y, {
      width: 390,
    });
    doc.moveDown(lineGap / 10);
  });
}

export function addDivider(doc: any) {
  ensurePdfSpace(doc, 14);
  const y = doc.y + 2;
  doc.moveTo(40, y).lineTo(555, y).strokeColor("#e2e8f0").stroke();
  doc.moveDown(0.9);
}

export function formatCurrency(value: number) {
  return `${value.toLocaleString()} XAF`;
}

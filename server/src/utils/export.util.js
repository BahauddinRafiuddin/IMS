import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

// ================== MAIN FUNCTION ==================
export const exportToFile = async ({
  res,
  data,
  format = "excel",
  fileName = "report",
  columns = [],
}) => {
  if (format === "excel") {
    return exportExcel(res, data, fileName, columns);
  }

  if (format === "pdf") {
    return exportPDF(res, data, fileName, columns);
  }

  return res.status(400).json({
    success: false,
    message: "Invalid format",
  });
};

// ================== EXCEL ==================
const exportExcel = async (res, data, fileName, columns) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(fileName);

  // Format columns
  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width || 20,
  }));

  worksheet.addRows(data);

  // Style header
  worksheet.getRow(1).font = { bold: true };

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${fileName}.xlsx`
  );

  await workbook.xlsx.write(res);
  res.end();
};

// ================== PDF ========================
const exportPDF = (res, data, fileName, columns) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const pageWidth = 595.28; // Standard A4 width
  const margin = 50;
  const usableWidth = pageWidth - (margin * 2);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}.pdf`);
  doc.pipe(res);

  // --- Title ---
  doc.font("Helvetica-Bold").fontSize(20).text(fileName.toUpperCase(), { align: "center" });
  doc.moveDown(1.5);

  // --- Calculate Column Layout ---
  // We divide the width based on how many columns exist
  const colCount = columns.length;
  const colWidth = usableWidth / colCount;
  const rowHeight = 25;
  let currentY = doc.y;

  // --- Helper: Draw Table Row ---
  const drawRow = (rowData, isHeader = false) => {
    const startX = margin;
    doc.font(isHeader ? "Helvetica-Bold" : "Helvetica").fontSize(isHeader ? 10 : 9);

    // Draw background for header or zebra striping
    if (isHeader) {
      doc.rect(startX, currentY - 5, usableWidth, rowHeight).fill('#f2f2f2');
      doc.fillColor('#000000');
    }

    columns.forEach((col, i) => {
      const xPos = startX + (i * colWidth);
      const text = isHeader ? col.header : String(rowData[col.key] || "");

      // Use "width" and "ellipsis" options to prevent text overlap
      doc.text(text, xPos + 5, currentY, {
        width: colWidth - 10,
        ellipsis: true
      });
    });

    // Draw horizontal line
    doc.moveTo(startX, currentY + 15).lineTo(startX + usableWidth, currentY + 15).strokeColor('#eeeeee').stroke();

    currentY += rowHeight;

    // Automatic Pagination
    if (currentY > 750) {
      doc.addPage();
      currentY = 50;
    }
  };

  // --- Render Table ---
  drawRow({}, true); // Header
  currentY += 5;     // Small gap after header

  data.forEach((row) => {
    drawRow(row, false);
  });

  doc.end();
};
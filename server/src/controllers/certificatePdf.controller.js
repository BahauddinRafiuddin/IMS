import { fileURLToPath } from 'url';
import path from 'path';
import PDFDocument from "pdfkit";
import InternshipProgram from "../models/InternshipProgram.js";
import User from "../models/User.js";
import { calculateInternPerformanceService } from "../services/performance.service.js";

// --- Fix for __dirname in ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const downloadCertificate = async (req, res) => {
  try {
    const { programId } = req.params;
    const internId = req.user.id;

    const intern = await User.findById(internId);
    const program = await InternshipProgram.findById(programId);
    const performance = await calculateInternPerformanceService(internId, programId);

    const eligible = performance.totalTasks > 0 &&
      performance.grade !== "Fail" &&
      performance.completionPercentage >= 45;

    if (!eligible) {
      return res.status(403).json({ success: false, message: "Not eligible" });
    }

    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Certificate-${intern.name.replace(/\s+/g, '_')}.pdf`);
    doc.pipe(res);

    const width = doc.page.width;
    const height = doc.page.height;

    // ================= SETTINGS =================
    const primaryColor = "#1A237E";
    const secondaryColor = "#C5A059";
    const textColor = "#2C3E50";

    // NOTE: Convert your logo.svg to logo.png. PDFKit does not support SVG out of the box.
    const logoPath = path.join(__dirname, '../../../client/public/logo.png');

    // ================= BACKGROUND & BORDERS =================
    doc.rect(0, 0, width, height).fill("#FFFFFF");

    // Thick Primary Border
    doc.lineWidth(20).strokeColor(primaryColor).rect(10, 10, width - 20, height - 20).stroke();
    // Thin Gold Accent Border
    doc.lineWidth(1.5).strokeColor(secondaryColor).rect(30, 30, width - 60, height - 60).stroke();

    // ================= LOGO SECTION =================
    try {
      // PDFKit needs PNG/JPG. If using SVG, you'd need the 'svg-to-pdfkit' library.
      doc.image(logoPath, width / 2 - 50, 50, { width: 80 });
    } catch (e) {
      doc.fillColor(primaryColor).font("Helvetica-Bold").fontSize(22).text("IMS ACADEMY", 0, 70, { align: "center" });
    }

    // ================= MAIN CONTENT =================
    // Title
    doc.font("Helvetica-Bold").fontSize(42).fillColor(primaryColor)
      .text("CERTIFICATE OF COMPLETION", 0, 170, { align: "center", characterSpacing: 1 });

    // Sub-text
    doc.font("Helvetica").fontSize(16).fillColor(textColor)
      .text("THIS IS TO CERTIFY THAT", 0, 230, { align: "center" });

    // Intern Name
    doc.font("Times-BoldItalic").fontSize(52).fillColor(secondaryColor)
      .text(intern.name, 0, 265, { align: "center" });

    // Description
    doc.font("Helvetica").fontSize(16).fillColor(textColor)
      .text("has successfully completed the intensive internship program in", 0, 340, { align: "center" });

    // Program Title
    doc.font("Helvetica-Bold").fontSize(24).fillColor(primaryColor)
      .text(`${program.title}`, 0, 375, { align: "center" });

    // Grade
    doc.font("Helvetica-Oblique").fontSize(15).fillColor(textColor)
      .text(`Achieving an exceptional overall grade of ${performance.grade}`, 0, 415, { align: "center" });

    // ================= FOOTER / SIGNATURES =================
    const footerY = height - 120;

    // Left Side: Date
    doc.font("Helvetica-Bold").fontSize(12).fillColor(textColor).text("DATE", 100, footerY - 15);
    doc.font("Helvetica").text(new Date().toLocaleDateString('en-GB'), 100, footerY + 5);

    // Right Side: Signature Line
    doc.lineWidth(1).strokeColor(textColor);
    doc.moveTo(width - 280, footerY).lineTo(width - 100, footerY).stroke();
    doc.font("Helvetica-Bold").fontSize(12).text("PROGRAM DIRECTOR", width - 280, footerY + 10, { width: 180, align: 'center' });

    // Center: Verification ID
    const certId = `IMS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    doc.fontSize(10).fillColor("#7F8C8D").text(`Verification ID: ${certId}`, 0, height - 50, { align: "center" });

    doc.end();

  } catch (error) {
    console.error("Critical PDF Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Certificate generation failed" });
    }
  }
};
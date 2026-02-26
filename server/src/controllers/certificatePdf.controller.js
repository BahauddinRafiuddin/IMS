import { isValidObjectId } from "mongoose";
import PDFDocument from "pdfkit";
import InternshipProgram from "../models/InternshipProgram.js";
import User from "../models/User.js";
import { calculateInternPerformanceService } from "../services/performance.service.js";


export const downloadCertificate = async (req, res) => {
  try {
    const { programId } = req.params;
    const internId = req.user.id;

    const intern = await User.findById(internId);
    const program = await InternshipProgram.findById(programId);

    const performance = await calculateInternPerformanceService(
      internId,
      programId
    );

    const eligible =
      performance.totalTasks > 0 &&
      performance.grade !== "Fail" &&
      performance.completionPercentage >= 45;

    if (!eligible) {
      return res.status(403).json({
        success: false,
        message: "Not eligible for certificate"
      });
    }

    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 40
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${intern.name}-certificate.pdf`
    );

    doc.pipe(res);

    const width = doc.page.width;
    const height = doc.page.height;

    // ================= BACKGROUND =================
    doc.rect(0, 0, width, height).fill("#ffffff");

    // ================= GOLD BORDER =================
    doc
      .lineWidth(6)
      .strokeColor("#d4af37")
      .rect(20, 20, width - 40, height - 40)
      .stroke();

    doc
      .lineWidth(1.5)
      .strokeColor("#2ecc71")
      .rect(40, 40, width - 80, height - 80)
      .stroke();

    // ================= LOGO =================
    doc
      .fillColor("#2ecc71")
      .circle(90, 90, 10)
      .fill();

    doc
      .fillColor("#2ecc71")
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("COMPANY", 110, 80);

    doc
      .fontSize(9)
      .fillColor("#666")
      .text("YOUR LOGO", 110, 98);

    // ================= TITLE =================
    doc
      .fontSize(38)
      .fillColor("#2ecc71")
      .font("Helvetica-Bold")
      .text("CERTIFICATE", 0, 140, {
        align: "center"
      });

    doc
      .fontSize(20)
      .fillColor("#444")
      .text("OF ACHIEVEMENT", {
        align: "center"
      });

    // ================= SUB TEXT =================
    doc.moveDown(2);

    doc
      .fontSize(12)
      .fillColor("#f39c12")
      .font("Helvetica-Bold")
      .text(
        "THIS CERTIFICATE IS PROUDLY PRESENTED\nFOR HONORABLE ACHIEVEMENT TO",
        {
          align: "center"
        }
      );

    // ================= NAME =================
    doc.moveDown(1);

    doc
      .fontSize(42)
      .fillColor("#27ae60")
      .font("Times-Italic")
      .text(intern.name, {
        align: "center"
      });

    // ================= DESCRIPTION =================
    doc.moveDown(1);

    doc
      .fontSize(14)
      .fillColor("#555")
      .font("Helvetica")
      .text(
        `has successfully completed the internship program\n "${program.title}" under the domain of ${program.domain}.`,
        {
          align: "center",
          width: width - 80
        }
      );

    // ================= SIGNATURE AREA =================
    const signY = height - 120;

    doc
      .moveTo(220, signY)
      .lineTo(380, signY)
      .strokeColor("#2ecc71")
      .stroke();

    doc
      .moveTo(width - 380, signY)
      .lineTo(width - 220, signY)
      .stroke();

    doc
      .fontSize(10)
      .fillColor("#2ecc71")
      .text("SIGNATURE", 260, signY + 10);

    doc
      .text("SIGNATURE", width - 340, signY + 10);

    // ================= FOOTER =================
    const certId =
      "IMS-" +
      new Date().getFullYear() +
      "-" +
      Math.floor(100000 + Math.random() * 900000);

    doc
      .fontSize(9)
      .fillColor("#777")
      .text(
        `Certificate ID: ${certId}`,
        0,
        height - 60,
        { align: "center" }
      );

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Certificate generation failed"
    });
  }
};

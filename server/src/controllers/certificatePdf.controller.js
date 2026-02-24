import { isValidObjectId } from "mongoose";
import PDFDocument from "pdfkit";
import InternshipProgram from "../models/InternshipProgram.js";
import User from "../models/User.js";
import { calculateInternPerformanceService } from "../services/performance.service.js";

// export const downloadCertificate = async (req, res) => {
//   try {
//     const { programId } = req.params;
//     const internId = req.user.id;

//     if (!isValidObjectId(programId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid program id"
//       });
//     }

//     if (req.user.role !== "intern") {
//       return res.status(403).json({
//         success: false,
//         message: "Only interns can check Download certificate"
//       });
//     }

//     const intern = await User.findById(internId)
//     if (!intern) {
//       return res.status(404).json({
//         success: false,
//         message: "intern not found"
//       })
//     }

//     const program = await InternshipProgram.findById(programId);
//     if (!program) {
//       return res.status(404).json({
//         success: false,
//         message: "Program not found"
//       });
//     }

//     if (program.status !== "completed") {
//       return res.status(403).json({
//         success: false,
//         message: "Program not completed yet"
//       });
//     }

//     const enrolled = program.interns.some(
//       id => id.intern.toString() === internId
//     );

//     if (!enrolled) {
//       return res.status(403).json({
//         success: false,
//         message: "Intern not enrolled in this program"
//       });
//     }

//     const performance = await calculateInternPerformanceService(internId, programId)

//     const isEligible =
//       performance.totalTasks > 0 &&
//       performance.grade !== "Fail" &&
//       performance.completionPercentage >= 45;

//     if (!isEligible) {
//       return res.status(403).json({
//         success: false,
//         message: "Not eligible for certificate"
//       });
//     }

//     const doc = new PDFDocument({
//       size: "A4",
//       margin: 50
//     });

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=certificate-${intern.name}.pdf`
//     );

//     doc.pipe(res);
//     doc
//       .fontSize(26)
//       .text("CERTIFICATE OF COMPLETION", {
//         align: "center"
//       });

//     doc.moveDown(2);

//     doc
//       .fontSize(16)
//       .text("This is to certify that", {
//         align: "center"
//       });

//     doc.moveDown(1);

//     doc
//       .fontSize(22)
//       .fillColor("#0A4D8C")
//       .text(intern.name.toUpperCase(), {
//         align: "center"
//       })
//       .fillColor("black");

//     doc.moveDown(1.5);

//     doc
//       .fontSize(16)
//       .text("has successfully completed the", {
//         align: "center"
//       });

//     doc.moveDown(1);

//     doc
//       .fontSize(20)
//       .text(program.title, {
//         align: "center"
//       });

//     doc.moveDown(1);

//     doc
//       .fontSize(16)
//       .text(`Domain: ${program.domain}`, {
//         align: "center"
//       });

//     doc.moveDown(1.5);

//     doc
//       .fontSize(14)
//       .text(
//         `Duration: ${program.startDate.toDateString()} to ${program.endDate.toDateString()}`,
//         { align: "center" }
//       );

//     doc.moveDown(1);

//     doc
//       .fontSize(16)
//       .text(
//         `Final Grade: ${performance.grade}`,
//         { align: "center" }
//       );

//     doc.moveDown(2);

//     doc
//       .fontSize(12)
//       .text(
//         `Issued On: ${new Date().toDateString()}`,
//         { align: "center" }
//       );

//     doc.moveDown(1);

//     const certificateId =
//       "IMS-" +
//       new Date().getFullYear() +
//       "-" +
//       Math.floor(100000 + Math.random() * 900000);

//     doc
//       .fontSize(10)
//       .text(`Certificate ID: ${certificateId}`, {
//         align: "center"
//       });

//     doc.moveDown(3);

//     doc
//       .fontSize(14)
//       .text(
//         "Authorized By\nInternship Management System",
//         { align: "center" }
//       );

//     doc.end();

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while Generating Certificate eligibility"
//     });
//   }
// }

// import PDFDocument from "pdfkit";

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

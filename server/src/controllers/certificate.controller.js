import { isValidObjectId } from "mongoose"
import InternshipProgram from "../models/InternshipProgram.js"
import { calculateInternPerformanceService } from "../services/performance.service.js"
import Enrollment from "../models/Enrollment.js";


export const checkCertificateEligibility = async (req, res) => {
  try {
    const { programId } = req.params;
    const internId = req.user._id;

    // Validate program id
    if (!isValidObjectId(programId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid program id"
      });
    }

    // Role check
    if (req.user.role !== "intern") {
      return res.status(403).json({
        success: false,
        message: "Only interns can check certificate eligibility"
      });
    }

    // Fetch program
    const program = await InternshipProgram.findById(programId);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found"
      });
    }

    if (program.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({ message: "Unauthorized" })
    }

    // Enrollment check
    const enrollment = await Enrollment.findOne({
      program: programId,
      intern: internId,
      status: "completed"
    });

    if (!enrollment || enrollment.status !== "completed") {
      return res.status(403).json({
        success: false,
        message: "Internship not completed"
      });
    }

    // Calculate performance
    const performance =
      await calculateInternPerformanceService(internId, programId);

    // Eligibility rule (FINAL)
    const isEligible =
      performance.totalTasks > 0 &&
      performance.grade !== "Fail" &&
      performance.completionPercentage >= 45;

    // Response
    return res.status(200).json({
      success: true,
      eligible: isEligible,
      grade: performance.grade,
      completionPercentage: performance.completionPercentage,
      message: isEligible
        ? "Eligible for certificate"
        : "Not eligible for certificate"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error while checking certificate eligibility"
    });
  }
};
import { isValidObjectId } from "mongoose"
import Task from "../models/Task.js"
import InternshipProgram from "../models/InternshipProgram.js"
import { calculateInternPerformanceService } from "../services/performance.service.js"

export const calculateInternPerformance = async (req, res) => {
  try {
    const internId = req.user.id;
    const { programId } = req.params;

    if (!isValidObjectId(programId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid program id"
      });
    }

    if (req.user.role !== "intern") {
      return res.status(403).json({
        success: false,
        message: "Only interns can view performance"
      });
    }

    const program = await InternshipProgram.findById(programId);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found"
      });
    }

    const enrolled = program.interns.some(
      id => id.intern.toString() === internId
    );

    if (!enrolled) {
      return res.status(403).json({
        success: false,
        message: "Intern not enrolled in this program"
      });
    }

    const data = await calculateInternPerformanceService(
      internId,
      programId
    );

    return res.status(200).json({
      success: true,
      program: {
        id: program._id,
        title: program.title,
        domain: program.domain
      },
      performance: data
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while calculating performance"
    });
  }
};
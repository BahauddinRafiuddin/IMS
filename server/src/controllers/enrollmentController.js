import Enrollment from "../models/Enrollment.js"
import InternshipProgram from "../models/InternshipProgram.js"
import User from "../models/User.js"

export const enrollIntern = async (req, res) => {
  try {
    const { internId, programId } = req.body
    // console.log("internId",internId)
    // console.log("programId",programId)

    // Check intern exists and belongs to same company
    const intern = await User.findById(internId);

    if (!intern || intern.role !== "intern") {
      return res.status(404).json({
        success: false,
        message: "Intern not found"
      });
    }

    if (intern.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only enroll interns from your company"
      });
    }

    // Check program exists and belongs to same company
    const program = await InternshipProgram.findById(programId)

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found in your company"
      })
    }
    if (program.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({
        success: false,
        message: "This program is not in your company"
      });
    }



    // Create enrollment
    const enrollment = await Enrollment.create({
      intern: intern._id,
      program: program._id,
      mentor: program.mentor,
      paymentStatus:
        program.type === "free" ? "not_required" : "pending"
    })

    res.status(201).json({
      success: true,
      message: "Intern enrolled successfully",
      enrollment
    })

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Intern already enrolled in this program"
      })
    }

    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
import Enrollment from "../models/Enrollment.js"
import InternshipProgram from "../models/InternshipProgram.js"
import User from "../models/User.js"

export const enrollIntern = async (req, res) => {
  try {
    const { internId, programId } = req.body

    // Check intern exists and belongs to same company
    const intern = await User.findOne({
      _id: internId,
      role: "intern",
      company: req.user.company
    })

    if (!intern) {
      return res.status(404).json({
        success: false,
        message: "Intern not found in your company"
      })
    }

    // Check program exists and belongs to same company
    const program = await InternshipProgram.findOne({
      _id: programId,
      company: req.user.company
    })

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found in your company"
      })
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
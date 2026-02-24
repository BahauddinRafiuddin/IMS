import InternshipProgram from "../models/InternshipProgram.js";

export const createProgram = async (req, res) => {
  try {
    const {
      title,
      domain,
      description,
      mentor,
      type,
      price,
      startDate,
      endDate,
      durationInWeeks,
      rules
    } = req.body

    const program = await InternshipProgram.create({
      title,
      domain,
      description,
      mentor,
      type,
      price,
      startDate,
      endDate,
      durationInWeeks,
      rules,
      company: req.user.company
    })

    res.status(201).json({
      success: true,
      program
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
// Get Programs (Company Isolated)
export const getPrograms = async (req, res) => {
  try {
    const programs = await InternshipProgram.find({
      company: req.user.company
    }).populate("mentor", "name email");

    res.status(200).json({
      success: true,
      programs
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
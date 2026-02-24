import { isValidObjectId } from "mongoose";
import User from "../models/User.js";
import InternshipProgram from "../models/InternshipProgram.js";
import razorpay from "../utils/razorpay.js";
import crypto from "crypto"
import { sendEmail } from "../utils/sendEmail.js"
import Enrollment from "../models/Enrollment.js";


// Admin Auth Controllers
// export const createMentor = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password) {
//       return res.status(400).json({ success: false, message: 'All Fields Are Required!!' })
//     }

//     const user = await User.findOne({ email: email })
//     if (user) {
//       return res.status(400).json({ success: false, message: "User Already Exist With This Email" })
//     }
//     const mentor = await User.create({
//       name,
//       email,
//       password,
//       role: "mentor",
//       isActive: true
//     });

//     res.status(201).json({
//       success: true, message: "Mentor created", mentor: {
//         name: mentor.name,
//         id: mentor._id,
//         email: mentor.email
//       }
//     });
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({
//       success: false,
//       message: 'Server Error In Mentore Creation'
//     })
//   }
// };

export const getAllInterns = async (req, res) => {
  try {
    // 1️⃣ Get all interns
    const interns = await User.find({ role: "intern", company: req.user.company })
      .select("name email isActive");

    if (!interns.length) {
      return res.status(404).json({
        success: false,
        message: "No interns found"
      });
    }

    // 2️⃣ Get all active & upcoming programs
    const programs = await Enrollment.find({
      status: { $in: ["approved", "in_progress"] }
    })
      .populate({
        path: "intern",
        match: { company: req.user.company },
        select: "name email"
      })
      .populate("mentor", "name email");

    // 3️⃣ Map intern → mentor
    const internMentorMap = {};

    programs.forEach(program => {
      internMentorMap[program.intern._id.toString()] = program.mentor;
    });

    // 4️⃣ Attach mentor to intern
    const finalInterns = interns.map(intern => ({
      _id: intern._id,
      name: intern.name,
      email: intern.email,
      isActive: intern.isActive,
      mentor: internMentorMap[intern._id.toString()] || null
    }));

    return res.status(200).json({
      success: true,
      message: "Interns fetched successfully",
      interns: finalInterns
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching interns"
    });
  }
};

export const getAllMentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: "mentor" })
      .select("name email");

    const programs = await InternshipProgram.find();

    const mentorMap = {};

    programs.forEach(program => {
      const mentorId = program.mentor.toString();
      mentorMap[mentorId] = (mentorMap[mentorId] || 0) + 1;
    });

    const finalMentors = mentors.map(m => ({
      ...m.toObject(),
      internCount: mentorMap[m._id.toString()] || 0
    }));

    return res.status(200).json({
      success: true,
      mentors: finalMentors
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching mentors"
    });
  }
};

export const deleteMentorById = async (req, res) => {
  try {
    const { mentorId } = req.params;

    //  find mentor
    const mentor = await User.findById(mentorId);

    if (!mentor || mentor.role !== "mentor") {
      return res.status(404).json({
        success: false,
        message: "Mentor not found"
      });
    }

    //  check if mentor assigned to any program
    const assignedProgram = await InternshipProgram.findOne({
      mentor: mentorId
    });

    if (assignedProgram) {
      return res.status(400).json({
        success: false,
        message: "Mentor is assigned to a program. Remove mentor from program first."
      });
    }

    //  delete mentor
    await User.findByIdAndDelete(mentorId);

    res.status(200).json({
      success: true,
      message: "Mentor deleted successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting mentor"
    });
  }
};

export const updateInternStatus = async (req, res) => {
  try {
    const { internId } = req.params
    const { isActive } = req.body

    if (!isValidObjectId(internId)) {
      return res.status(401).json({ success: false, message: "Invalid InternId" })
    }

    const intern = await User.findById(internId)
    if (!intern || !intern.role == "intern") {
      return res.status(404).json({ success: false, message: "Intern Not Found" })
    }

    intern.isActive = isActive
    await intern.save()
    res.json({
      success: true,
      message: `${intern.name} ${isActive ? "Activated" : "Deactivated"}`
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: 'Server Error While Updating Intern Status'
    })
  }
}

// Create program
export const createProgram = async (req, res) => {
  try {
    const { title, domain, description, mentorId, durationInWeeks, startDate, endDate } = req.body

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        message: "End date must be after start date"
      })
    }

    if (!title || !domain || !mentorId || !durationInWeeks) {
      return res.status(400).json({ success: false, message: "Reuired Field Is Not Provided" })
    }

    const exists = await InternshipProgram.findOne({ title });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Program already exists"
      });
    }

    const mentor = await User.findById(mentorId)
    if (!mentor || mentor.role !== "mentor") {
      return res.status(404).json({ message: "Invalid mentor" });
    }

    const internshipProgram = await InternshipProgram.create({
      title,
      domain,
      description,
      mentor: mentorId,
      durationInWeeks,
      startDate,
      endDate
    })

    return res.status(201).json({
      success: true, message: "Program SuccessFully Created", program: {
        id: internshipProgram._id,
        title,
        domain,
        mentor: mentor.name,
        status: internshipProgram.status
      }
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: 'Server Error While Creating Internship Program'
    })
  }
}

export const getAllPrograms = async (req, res) => {
  try {
    const programs = await InternshipProgram.aggregate([

      // 🔹 Join Mentor
      {
        $lookup: {
          from: "users", // mentor collection
          localField: "mentor",
          foreignField: "_id",
          as: "mentor"
        }
      },

      // Convert mentor array to object
      {
        $unwind: {
          path: "$mentor",
          preserveNullAndEmptyArrays: true
        }
      },

      // 🔹 Join Tasks
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "program",
          as: "tasks"
        }
      },

      // 🔹 Add totalTasks field
      {
        $addFields: {
          totalTasks: { $size: "$tasks" }
        }
      },

      // 🔹 Clean response
      {
        $project: {
          tasks: 0, // remove full task array
          "mentor.password": 0, // hide sensitive fields
          "mentor.__v": 0
        }
      }

    ]);

    if (!programs.length) {
      return res.status(404).json({
        success: false,
        message: "Programs Not Found!"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Programs Found Successfully",
      programs
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error While Fetching Internship Program"
    });
  }
}

// Change Program Status
export const changeProgramStatus = async (req, res) => {
  try {
    const allowedStatus = ["upcoming", "active", "completed"];

    const { progId } = req.params
    const { changedStatus } = req.body

    if (!allowedStatus.includes(changedStatus)) {
      return res.status(400).json({ success: false, message: "Wrong Status" })
    }

    if (!isValidObjectId(progId)) {
      return res.status(400).json({ success: false, message: "Invalid Program Id" })
    }

    const program = await InternshipProgram.findById(progId)
    if (!program) {
      return res.status(404).json({ success: false, message: "Program Not Found" })
    }

    const currentStatus = program.status;
    if (currentStatus === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed program cannot be modified"
      });
    }

    // Prevent BackWord Like Active ===> Upcomming Not ALlowed
    if (
      (currentStatus === "active" && changedStatus === "upcoming") ||
      (currentStatus === "completed" && changedStatus !== "completed")
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${currentStatus} to ${changedStatus}`
      });
    }
    const activeEnrollments = await Enrollment.countDocuments({
      program: progId,
      status: { $in: ["approved", "in_progress"] }
    });

    // Upcomming ==> Active
    if (currentStatus === "upcoming" && changedStatus === "active") {
      if (!program.mentor) {
        return res.status(400).json({
          success: false,
          message: "Mentor must be assigned before activation"
        });
      }
      if (activeEnrollments === 0) {
        return res.status(400).json({
          message: "At least one enrollment required"
        });
      }
      program.status = "active";
      await program.save();

      return res.status(200).json({
        success: true,
        message: "Internship program is now ACTIVE"
      });
    }

    // Active ==> Completed
    if (currentStatus === "active" && changedStatus === "completed") {
      program.status = "completed";
      await program.save();

      return res.status(200).json({
        success: true,
        message: "Internship program marked as COMPLETED"
      });
    }

    // Anything else is invalid
    return res.status(400).json({
      success: false,
      message: `Invalid transition from ${currentStatus} to ${changedStatus}`
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: 'Server Error While Updating Program Status'
    })
  }
}

// Update Program
// Update Program
export const updateProgram = async (req, res) => {
  try {
    const { progId } = req.params;

    const {
      title,
      domain,
      description,
      rules,
      startDate,
      endDate
    } = req.body || {};

    if (!isValidObjectId(progId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid program id"
      });
    }

    const program = await InternshipProgram.findById(progId);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found"
      });
    }

    if (program.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed program cannot be updated"
      });
    }

    if (title !== undefined) program.title = title;
    if (domain !== undefined) program.domain = domain;
    if (description !== undefined) program.description = description;
    if (rules !== undefined) program.rules = rules;

    // -----------------------------
    // DATE LOGIC
    // -----------------------------
    const finalStart = startDate
      ? new Date(startDate)
      : new Date(program.startDate);

    const finalEnd = endDate
      ? new Date(endDate)
      : new Date(program.endDate);

    if (finalEnd <= finalStart) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date"
      });
    }

    program.startDate = finalStart;
    program.endDate = finalEnd;

    const diffTime = finalEnd - finalStart;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    program.durationInWeeks = Math.ceil(diffDays / 7);

    await program.save();

    return res.status(200).json({
      success: true,
      message: "Internship program updated successfully",
      program
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating program"
    });
  }
}


// export const enrollIntern = async (req, res) => {
//   try {
//     const { progId } = req.params
//     const { internId } = req.body

//     if (!isValidObjectId(progId) || !isValidObjectId(internId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid program or intern id"
//       });
//     }

//     // Program Must be Exist
//     const program = await InternshipProgram.findById(progId)
//     if (!program) {
//       return res.status(404).json({ success: false, message: "Program Not Found" })
//     }

//     // Program Must be Upcomming
//     if (program.status != "upcoming") {
//       return res.status(403).json({ success: false, message: "Program is Already Active Or Completed" })
//     }

//     // Intern Must Exist
//     const intern = await User.findById(internId)
//     if (!intern || intern.role != "intern") {
//       return res.status(404).json({ success: false, message: "Intern Not Found" })
//     }

//     // Intern Must be Active
//     if (!intern.isActive) {
//       return res.status(403).json({ success: false, message: "Intern Is Not Active" })
//     }

//     // Check If Intern Alredy Enrolled in program
//     const alreadyEnrolled = program.interns.some(
//       i => i.intern.toString() === internId
//     );

//     if (alreadyEnrolled) {
//       return res.status(409).json({
//         success: false,
//         message: `${intern.name} already enrolled in this program`
//       });
//     }

//     program.interns.push({
//       intern: internId,
//       mentor: program.mentor
//     });
//     await program.save()
//     return res.status(200).json({ success: true, message: `${intern.name} Is Successfully Enrolled In This Program` })

//   } catch (error) {
//     console.log(error)
//     res.status(500).json({
//       success: false,
//       message: 'Server Error While Enrolling Intern Into Program'
//     })
//   }
// }

export const getAvailableInterns = async (req, res) => {
  try {
    // All active interns
    const interns = await User.find({
      role: "intern",
      isActive: true
    });

    // Programs that are not completed
    const activePrograms = await InternshipProgram.find({
      status: { $in: ["upcoming", "active"] }
    });

    // Collect all enrolled intern IDs
    const enrolledInternIds = new Set();

    activePrograms.forEach(program => {
      program.interns.forEach(id => {
        enrolledInternIds.add(id.intern.toString());
      });
    });

    // Filter interns not already enrolled
    const availableInterns = interns.filter(
      intern => !enrolledInternIds.has(intern._id.toString())
    );

    return res.status(200).json({
      success: true,
      interns: availableInterns
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: 'Server Error While Fetching Available Intern For Enrollment'
    })
  }
}



export const createMentor = async (req, res) => {
  try {
    const { name, email } = req.body

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ success: false, message: "User already exists" })
    }

    const tempPassword = crypto.randomBytes(4).toString("hex")
    const mentor = await User.create({
      name,
      email,
      password: tempPassword,
      role: "mentor",
      company: req.user.company,
      isActive: true
    })

    await sendEmail(
      email,
      "Mentor Account Created",
      `
        <h2>Welcome to IMS</h2>
        <p>Your mentor account has been created.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${tempPassword}</p>
        <p>Please change your password after login.</p>
      `
    )
    res.status(201).json({
      success: true,
      message: "Mentor created and email sent"
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Server Error Wille Creating Mentor"
    })
  }
}

export const createIntern = async (req, res) => {
  try {
    const { name, email } = req.body

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const tempPassword = crypto.randomBytes(4).toString("hex")

    const intern = await User.create({
      name,
      email,
      password: tempPassword,
      role: "intern",
      company: req.user.company,
      isActive: true
    })

    await sendEmail(
      email,
      "Intern Account Created",
      `
        <h2>Welcome to IMS Internship Program</h2>
        <p>Your intern account has been created.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${tempPassword}</p>
        <p>Please change your password after login.</p>
      `
    )

    res.status(201).json({
      success: true,
      message: "Intern created and email sent"
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Server Error Wille Creating Intern"
    })
  }
}

export const refundPayment = async (req, res) => {
  try {
    const { enrollmentId } = req.body;

    const enrollment = await Enrollment.findById(enrollmentId)
      .populate("program");

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    // 🔐 Only paid programs
    if (enrollment.program.type !== "paid") {
      return res.status(400).json({
        message: "Refund applicable only for paid programs"
      });
    }

    if (enrollment.status !== "completed") {
      return res.status(400).json({
        message: "Internship must be completed before refund"
      });
    }

    if (enrollment.paymentStatus !== "paid") {
      return res.status(400).json({
        message: "Payment not eligible for refund"
      });
    }

    // 🔥 Call Razorpay refund API
    const refund = await razorpay.payments.refund(
      enrollment.paymentId,
      {
        amount: enrollment.program.price * 100
      }
    );

    enrollment.paymentStatus = "refunded";
    await enrollment.save();

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      refund
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

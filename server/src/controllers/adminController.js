import mongoose, { isValidObjectId } from "mongoose";
import User from "../models/User.js";
import InternshipProgram from "../models/InternshipProgram.js";
import razorpay from "../utils/razorpay.js";
import crypto from "crypto"
import { sendEmail } from "../utils/sendEmail.js"
import Enrollment from "../models/Enrollment.js";
import Payment from "../models/Payment.js";
import CompanyWallet from "../models/CompanyWallet.js";
import { generateTempPassword } from "../utils/generatePassword.js";
import Review from "../models/Review.js";
import { exportToFile } from "../utils/export.util.js";


export const getAdminDashboard = async (req, res) => {
  try {
    const companyId = req.user.company;

    // Intern stats
    const totalInterns = await User.countDocuments({
      role: "intern",
      company: companyId
    });

    const activeInterns = await User.countDocuments({
      role: "intern",
      company: companyId,
      isActive: true
    });

    // Mentor stats
    const totalMentors = await User.countDocuments({
      role: "mentor",
      company: companyId
    });

    // Program stats
    const totalPrograms = await InternshipProgram.countDocuments({
      company: companyId
    });

    const activePrograms = await InternshipProgram.countDocuments({
      company: companyId,
      status: "active"
    });

    const completedPrograms = await InternshipProgram.countDocuments({
      company: companyId,
      status: "completed"
    });

    return res.status(200).json({
      success: true,
      dashboard: {
        totalInterns,
        activeInterns,
        inactiveInterns: totalInterns - activeInterns,
        totalMentors,
        totalPrograms,
        activePrograms,
        completedPrograms
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard data"
    });
  }
};

// GET ALL INTERNS (with Pagination & Search)
export const getAllInterns = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const searchFilter = {
      role: "intern",
      company: req.user.company,
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    const total = await User.countDocuments(searchFilter);
    const interns = await User.find(searchFilter)
      .select("name email isActive")
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean for performance

    // Fetch enrollments for these specific interns only
    const internIds = interns.map(i => i._id);
    const enrollments = await Enrollment.find({ intern: { $in: internIds } })
      .populate("mentor", "name")
      .select("intern mentor status");

    const enrollmentMap = {};
    enrollments.forEach(e => {
      enrollmentMap[e.intern.toString()] = {
        mentor: e.mentor,
        status: e.status
      };
    });

    const finalInterns = interns.map(i => ({
      ...i,
      mentor: enrollmentMap[i._id.toString()]?.mentor || null,
      enrollmentStatus: enrollmentMap[i._id.toString()]?.status || null
    }));

    res.json({
      success: true,
      interns: finalInterns,
      totalPages: Math.ceil(total / limit),
      total,
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// EXPORT INTERNS (Using your helper file)
export const exportInterns = async (req, res) => {
  try {
    const { search = "", format = "excel" } = req.query;

    const filter = {
      role: "intern",
      company: req.user.company,
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    const interns = await User.find(filter).select("name email isActive").lean();
    // ❌ CHECK IF DATA EXISTS
    if (!interns || interns.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No intern data found to export"
      });
    }
    // Format data for the export helper
    const data = interns.map(i => ({
      name: i.name,
      email: i.email,
      status: i.isActive ? "Active" : "Locked"
    }));

    const columns = [
      { header: "Full Name", key: "name", width: 30 },
      { header: "Email Address", key: "email", width: 40 },
      { header: "Status", key: "status", width: 15 }
    ];

    // Call your helper function
    return await exportToFile({
      res,
      data,
      format,
      fileName: `Interns_Report_${new Date().toISOString().split('T')[0]}`,
      columns
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// GET ALL MENTORS (with Pagination & Search)
export const getAllMentors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    // 1. Search Filter
    const filter = {
      role: "mentor",
      company: req.user.company,
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    const total = await User.countDocuments(filter);
    const mentors = await User.find(filter)
      .select("name email isActive")
      .skip(skip)
      .limit(limit)
      .lean();

    // 2. Aggregation for Stats (Efficient way)
    const mentorIds = mentors.map(m => m._id);
    const enrollments = await Enrollment.find({ mentor: { $in: mentorIds } });

    const mentorStats = {};
    enrollments.forEach(e => {
      const mId = e.mentor.toString();
      if (!mentorStats[mId]) {
        mentorStats[mId] = { total: 0, active: 0, completed: 0 };
      }
      mentorStats[mId].total += 1;
      if (["in_progress", "approved"].includes(e.status)) mentorStats[mId].active += 1;
      if (e.status === "completed") mentorStats[mId].completed += 1;
    });

    const finalMentors = mentors.map(m => ({
      ...m,
      internCount: mentorStats[m._id]?.total || 0,
      activeInternships: mentorStats[m._id]?.active || 0,
      completedInternships: mentorStats[m._id]?.completed || 0
    }));

    res.json({
      success: true,
      mentors: finalMentors,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getCompanyReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const rating = parseInt(req.query.rating)
    const skip = (page - 1) * limit;

    let filter = {
      company: req.user.company,
      status: "approved"
    }

    // Filter by rating (e.g., 5 stars and above, or exact)
    if (rating) {
      filter.rating = { $gte: Number(rating) };
    }
    const reviews = await Review.find(filter)
      .populate("intern", "name")
      .populate("program", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Review.countDocuments(filter);

    res.json({
      success: true,
      reviews,
      totalPages: Math.ceil(total / limit),
      total
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
// EXPORT MENTORS (Using your helper file)
export const exportMentors = async (req, res) => {
  try {
    const { search = "", format = "excel" } = req.query;

    const filter = {
      role: "mentor",
      company: req.user.company,
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    const mentors = await User.find(filter).select("name email isActive").lean();
    // ❌ CHECK IF DATA EXISTS
    if (!mentors || mentors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No mentor data found to export"
      });
    }
    // Format for the helper
    const data = mentors.map(m => ({
      name: m.name,
      email: m.email,
      status: m.isActive ? "Active" : "Locked"
    }));

    const columns = [
      { header: "Mentor Name", key: "name", width: 30 },
      { header: "Email Address", key: "email", width: 40 },
      { header: "Status", key: "status", width: 15 }
    ];

    return await exportToFile({
      res,
      data,
      format,
      fileName: `Mentors_List`,
      columns
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
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
    if (mentor.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      })
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
    if (!intern || intern.role !== "intern") {
      return res.status(404).json({ success: false, message: "Intern Not Found" })
    }

    if (intern.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
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

    const exists = await InternshipProgram.findOne({ title, company: req.user.company });
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
      endDate,
      company: req.user.company
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const result = await InternshipProgram.aggregate([
      // 1. Filter by Company
      { $match: { company: req.user.company } },

      // 2. Search Filter (Title, Domain, or Status)
      {
        $match: {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { domain: { $regex: search, $options: "i" } },
            { status: { $regex: search, $options: "i" } },
          ],
        }
      },

      // 3. Facet for Pagination & Total Count
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $lookup: { from: "users", localField: "mentor", foreignField: "_id", as: "mentor" } },
            { $unwind: { path: "$mentor", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: "tasks", localField: "_id", foreignField: "program", as: "tasks" } },
            { $addFields: { totalTasks: { $size: "$tasks" } } },
            { $project: { tasks: 0, "mentor.password": 0, "mentor.__v": 0 } },
            { $sort: { createdAt: -1 } }, // Newest first
            { $skip: skip },
            { $limit: limit }
          ]
        }
      }
    ]);

    const programs = result[0].data;
    const total = result[0].metadata[0]?.total || 0;

    res.status(200).json({
      success: true,
      programs,
      totalPages: Math.ceil(total / limit),
      total
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// EXPORT PROGRAMS
export const exportPrograms = async (req, res) => {
  try {
    const { search = "", format = "excel" } = req.query;

    const filter = {
      company: req.user.company,
      $or: [
        { title: { $regex: search, $options: "i" } },
        { domain: { $regex: search, $options: "i" } },
      ],
    };

    const programs = await InternshipProgram.find(filter)
      .populate("mentor", "name")
      .lean();

    if (!programs.length) {
      return res.status(404).json({ success: false, message: "No programs to export" });
    }

    const data = programs.map(p => ({
      title: p.title,
      domain: p.domain,
      mentor: p.mentor?.name || "N/A",
      status: p.status,
      type: p.type,
      price: p.type === 'free' ? 'Free' : `₹${p.price}`
    }));

    const columns = [
      { header: "Program Title", key: "title", width: 30 },
      { header: "Domain", key: "domain", width: 20 },
      { header: "Mentor", key: "mentor", width: 25 },
      { header: "Status", key: "status", width: 15 },
      { header: "Price", key: "price", width: 15 }
    ];

    return await exportToFile({ res, data, format, fileName: `Programs_Report`, columns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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

    if (program.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" })
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

    if (program.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
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

export const getAvailableInterns = async (req, res) => {
  try {
    const companyId = req.user.company;

    // All active interns of this company
    const interns = await User.find({
      role: "intern",
      isActive: true,
      company: companyId
    });

    // Get enrollments for active/upcoming programs
    const enrollments = await Enrollment.find({
      status: { $in: ["approved", "in_progress", "completed"] }
    }).populate({
      path: "program",
      match: {
        company: companyId,
        status: { $in: ["upcoming", "active"] }
      },
      select: "_id"
    });

    const enrolledInternIds = new Set();

    enrollments.forEach(e => {
      if (e.program) {
        enrolledInternIds.add(e.intern.toString());
      }
    });

    const availableInterns = interns.filter(
      intern => !enrolledInternIds.has(intern._id.toString())
    );

    res.status(200).json({
      success: true,
      interns: availableInterns
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching available interns"
    });
  }
};



export const createMentor = async (req, res) => {
  try {
    const { name, email } = req.body

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ success: false, message: "User already exists" })
    }

    const tempPassword = generateTempPassword();
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
        <p>Please change your password after first login.</p>
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

    const tempPassword = generateTempPassword()
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
        <p>Please change your password after first login.</p>
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

    // 1️⃣ Find enrollment with program & payment
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate("program")
      .populate("payment");

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found"
      });
    }

    const payment = enrollment.payment;

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    // 2️⃣ Ownership check
    if (
      enrollment.program.company.toString() !==
      req.user.company.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not your company program"
      });
    }

    // 3️⃣ Validate program type
    if (enrollment.program.type !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Refund applicable only for paid programs"
      });
    }

    // 4️⃣ Internship must be completed
    if (enrollment.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Internship must be completed before refund"
      });
    }

    // 5️⃣ Payment eligibility checks
    if (enrollment.paymentStatus !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment not eligible for refund"
      });
    }

    if (payment.paymentStatus !== "success") {
      return res.status(400).json({
        success: false,
        message: "Payment not eligible for refund"
      });
    }

    // 6️⃣ Find company wallet properly
    const wallet = await CompanyWallet.findOne({
      company: enrollment.program.company
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Company wallet not found"
      });
    }

    // 🔒 Safety check: ensure funds available
    if (wallet.availableBalance < payment.companyEarning) {
      return res.status(400).json({
        success: false,
        message: "Refund not possible. Funds already withdrawn."
      });
    }

    // 7️⃣ Call Razorpay refund
    const refund = await razorpay.payments.refund(
      payment.transactionId,
      {
        amount: payment.totalAmount * 100 // safest way
      }
    );

    // 8️⃣ Reverse financial impact

    // Update enrollment
    enrollment.paymentStatus = "refunded";
    await enrollment.save();

    // Update payment
    payment.paymentStatus = "refunded";
    await payment.save();

    // Reverse wallet earnings
    wallet.availableBalance -= payment.companyEarning;
    wallet.totalEarning -= payment.companyEarning;
    await wallet.save();

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

export const getAdminFinanceOverview = async (req, res) => {
  try {
    const { commission, startDate, endDate, page = 1, limit = 2 } = req.query
    const companyId = req.user.company

    let filter = {
      paymentStatus: "success",
      company: new mongoose.Types.ObjectId(companyId)
    }
    // Filter by commission %
    if (commission) {
      filter.commissionPercentage = Number(commission)
    }
    const totalCount = await Payment.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    // Filter by date range
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }

    const payments = await Payment.find(filter)
      .populate("intern", "name email")
      .populate("program", "title price")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const allPaymentsForStats = await Payment.find(filter);
    const totalRevenue = allPaymentsForStats.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalCommission = allPaymentsForStats.reduce((sum, p) => sum + p.superAdminCommission, 0);
    const totalCompanyEarning = allPaymentsForStats.reduce((sum, p) => sum + p.companyEarning, 0);

    const breakdown = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$commissionPercentage",
          totalRevenue: { $sum: "$totalAmount" },
          totalCommission: { $sum: "$superAdminCommission" },
          totalEarning: { $sum: "$companyEarning" },
          totalTransactions: { $sum: 1 }
        }
      }
    ])

    res.json({
      success: true,
      summary: {
        totalRevenue,
        totalCommission,
        totalCompanyEarning,
        totalTransactions: totalCount
      },
      transactions: payments,
      commissionBreakdown: breakdown,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalCount
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const exportFinanceReport = async (req, res) => {
  try {
    const { commission, startDate, endDate, format = "excel" } = req.query;
    const companyId = req.user.company;

    let filter = {
      paymentStatus: "success",
      company: new mongoose.Types.ObjectId(companyId)
    };

    if (commission) filter.commissionPercentage = Number(commission);
    if (startDate && endDate) {
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // Fetch ALL matching transactions for the report
    const payments = await Payment.find(filter)
      .populate("intern", "name")
      .populate("program", "title")
      .sort({ createdAt: -1 });

    // Map data to flat objects for Excel/PDF
    const reportData = payments.map((p) => ({
      intern: p.intern?.name || "N/A",
      program: p.program?.title || "N/A",
      amount: `₹${p.totalAmount}`,
      commission: `₹${p.superAdminCommission}`,
      rate: `${p.commissionPercentage}%`,
      earning: `₹${p.companyEarning}`,
      method: p.paymentMethod,
      date: new Date(p.createdAt).toLocaleDateString("en-IN"),
    }));

    const columns = [
      { header: "Intern Name", key: "intern", width: 25 },
      { header: "Program", key: "program", width: 30 },
      { header: "Total Amount", key: "amount", width: 15 },
      { header: "Platform Fee", key: "commission", width: 15 },
      { header: "Rate", key: "rate", width: 10 },
      { header: "Net Earning", key: "earning", width: 15 },
      { header: "Method", key: "method", width: 15 },
      { header: "Date", key: "date", width: 15 },
    ];

    await exportToFile({
      res,
      data: reportData,
      format,
      fileName: `Finance_Report_${new Date().getTime()}`,
      columns,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportCompanyReviews = async (req, res) => {
  try {
    const { rating, format = "excel" } = req.query;
    const companyId = req.user.company;

    let filter = { company: companyId, status: "approved" };

    // Filter by rating (e.g., 5 stars and above, or exact)
    if (rating) {
      filter.rating = { $gte: Number(rating) };
    }

    const reviews = await Review.find(filter)
      .populate("intern", "name")
      .populate("program", "title")
      .sort({ createdAt: -1 });

    const reportData = reviews.map((r) => ({
      intern: r.intern?.name || "N/A",
      program: r.program?.title || "N/A",
      rating: `${r.rating} Stars`,
      comment: r.comment || "No comment",
      date: new Date(r.createdAt).toLocaleDateString("en-IN"),
    }));

    const columns = [
      { header: "Intern Name", key: "intern", width: 25 },
      { header: "Program", key: "program", width: 30 },
      { header: "Rating", key: "rating", width: 15 },
      { header: "Comment", key: "comment", width: 40 },
      { header: "Date", key: "date", width: 15 },
    ];

    await exportToFile({
      res,
      data: reportData,
      format,
      fileName: `Reviews_Report_${new Date().getTime()}`,
      columns,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
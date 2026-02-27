import Enrollment from "../models/Enrollment.js"
import Task from "../models/Task.js"
import { isValidObjectId } from "mongoose";
import User from "../models/User.js";
import Payment from '../models/Payment.js'

export const getMyProgram = async (req, res) => {
  try {
    const enrollement = await Enrollment.find({
      intern: req.user._id
    }).populate({
      path: "program",
      select: "title domain description type price durationInWeeks startDate endDate"
    }).populate({
      path: "mentor",
      select: "name email"
    })
    const validEnrollments = enrollement.filter(
      (e) => e.program !== null
    );

    res.status(200).json({
      success: true,
      enrollement: validEnrollments
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const startInternship = async (req, res) => {
  try {
    const { enrollmentId } = req.body
    // Find enrollment
    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      intern: req.user._id
    }).populate("program")

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found"
      })
    }

    // Check current status
    if (enrollment.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Internship cannot be started"
      })
    }

    // If program is paid → check payment
    if (
      enrollment.program.type === "paid" &&
      enrollment.paymentStatus !== "paid"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment required before starting internship"
      })
    }

    // Update status
    enrollment.status = "in_progress"
    await enrollment.save();

    res.status(200).json({
      success: true,
      message: "Internship started successfully",
      enrollment
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Get Intern Task
export const getMyTask = async (req, res) => {
  try {
    const internId = req.user.id;

    if (req.user.role !== "intern") {
      return res.status(403).json({
        success: false,
        message: "Only interns can access tasks"
      });
    }

    const intern = await User.findById(internId);

    if (!intern) {
      return res.status(404).json({
        success: false,
        message: "Intern not found"
      });
    }

    if (!intern.isActive) {
      return res.status(403).json({
        success: false,
        message: "Intern is not activated yet"
      });
    }

    // 🔐 find programs where intern is enrolled
    const enrollments = await Enrollment.find({
      intern: internId,
      status: { $in: ["approved", "in_progress", "completed"] }
    }).select("program");

    const programIds = enrollments.map(e => e.program);

    const tasks = await Task.find({
      assignedIntern: internId,
      program: { $in: programIds }
    })
      .populate("program", "title domain")
      .populate("mentor", "name email")
      .sort({ createdAt: -1 });

    if (!tasks.length) {
      return res.status(404).json({
        success: false,
        message: "No tasks assigned yet"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      tasks
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching tasks"
    });
  }
}

// Submit task
export const submitTask = async (req, res) => {
  try {
    const internId = req.user.id;
    const { taskId } = req.params;
    const { submissionText, submissionLink, submissionFile } = req.body;

    if (!isValidObjectId(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task id"
      });
    }

    if (!submissionText && !submissionLink && !submissionFile) {
      return res.status(400).json({
        success: false,
        message: "At least one submission field is required"
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // 🔐 ownership check
    if (task.assignedIntern.toString() !== internId) {
      return res.status(403).json({
        success: false,
        message: "Task not assigned to this intern"
      });
    }

    // 🔐 program enrollment check
    const enrollment = await Enrollment.findById(task.enrollment);

    if (!enrollment || enrollment.status !== "in_progress") {
      return res.status(403).json({
        success: false,
        message: "Internship not active"
      });
    }

    if (task.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Task already submitted"
      });
    }

    // Late submission
    if (new Date() > task.deadline) {
      task.isLate = true;
    }

    task.submissionText = submissionText;
    task.submissionLink = submissionLink;
    task.submissionFile = submissionFile;
    task.submittedAt = new Date();
    task.attempts += 1;
    task.status = "submitted";
    task.reviewStatus = "pending";
    task.score = undefined;          // ✅ REQUIRED
    task.feedback = undefined;       // ✅ REQUIRED
    task.reviewedAt = null;          // ✅ REQUIRED

    await task.save();

    return res.status(200).json({
      success: true,
      message: "Task submitted successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while submitting task"
    });
  }
}
export const getInternPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({
      intern: req.user._id,
      paymentStatus: "success"
    })
      .populate("program", "title")
      .populate("company", "name")
      .sort({ createdAt: -1 });

    if (!payments.length) {
      return res.status(200).json({
        success: true,
        summary: {
          totalPaid: 0,
          totalProgramsPurchased: 0,
          lastPaymentDate: null
        },
        payments: []
      });
    }

    const transactions = payments.map(payment => ({
      paymentId: payment._id,
      programTitle: payment.program?.title || "N/A",
      companyName: payment.company?.name || "N/A",
      amount: payment.totalAmount,
      paymentMethod: payment.paymentMethod,
      status: payment.paymentStatus,
      transactionId: payment.transactionId,
      createdAt: payment.createdAt
    }));

    const totalPaid = payments.reduce(
      (sum, p) => sum + p.totalAmount,
      0
    );

    const totalProgramsPurchased = payments.length;

    const lastPaymentDate = payments[0].createdAt;

    res.status(200).json({
      success: true,
      summary: {
        totalPaid,
        totalProgramsPurchased,
        lastPaymentDate
      },
      payments: transactions
    });

  } catch (error) {
    res.status(500).json({  
      success: false,
      message: error.message
    });
  }
};
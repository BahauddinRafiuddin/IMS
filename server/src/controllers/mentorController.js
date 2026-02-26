import Enrollment from "../models/Enrollment.js";
import Task from "../models/Task.js";
import { isValidObjectId } from "mongoose"
import InternshipProgram from "../models/InternshipProgram.js"
import User from "../models/User.js"

export const completeInternshipByMentor = async (req, res) => {
  try {
    const { enrollmentId } = req.body
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate("program");

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    if (enrollment.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this internship"
      });
    }

    if (enrollment.status !== "in_progress") {
      return res.status(400).json({ message: "Internship not in progress" });
    }

    const approvedTasks = await Task.countDocuments({
      assignedIntern: enrollment.intern,
      program: enrollment.program._id,
      status: "approved"
    })


    if (approvedTasks < enrollment.program.minimumTasksRequired) {
      return res.status(400).json({
        message: `Minimum ${enrollment.program.minimumTasksRequired} approved tasks required`
      })
    }
    enrollment.status = "completed";
    enrollment.completedAt = new Date();

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: "Internship marked as completed"
    })
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const createTask = async (req, res) => {
  try {
    const { title, description, programId, internId, priority, deadline } =
      req.body;

    const mentorId = req.user?.id;

    // 1️⃣ Mentor check
    if (!mentorId || req.user.role !== "mentor") {
      return res.status(401).json({
        success: false,
        message: "Only mentor can create tasks"
      });
    }

    // 2️⃣ Required fields
    if (!title || !programId || !internId || !deadline) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    // 3️⃣ Validate IDs
    if (!isValidObjectId(programId) || !isValidObjectId(internId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid program or intern id"
      });
    }

    // 4️⃣ Program check
    const program = await InternshipProgram.findById(programId);
    if (!program) {
      return res.status(400).json({
        success: false,
        message: "Program does not exist"
      });
    }

    // 5️⃣ Mentor ownership check
    if (program.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // 6️⃣ Intern check
    const intern = await User.findById(internId);
    if (!intern || intern.role !== "intern") {
      return res.status(404).json({
        success: false,
        message: "Intern not found"
      });
    }

    if (!intern.isActive) {
      return res.status(403).json({
        success: false,
        message: "Intern is not active"
      });
    }

    // 7️⃣ Intern enrollment check
    const enrollment = await Enrollment.findOne({
      program: programId,
      intern: internId,
      mentor: mentorId
    });

    if (!enrollment || enrollment.status !== "in_progress") {
      return res.status(403).json({
        success: false,
        message: "Intern not actively enrolled in this program"
      });
    }

    // 8️⃣ Deadline validation
    if (new Date(deadline) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Deadline must be a future date"
      });
    }

    // 9️⃣ Create task
    const task = await Task.create({
      title,
      description,
      program: programId,
      mentor: mentorId,
      assignedIntern: internId,
      priority,
      deadline,
      enrollment: enrollment._id,
      assignedAt: new Date()
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while creating task"
    });
  }
}

export const reviewTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const mentorId = req.user.id;
    const { feedback, score, status } = req.body;

    // VALIDATIONS
    if (!isValidObjectId(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task id"
      });
    }
    if (req.user.role !== "mentor") {
      return res.status(403).json({
        success: false,
        message: "Only mentor can review tasks"
      });
    }

    const mentor = await User.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found"
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // mentor ownership
    if (task.mentor.toString() !== mentorId) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this task"
      });
    }

    // // already reviewed
    // if (task.reviewStatus === "reviewed") {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Task already reviewed"
    //   });
    // }

    // must be submitted
    if (task.status !== "submitted") {
      return res.status(400).json({
        success: false,
        message: "Task not submitted yet"
      });
    }

    const enrollment = await Enrollment.findOne({
      intern: task.assignedIntern,
      program: task.program
    });

    if (!enrollment || enrollment.status !== "in_progress") {
      return res.status(400).json({
        message: "Internship not active"
      });
    }

    // AUTO REVIEW LOGIC

    let finalStatus = "approved";
    let finalScore = 8;
    let finalFeedback = "Good work";

    if (task.isLate) {
      finalStatus = "rejected";
      finalScore = 2;
      finalFeedback = "Late submission";
    }
    else if (task.attempts > 2) {
      finalStatus = "rejected";
      finalScore = 5;
      finalFeedback = "Too many attempts";
    }

    // mentor override
    if (status && ["approved", "rejected"].includes(status)) {
      finalStatus = status;
    }

    if (score !== undefined) {
      if (score < 0 || score > 10) {
        return res.status(400).json({
          success: false,
          message: "Score must be between 0 and 10"
        });
      }
      finalScore = score;
    }

    if (feedback) {
      finalFeedback = feedback;
    }

    // SAVE

    task.status = finalStatus;
    task.score = finalScore;
    task.feedback = finalFeedback;
    task.reviewStatus = "reviewed";
    task.reviewedAt = new Date();

    await task.save();

    return res.status(200).json({
      success: true,
      message: "Task reviewed successfully",
      updatedTask: task
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error while reviewing task"
    });
  }
}

export const getMentorInterns = async (req, res) => {
  try {
    const mentorId = req.user.id;

    const mentor = await User.findById(mentorId);

    if (!mentor || mentor.role !== "mentor") {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    const enrollments = await Enrollment.find({
      mentor: mentorId,
      status: { $in: ["approved", "in_progress"] }
    })
      .populate("intern", "name email")
      .populate("program", "title domain durationInWeeks startDate endDate status")

    if (!enrollments.length) {
      return res.status(404).json({ success: false, message: "No Interns Found" })
    }
    return res.status(200).json({
      success: true,
      interns: enrollments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while Fetching mentors Interns"
    });
  }
}

export const getMentorDashboard = async (req, res) => {
  try {
    const mentorId = req.user.id;

    const mentor = await User.findById(mentorId);

    if (!mentor || mentor.role !== "mentor") {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    // Programs
    const programs = await InternshipProgram.find({
      mentor: mentorId,
      company: req.user.company
    });

    const totalPrograms = programs.length;

    const activePrograms = programs.filter(
      p => p.status === "active"
    ).length;

    // Intern count (unique)
    const totalInterns = await Enrollment.countDocuments({
      mentor: mentorId
    })

    // Tasks
    const tasks = await Task.find({ mentor: mentorId })
      .populate("program", "title")
      .sort({ createdAt: -1 })

    const totalTasks = tasks.length;

    const pendingReviews = tasks.filter(
      t => t.reviewStatus === "pending" && t.status === "submitted"
    ).length;

    const approvedTasks = tasks.filter(
      t => t.status === "approved"
    ).length;

    const rejectedTasks = tasks.filter(
      t => t.status === "rejected"
    ).length;

    // Recent Data
    const recentTasks = tasks.slice(0, 5);

    const recentPrograms = programs
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 3);

    // ===============================
    // RESPONSE
    // ===============================
    return res.status(200).json({
      success: true,
      dashboard: {
        totalPrograms,
        activePrograms,
        totalInterns,
        totalTasks,
        pendingReviews,
        approvedTasks,
        rejectedTasks
      },
      recentPrograms,
      recentTasks
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching mentor dashboard"
    });
  }
}

export const getMentorPrograms = async (req, res) => {
  try {
    const mentorId = req.user.id;

    const mentor = await User.findById(mentorId);

    if (!mentor || mentor.role !== "mentor") {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    // Programs
    const programs = await InternshipProgram.find({
      mentor: mentorId,
      company: req.user.company
    })

    if (!programs.length) {
      return res.status(404).json({ success: false, message: "No Programs Found" })
    }

    const programsWithInterns = await Promise.all(
      programs.map(async (program) => {
        const enrollments = await Enrollment.find({
          program: program._id,
          mentor: mentorId,
          // status: "in_progress"
        }).populate("intern", "name email");

        return {
          ...program.toObject(),
          interns: enrollments
        };
      })
    );

    return res.status(200).json({ success: true, message: "Mentor Programs Found Successfully", programs: programsWithInterns })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching mentor programs"
    });
  }
}

export const getMentorTasks = async (req, res) => {
  try {
    const mentorId = req.user.id;

    const mentor = await User.findById(mentorId);

    if (!mentor || mentor.role !== "mentor") {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    const mentorTasks = await Task.find({ mentor: mentorId }).populate("assignedIntern", "name email")
    if (!mentorTasks.length) {
      return res.status(404).json({ success: false, message: "No tasks Found" })
    }
    const totalTasks = mentorTasks.length
    const pendingReviews = mentorTasks.filter(
      t => t.reviewStatus === "pending" && t.status === "submitted"
    ).length;

    const approvedTasks = mentorTasks.filter(
      t => t.status === "approved"
    ).length;

    const rejectedTasks = mentorTasks.filter(
      t => t.status === "rejected"
    ).length;

    const lateSubmissions = mentorTasks.filter(
      (t) => t.isLate === true
    ).length;


    return res.status(200).json({
      success: true,
      message: "tasks found successfully",
      mentorTasks: mentorTasks,
      stats: {
        totalTasks,
        pendingReviews,
        rejectedTasks,
        lateSubmissions, approvedTasks
      }
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching mentor tasks"
    });
  }
}

export const getInternPerformance = async (req, res) => {
  try {
    const mentorId = req.user.id;

    const tasks = await Task.find({ mentor: mentorId })
      .populate("assignedIntern", "name email")
      .populate("program", "title");

    const performanceMap = {};

    tasks.forEach(task => {
      const internId = task.assignedIntern._id.toString();

      if (!performanceMap[internId]) {
        performanceMap[internId] = {
          intern: task.assignedIntern,
          program: task.program,
          totalTasks: 0,
          submitted: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
          late: 0,
          totalScore: 0,
          scoredTasks: 0,
          attempts: 0
        };
      }

      const p = performanceMap[internId];

      p.totalTasks++;
      p.attempts += task.attempts || 0;

      if (task.isLate) p.late++;

      if (task.status === "submitted") p.submitted++;
      if (task.status === "approved") {
        p.approved++;
        if (task.score !== undefined) {
          p.totalScore += task.score;
          p.scoredTasks++;
        }
      }
      if (task.status === "rejected") p.rejected++;
      if (task.status === "pending") p.pending++;
    });

    const result = Object.values(performanceMap).map(p => {
      const avgScore =
        p.scoredTasks === 0
          ? 0
          : (p.totalScore / p.scoredTasks).toFixed(1);

      const completion =
        p.totalTasks === 0
          ? 0
          : Math.round((p.approved / p.totalTasks) * 100);

      let grade = "Poor";
      if (avgScore >= 8) grade = "Excellent";
      else if (avgScore >= 6) grade = "Good";

      return {
        ...p,
        averageScore: Number(avgScore),
        completion,
        grade
      };
    });

    res.status(200).json({
      success: true,
      interns: result
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch intern performance"
    });
  }
}
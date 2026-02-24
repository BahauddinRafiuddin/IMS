import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,

  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InternshipProgram",
    required: true
  },

  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  assignedIntern: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },

  status: {
    type: String,
    enum: ["pending", "in_progress", "submitted", "approved", "rejected"],
    default: "pending"
  },

  deadline: {
    type: Date,
    required: true
  },

  assignedAt: {
    type: Date,
    default: Date.now
  },

  submittedAt: Date,

  reviewedAt: Date,

  submissionText: String,

  submissionLink: String,

  submissionFile: String,

  feedback: String,

  score: {
    type: Number,
    min: 0,
    max: 10
  },

  reviewStatus: {
    type: String,
    enum: ["pending", "reviewed"],
    default: "pending"
  },

  isLate: {
    type: Boolean,
    default: false
  },

  attempts: {
    type: Number,
    default: 0
  },
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Enrollment",
    required: true
  }

}, { timestamps: true });


export default mongoose.model("Task", taskSchema);

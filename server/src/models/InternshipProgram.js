import mongoose from "mongoose";

const internshipProgramSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true,
    trim: true
  },

  domain: {
    type: String,
    enum: [
      "Web Development",
      "Backend Development",
      "Frontend Development",
      "AI / ML",
      "Data Science",
      "Mobile App Development"
    ],
    required: true
  },

  description: {
    type: String
  },

  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },

  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  type: {
    type: String,
    enum: ["free", "paid"],
    default: "free"
  },

  price: {
    type: Number,
    default: 0
  },

  startDate: Date,

  endDate: Date,

  durationInWeeks: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ["draft", "active", "completed", "upcoming"],
    default: "upcoming"
  },
  minimumTasksRequired: {
    type: Number,
    default: 5
  },
  rules: String,

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

export default mongoose.model("InternshipProgram", internshipProgramSchema);
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  intern: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },

  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InternshipProgram",
    required: true
  },

  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Enrollment",
    required: true,
    unique: true
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  comment: {
    type: String,
    trim: true
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "approved"
  }

}, { timestamps: true });

export default mongoose.model("Review", reviewSchema);
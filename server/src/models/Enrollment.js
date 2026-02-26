import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  intern: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InternshipProgram",
    required: true
  },

  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  status: {
    type: String,
    enum: ["cancelled", "approved", "in_progress", "completed"],
    default: "approved"
  },

  paymentStatus: {
    type: String,
    enum: ["not_required", "pending", "paid", "refunded"],
    default: "not_required"
  },

  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment"
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },

  completedAt: Date


}, { timestamps: true });

enrollmentSchema.index({ intern: 1, program: 1 }, { unique: true });

export default mongoose.model("Enrollment", enrollmentSchema);
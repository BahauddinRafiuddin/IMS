import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
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
    required: true
  },

  totalAmount: {
    type: Number,
    required: true
  },

  superAdminCommission: {
    type: Number,
    required: true
  },

  companyEarning: {
    type: Number,
    required: true
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending"
  },

  transactionId: String,
  paymentMethod: String

}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
import mongoose from "mongoose";

const commissionHistorySchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },

  commissionPercentage: {
    type: Number,
    required: true
  },

  startDate: {
    type: Date,
    required: true
  },

  endDate: {
    type: Date,
    default: null
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

export default mongoose.model("CommissionHistory", commissionHistorySchema);
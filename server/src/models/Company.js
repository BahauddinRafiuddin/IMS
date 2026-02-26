import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  phone: String,
  address: String,
  commissionPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 20
  },
  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

export default mongoose.model("Company", companySchema);
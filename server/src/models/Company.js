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
  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

export default mongoose.model("Company", companySchema);
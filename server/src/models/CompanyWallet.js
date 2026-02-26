import mongoose from "mongoose";
const companyWalletSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },

  totalEarning: { type: Number, default: 0 },
  totalWithdrawn: { type: Number, default: 0 },
  availableBalance: { type: Number, default: 0 }

}, { timestamps: true });

export default mongoose.model("CompanyWallet", companyWalletSchema)
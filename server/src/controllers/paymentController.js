import CompanyWallet from "../models/CompanyWallet.js";
import Enrollment from "../models/Enrollment.js";
import Payment from "../models/Payment.js";
import razorpay from "../utils/razorpay.js";
import crypto from 'crypto'

export const createPaymentOrder = async (req, res) => {
  try {
    const { enrollmentId } = req.body;

    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      intern: req.user._id
    }).populate("program")

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" })
    }

    if (enrollment.program.type !== "paid") {
      return res.status(400).json({ message: "This program is free" })
    }

    if (enrollment.paymentStatus === "paid") {
      return res.status(400).json({ message: "Already paid" })
    }

    const options = {
      amount: enrollment.program.price * 100, // convert to paisa
      currency: "INR",
      receipt: `receipt_${enrollment._id}`
    }

    const order = await razorpay.orders.create(options)
    res.status(200).json({
      success: true,
      order
    })
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      enrollmentId
    } = req.body

    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      })
    }

    // ✅ Signature verified → update enrollment
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate({
        path: "program",
        populate: { path: "company" }
      })

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" })
    }
    if (enrollment.paymentStatus === "paid") {
      return res.status(400).json({ message: "Already paid" })
    }

    const program = enrollment.program
    const company = program.company
    const amount = program.price

    // ✅ Commission Calculation
    const commissionPercent = company.commissionPercentage

    const superAdminCommission =
      (amount * commissionPercent) / 100

    const companyEarning =
      amount - superAdminCommission

    // ✅ Create Payment Record
    const payment = await Payment.create({
      intern: enrollment.intern,
      company: company._id,
      program: program._id,
      enrollment: enrollment._id,
      totalAmount: amount,
      superAdminCommission,
      companyEarning,
      paymentStatus: "success",
      transactionId: razorpay_payment_id,
      paymentMethod: "razorpay"
    })

    // ✅ Update Enrollment
    enrollment.paymentStatus = "paid"
    enrollment.payment = payment._id
    await enrollment.save()

    // ✅ Update Company Wallet
    let wallet = await CompanyWallet.findOne({ company: company._id })

    if (!wallet) {
      wallet = await CompanyWallet.create({
        company: company._id,
        totalEarning: 0,
        totalWithdrawn: 0,
        availableBalance: 0
      })
    }

    wallet.totalEarning += companyEarning
    wallet.availableBalance += companyEarning

    await wallet.save()

    res.status(200).json({
      success: true,
      message: "Payment verified and revenue distributed successfully"
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
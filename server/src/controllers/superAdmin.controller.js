import Company from "../models/Company.js";
import User from "../models/User.js";
import CompanyWallet from '../models/CompanyWallet.js'
import Payment from '../models/Payment.js'
import mongoose from "mongoose";
import CommissionHistory from "../models/CommissionHistory.js";
import Review from "../models/Review.js";

export const getSuperAdminDashboard = async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments();

    const activeCompanies = await Company.countDocuments({
      isActive: true
    });

    const inactiveCompanies = await Company.countDocuments({
      isActive: false
    });

    const totalAdmins = await User.countDocuments({
      role: "admin"
    });

    const recentCompanies = await Company.find()
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        totalCompanies,
        activeCompanies,
        inactiveCompanies,
        totalAdmins
      },
      recentCompanies
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard"
    });
  }
}
export const getPlatformFinanceStats = async (req, res) => {
  try {
    const stats = await Payment.aggregate([
      { $match: { paymentStatus: "success" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalCommission: { $sum: "$superAdminCommission" },
          totalCompanyEarning: { $sum: "$companyEarning" },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalRevenue: 0,
        totalCommission: 0,
        totalCompanyEarning: 0,
        totalTransactions: 0
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export const getCompanyFinanceOverview = async (req, res) => {
  try {

    // Aggregate payment data company-wise
    const financeData = await Payment.aggregate([
      { $match: { paymentStatus: "success" } },

      {
        $group: {
          _id: "$company",
          totalRevenue: { $sum: "$totalAmount" },
          totalCommission: { $sum: "$superAdminCommission" },
          totalCompanyEarning: { $sum: "$companyEarning" },
          totalTransactions: { $sum: 1 }
        }
      }
    ])

    // Populate company details manually
    const result = await Promise.all(
      financeData.map(async (item) => {
        const company = await Company.findById(item._id)

        const wallet = await CompanyWallet.findOne({
          company: item._id
        })

        return {
          companyId: company._id,
          companyName: company.name,
          totalRevenue: item.totalRevenue,
          superAdminCommission: item.totalCommission,
          companyEarning: item.totalCompanyEarning,
          totalTransactions: item.totalTransactions,
          availableBalance: wallet?.availableBalance || 0
        }
      })
    )

    res.status(200).json({
      success: true,
      data: result
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
export const getSingleCompanyFinance = async (req, res) => {
  try {
    const { companyId } = req.params;

    const payments = await Payment.find({
      company: companyId,
      paymentStatus: "success"
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalCommission = payments.reduce((sum, p) => sum + p.superAdminCommission, 0);
    const totalCompanyEarning = payments.reduce((sum, p) => sum + p.companyEarning, 0);

    const wallet = await CompanyWallet.findOne({ company: companyId });

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalCommission,
        totalCompanyEarning,
        totalTransactions: payments.length,
        availableBalance: wallet?.availableBalance || 0
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const getCompanyTransactionReport = async (req, res) => {
  try {
    const { commission, startDate, endDate, companyId } = req.query

    let filter = {
      paymentStatus: "success"
    }
    // Optional company filter
    if (companyId && mongoose.Types.ObjectId.isValid(companyId)) {
      filter.company = companyId;
    }
    // Filter by commission %
    if (commission) {
      filter.commissionPercentage = Number(commission)
    }

    // Filter by date range
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const payments = await Payment.find(filter)
      .populate("intern", "name email")
      .populate("program", "title price")
      .populate("company", "name commissionPercentage")
      .sort({ createdAt: -1 });

    // Global Summary
    const totalRevenue = payments.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalCommission = payments.reduce((sum, p) => sum + p.superAdminCommission, 0);
    const totalCompanyEarning = payments.reduce((sum, p) => sum + p.companyEarning, 0);

    // Commission Breakdown (Global)
    const breakdown = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$commissionPercentage",
          totalRevenue: { $sum: "$totalAmount" },
          totalCommission: { $sum: "$superAdminCommission" },
          totalTransactions: { $sum: 1 }
        }
      }
    ])
    // Company Wise Summary
    const companyWise = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$company",
          totalRevenue: { $sum: "$totalAmount" },
          totalCommission: { $sum: "$superAdminCommission" },
          totalTransactions: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "companies",
          localField: "_id",
          foreignField: "_id",
          as: "company"
        }
      },
      { $unwind: "$company" }
    ])
    res.json({
      success: true,
      summary: {
        totalRevenue,
        totalCommission,
        totalCompanyEarning,
        totalTransactions: payments.length
      },
      transactions: payments,
      companyWiseSummary: companyWise,
      commissionBreakdown: breakdown
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
export const getSingleCompanyComissionHistory = async (req, res) => {
  try {
    const { companyId } = req.params
    const history = await CommissionHistory.find({ company: companyId })
      .populate("company", "name")
      .sort({ createdAt: -1 })

    const data = history.map((item) => {

      const start = new Date(item.startDate)
      const end = item.endDate ? new Date(item.endDate) : new Date()

      const durationDays = Math.ceil(
        (end - start) / (1000 * 60 * 60 * 24)
      )
      return {
        companyId: item.company._id,
        companyName: item.company.name,
        commissionPercentage: item.commissionPercentage,
        startDate: item.startDate,
        endDate: item.endDate,
        durationDays
      }
    })
    res.json({
      success: true,
      data
    })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
export const getAllCompaniesCommissionHistory = async (req, res) => {
  try {
    const history = await CommissionHistory.find()
      .populate("company", "name")
      .sort({ createdAt: -1 })

    const data = history.map((item) => {

      const start = new Date(item.startDate)
      const end = item.endDate ? new Date(item.endDate) : new Date()

      const durationDays = Math.ceil(
        (end - start) / (1000 * 60 * 60 * 24)
      )
      return {
        companyId: item.company._id,
        companyName: item.company.name,
        commissionPercentage: item.commissionPercentage,
        startDate: item.startDate,
        endDate: item.endDate,
        durationDays
      }
    })
    res.json({
      success: true,
      data
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: "pending" })
      .populate("intern", "name")
      .populate("company", "name")
      .populate("program", "title")

    res.json({
      success: true,
      reviews
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const approveReview = async (req, res) => {
  try {
    const { reviewId } = req.params
    await Review.findByIdAndUpdate(reviewId, {
      status: "approved"
    })
    res.json({
      success: true,
      message: "Review approved"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const rejectReview = async (req, res) => {
  try {
    const { reviewId } = req.params
    await Review.findByIdAndUpdate(reviewId, {
      status: "rejected"
    })
    res.json({
      success: true,
      message: "Review rejected"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
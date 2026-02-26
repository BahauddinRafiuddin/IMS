import Company from "../models/Company.js";
import User from "../models/User.js";
import CompanyWallet from '../models/CompanyWallet.js'
import Payment from '../models/Payment.js'

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
};

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
};
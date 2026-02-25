import Company from "../models/Company.js";
import User from "../models/User.js";

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
};
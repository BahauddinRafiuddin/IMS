import User from '../models/User.js'
import Company from '../models/Company.js'

export const createCompany = async (req, res) => {
  try {
    const { name, email, phone, address, adminName, adminEmail, adminPassword } = req.body;

    // Check if company already exists
    const existingCompany = await Company.findOne({ name });
    if (existingCompany) {
      return res.status(400).json({ message: "Company already exists" });
    }

    // Create company
    const company = await Company.create({
      name,
      email,
      phone,
      address
    });

    // Create Admin for that company
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      company: company._id,
      isActive: true
    });

    return res.status(201).json({
      success: true,
      message: "Company and Admin created successfully",
      company,
      admin
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while adding company "
    })
  }
}

export const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find()
    return res.status(200).json({
      success: true,
      message: "Companies Found Successfully",
      companies
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching companies "
    })
  }
}

export const toggleCompanyStatus = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
    if (!company) return res.status(404).json({ success: false, message: "Company not found" })

    company.isActive = !company.isActive
    await company.save()

    res.json({ success: true, message: "Company status updated", company })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
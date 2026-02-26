import User from '../models/User.js'
import Company from '../models/Company.js'
import { sendEmail } from "../utils/sendEmail.js"

// export const createCompany = async (req, res) => {
//   try {
//     const { name, email, phone, address, adminName, adminEmail, adminPassword } = req.body;


//     // Check if company already exists
//     const existingCompany = await Company.findOne({ name });
//     if (existingCompany) {
//       return res.status(400).json({ message: "Company already exists" });
//     }

//     // Create company
//     const company = await Company.create({
//       name,
//       email,
//       phone,
//       address
//     });

//     // Create Admin for that company
//     const admin = await User.create({
//       name: adminName,
//       email: adminEmail,
//       password: adminPassword,
//       role: "admin",
//       company: company._id,
//       isActive: true
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Company and Admin created successfully",
//       company,
//       admin
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while adding company "
//     })
//   }
// }

export const createCompany = async (req, res) => {
  try {
    // console.log(req.body)
    const {
      name,
      email,
      phone,
      address,
      commissionPercentage,
      adminName,
      adminEmail,
      adminPassword
    } = req.body;

    // Validate required fields
    if (!name || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    // Check existing company
    const existingCompany = await Company.findOne({ name });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: "Company already exists"
      });
    }

    // Check existing admin email
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin email already in use"
      });
    }

    // Create company
    const company = await Company.create({
      name,
      email,
      phone,
      address,
      commissionPercentage
    });

    // Create Admin
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      company: company._id,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: "Company and Admin created successfully",
      company: {
        _id: company._id,
        name: company.name,
        email: company.email
      },
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email
      }
    });
    // 📧 Send Email with Credentials
    sendEmail(
      adminEmail,
      "Your IMS Admin Account Created",
      `
        <h2>Welcome to IMS Platform</h2>
        <p>Your admin account has been created successfully.</p>
        <p><strong>Company:</strong> ${name}</p>
        <p><strong>Email:</strong> ${adminEmail}</p>
        <p><strong>Password:</strong> ${adminPassword}</p>
        <p>Please login and change your password immediately.</p>
      `
    );

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while adding company"
    });
  }
};

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

    const status = company.isActive ? "active" : "inactive";

    res.json({
      success: true,
      message: `Company status updated to ${status}`,
      company
    });
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
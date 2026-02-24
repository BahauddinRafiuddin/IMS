import User from "../models/User.js"
import crypto from "crypto"
import { sendEmail } from "../utils/sendEmail.js"

export const createMentor = async (req, res) => {
  try {
    const { name, email } = req.body

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ success: false, message: "User already exists" })
    }

    const tempPassword = crypto.randomBytes(4).toString("hex")
    const mentor = await User.create({
      name,
      email,
      password: tempPassword,
      role: "mentor",
      company: req.user.company,
      isActive: true
    })

    await sendEmail(
      email,
      "Mentor Account Created",
      `
        <h2>Welcome to IMS</h2>
        <p>Your mentor account has been created.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${tempPassword}</p>
        <p>Please change your password after login.</p>
      `
    )
    res.status(201).json({
      success: true,
      message: "Mentor created and email sent"
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Server Error Wille Creating Mentor"
    })
  }
}

export const createIntern = async (req, res) => {
  try {
    const { name, email } = req.body

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const tempPassword = crypto.randomBytes(4).toString("hex")

    const intern = await User.create({
      name,
      email,
      password: tempPassword,
      role: "intern",
      company: req.user.company,
      isActive: true
    })

    await sendEmail(
      email,
      "Intern Account Created",
      `
        <h2>Welcome to IMS Internship Program</h2>
        <p>Your intern account has been created.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${tempPassword}</p>
        <p>Please change your password after login.</p>
      `
    )

    res.status(201).json({
      success: true,
      message: "Intern created and email sent"
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Server Error Wille Creating Intern"
    })
  }
}
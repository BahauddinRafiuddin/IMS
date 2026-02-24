import User from "../models/User.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All Fields Are Required!!' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User Already Exist With This Email Id!!" })
    }

    const user = await User.create({
      name,
      email,
      password
    })

    return res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: 'Register Server Error'
    })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!password || !email) {
      return res.status(400).json({ success: false, message: 'All Fields Are Required!!' })
    }

    const exitsUser = await User.findOne({ email }).select("+password");
    if (!exitsUser) {
      return res.status(404).json({ success: false, message: "User Does Not Exists" })
    }

    const isMatch = await bcrypt.compare(password, exitsUser.password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" })
    }

    const token = jwt.sign({ id: exitsUser._id, role: exitsUser.role }, process.env.JWT_SECRET, { expiresIn: "1h" })
    res.status(200).json({
      success: true,
      message: 'User logged In Successfully',
      user: {
        id: exitsUser._id,
        name: exitsUser.name,
        email: exitsUser.email,
        role: exitsUser.role
      },
      token
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: 'Login Server Error'
    })
  }
}



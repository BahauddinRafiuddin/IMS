import jwt from 'jsonwebtoken'
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 Fetch full user from DB
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive"
      });
    }

    req.user = user; // ✅ full user object now attached
    next()

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token"
    })
  }
}
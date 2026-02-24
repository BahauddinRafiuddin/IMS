import User from "../models/User.js";
import bcrypt from "bcryptjs";

const createSuperAdmin = async () => {
  const existing = await User.findOne({ role: "super_admin" });

  if (!existing) {

    await User.create({
      name: "Super Admin",
      email: "superadmin@ims.com",
      password: "superadmin123",
      role: "super_admin",
      isActive: true
    });

    console.log("✅ Super Admin Created");
  }
};

export default createSuperAdmin;
require("dotenv").config();
const mongoose = require("mongoose");
const { hash } = require("bcrypt");

const User = require("../models/user.model");
const { ROLES } = require("../constant/role");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminExists = await User.findOne({
      role: ROLES.ADMIN,
      isDeleted: false,
    });

    if (adminExists) {
      console.log("Admin already exists");
      process.exit();
    }

    const hashedPassword = await hash("9898", 10);

    await User.create({
      name: "Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: ROLES.ADMIN,
      isActive: true,
      isDeleted: false,
      deletedBy: null,
    });

    console.log("Admin seeded successfully");
    process.exit();
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedAdmin();

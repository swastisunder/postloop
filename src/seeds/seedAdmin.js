const path = require("path");
const { hash } = require("bcrypt");
const { nanoid } = require("nanoid");
const { readJSON, writeJSON } = require("../utils/fileHandler");
const { ROLES } = require("../constant/role");

const USER_PATH = path.join(__dirname, "../data/users.json");

const seedAdmin = async () => {
  const users = readJSON(USER_PATH);

  const adminExists = users.find((u) => u.role === ROLES.ADMIN);

  if (adminExists) return console.log("Admin already exists");

  const hashedPassword = await hash("admin123", 10);

  const adminUser = {
    userId: nanoid(8),
    name: "Admin",
    email: "admin@gmail.com",
    password: hashedPassword,
    role: ROLES.ADMIN,
    isActive: true,
    isDeleted: false,
    createdAt: new Date().toISOString(),
  };

  users.push(adminUser);
  writeJSON(USER_PATH, users);

  console.log("Admin user seeded successfully");
};

seedAdmin();

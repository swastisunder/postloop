const path = require("path");
const { nanoid } = require("nanoid");
const { hash, compare } = require("bcrypt");
const jwt = require("jsonwebtoken");

const { readJSON, writeJSON } = require("../utils/fileHandler");
const { ROLES } = require("../constant/role");
const { sanitizedUser } = require("../utils/sanitizedUser");
const ApiError = require("../utils/ApiError");

const USER_PATH = path.join(__dirname, "../data/users.json");

exports.signUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const users = readJSON(USER_PATH);
    const existingUser = users.find((u) => u.email === email && !u.isDeleted);
    if (existingUser) return next(new ApiError(409, "Email already exist."));

    const hashedPassword = await hash(password, 10);
    const newUser = {
      userId: nanoid(8),
      name,
      email,
      password: hashedPassword,
      role: ROLES.USER,
      isActive: true,
      isDeleted: false,
      deletedBy: null,
      createdAt: Date.now(),
    };

    users.push(newUser);
    writeJSON(USER_PATH, users);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: sanitizedUser(newUser),
    });
  } catch (error) {
    next(error);
  }
};

exports.logIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const users = readJSON(USER_PATH);
    const user = users.find((u) => u.email === email && !u.isDeleted);
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not exist",
      });

    const match = await compare(password, user.password);
    if (!match)
      return res.status(404).json({
        success: false,
        message: "Invalid credentials",
      });

    const jwtToken = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      success: true,
      message: "Login Success",
      token: jwtToken,
    });
  } catch (error) {
    next(error);
  }
};

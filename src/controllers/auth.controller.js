const jwt = require("jsonwebtoken");
const { hash, compare } = require("bcrypt");

const USER = require("../models/user.model");
const { ROLES } = require("../constant/role");
const { sanitizedUser } = require("../utils/sanitizedUser");
const ApiError = require("../utils/ApiError");
const { successResponse } = require("../utils/ApiResponse");

// SIGN UP
exports.signUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const isUserExist = await USER.findOne({ email, isDeleted: false });

    if (isUserExist) throw new ApiError(409, "Email already exist.");

    const hashedPassword = await hash(password, 10);

    const newUser = await USER.create({
      name,
      email,
      password: hashedPassword,
      role: ROLES.USER,
      isActive: true,
      isDeleted: false,
      deletedBy: null,
    });

    return successResponse(
      res,
      201,
      "User created successfully",
      sanitizedUser(newUser),
    );
  } catch (error) {
    next(error);
  }
};

// LOGIN
exports.logIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await USER.findOne({ email, isDeleted: false });

    if (!user) throw new ApiError(404, "User not exist");

    if (!user.isActive) throw new ApiError(403, "User is inactive");

    const isPasswordMatch = await compare(password, user.password);

    if (!isPasswordMatch) throw new ApiError(401, "Invalid credentials");

    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return successResponse(res, 200, "Login Success", { token: jwtToken });
  } catch (error) {
    next(error);
  }
};

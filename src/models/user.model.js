const mongoose = require("mongoose");
const { ROLES } = require("../constant/role");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: [ROLES.USER, ROLES.ADMIN],
      default: ROLES.USER,
      index: true,
    },

    isActive: { type: Boolean, default: true, index: true },

    isDeleted: { type: Boolean, default: false, index: true },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);

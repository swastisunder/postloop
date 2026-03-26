const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, index: true },

    image: { type: String, default: null },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    likeCount: { type: Number, default: 0, index: true },

    isDeleted: { type: Boolean, default: false, index: true },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Post", postSchema);

const ApiError = require("./ApiError");
const USER = require("../models/user.model");
const POST = require("../models/post.model");
const COMMENT = require("../models/comment.model");

exports.getUser = async (userId) => {
  const user = await USER.findOne({ _id: userId, isDeleted: false });
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

exports.getPost = async (postId) => {
  const post = await POST.findOne({ _id: postId, isDeleted: false });
  if (!post) throw new ApiError(404, "Post not found");
  return post;
};

exports.getComment = async (commentId) => {
  const comment = await COMMENT.findOne({ _id: commentId, isDeleted: false });
  if (!comment) throw new ApiError(404, "Comment not found");
  return comment;
};

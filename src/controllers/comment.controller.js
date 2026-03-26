const ApiError = require("../utils/ApiError");
const { successResponse } = require("../utils/ApiResponse");
const { paginate } = require("../utils/pagination");
const { ROLES } = require("../constant/role");

const USER = require("../models/user.model");
const POST = require("../models/post.model");
const COMMENT = require("../models/comment.model");
const { getUser, getPost, getComment } = require("../utils/dbHelper");

//  CREATE COMMENT

exports.createComment = async (req, res, next) => {
  try {
    const {
      body: { postId, content },
      user,
    } = req;

    await getPost(postId);

    const comment = await COMMENT.create({
      postId,
      userId: user._id,
      content,
      isDeleted: false,
    });

    return successResponse(res, 201, "Comment created successfully", comment);
  } catch (error) {
    next(error);
  }
};

//  GET ALL COMMENTS

exports.getAllComments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    const { data, pagination } = await paginate({
      model: COMMENT,
      filter: { isDeleted: false },
      page: pageNum,
      limit: limitNum,
      populate: [
        { path: "userId", select: "name" },
        { path: "postId", select: "content" },
      ],
    });

    const result = { data, pagination };

    return successResponse(
      res,
      200,
      "Comments fetched successfully",
      result.data,
      result.pagination,
    );
  } catch (error) {
    next(error);
  }
};

//  GET SINGLE COMMENT

exports.getComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    const comment = await COMMENT.findOne({
      _id: commentId,
      isDeleted: false,
    })
      .populate("userId", "name")
      .populate("postId", "content")
      .lean();

    if (!comment) throw new ApiError(404, "Comment not found");

    return successResponse(res, 200, "Comment fetched successfully", comment);
  } catch (error) {
    next(error);
  }
};

//  UPDATE COMMENT

exports.updateComment = async (req, res, next) => {
  try {
    const {
      params: { commentId },
      body: { content },
      user,
    } = req;

    const targetComment = await getComment(commentId);

    if (
      user.role !== ROLES.ADMIN &&
      targetComment.userId.toString() !== user._id.toString()
    )
      throw new ApiError(403, "Not authorized");

    if (content) targetComment.content = content;

    await targetComment.save();

    return successResponse(
      res,
      200,
      "Comment updated successfully",
      targetComment,
    );
  } catch (error) {
    next(error);
  }
};

//  DELETE COMMENT

exports.deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { user } = req;

    const targetComment = await getComment(commentId);

    const post = await POST.findById(targetComment.postId);

    if (
      user.role !== ROLES.ADMIN &&
      targetComment.userId.toString() !== user._id.toString() &&
      post.userId.toString() !== user._id.toString()
    )
      throw new ApiError(403, "Not authorized");

    targetComment.isDeleted = true;
    targetComment.deletedBy = user._id;

    await targetComment.save();

    return successResponse(res, 200, "Comment deleted successfully");
  } catch (error) {
    next(error);
  }
};

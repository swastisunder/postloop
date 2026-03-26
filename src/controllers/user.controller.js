const ApiError = require("../utils/ApiError");
const { ROLES } = require("../constant/role");
const { sanitizedUser } = require("../utils/sanitizedUser");
const { successResponse } = require("../utils/ApiResponse");
const { paginate } = require("../utils/pagination");

const USER = require("../models/user.model");
const POST = require("../models/post.model");
const COMMENT = require("../models/comment.model");
const { getUser } = require("../utils/dbHelper");

//  GET ALL USERS
exports.getAllUsers = async (req, res, next) => {
  try {
    const {
      user,
      originalUrl,
      query: { page = 1, limit = 10, email, name },
    } = req;

    console.log(originalUrl);

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    const isAdmin = user.role === ROLES.ADMIN;

    const filter = {
      isDeleted: false,
      ...(isAdmin ? {} : { isActive: true }),
    };

    if (email) filter.email = email.toLowerCase();
    if (name) filter.name = name;

    const { data, pagination } = await paginate({
      model: USER,
      filter,
      page: pageNum,
      limit: limitNum,
    });

    const result = {
      data: data.map(sanitizedUser),
      pagination,
    };

    return successResponse(
      res,
      200,
      "Users fetched successfully",
      result.data,
      result.pagination,
    );
  } catch (error) {
    next(error);
  }
};

//  GET SINGLE USER
exports.getUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { user } = req;

    const targetUser = await getUser(userId);

    if (user.role === ROLES.USER && !targetUser.isActive)
      throw new ApiError(404, "User not found");

    const result = sanitizedUser(targetUser);

    return successResponse(res, 200, "User fetched successfully", result);
  } catch (error) {
    next(error);
  }
};

//  DELETE USER
exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { user } = req;

    const adminId = user._id;

    const targetUser = await getUser(userId);

    if (targetUser.role === ROLES.ADMIN)
      throw new ApiError(403, "Cannot delete an admin");

    targetUser.isDeleted = true;
    targetUser.isActive = false;
    targetUser.deletedBy = adminId;

    await targetUser.save();

    const posts = await POST.find(
      { userId, isDeleted: false },
      { _id: 1 },
    ).lean();

    const postIds = posts.map((p) => p._id);

    await POST.updateMany(
      { userId, isDeleted: false },
      { isDeleted: true, deletedBy: adminId, updatedAt: new Date() },
    );

    await COMMENT.updateMany(
      { isDeleted: false, $or: [{ userId }, { postId: { $in: postIds } }] },
      { isDeleted: true, deletedBy: adminId, updatedAt: new Date() },
    );

    return successResponse(res, 200, "User deleted successfully");
  } catch (error) {
    next(error);
  }
};

//  UPDATE USER
exports.updateUserAction = async (req, res, next) => {
  try {
    const { userId, action } = req.params;

    const targetUser = await getUser(userId);

    switch (action) {
      case "active":
        targetUser.isActive = true;
        break;

      case "inactive":
        targetUser.isActive = false;
        break;

      case "promote":
        if (targetUser.role === ROLES.ADMIN)
          throw new ApiError(409, "User already admin");

        targetUser.role = ROLES.ADMIN;
        break;

      default:
        throw new ApiError(400, "Invalid action");
    }

    await targetUser.save();

    return successResponse(res, 200, `User ${action}ed successfully`);
  } catch (error) {
    next(error);
  }
};

//  USER POSTS
exports.getAllPostsOfUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    const targetUser = await getUser(userId);
    if (!targetUser.isActive) throw new ApiError(403, "User inactive");

    const { data, pagination } = await paginate({
      model: POST,
      filter: { userId, isDeleted: false },
      page: pageNum,
      limit: limitNum,
      populate: { path: "userId", select: "name" },
    });

    return successResponse(res, 200, "User posts fetched", data, pagination);
  } catch (error) {
    next(error);
  }
};

//  SINGLE POST
exports.getPostOfUser = async (req, res, next) => {
  try {
    const { userId, postId } = req.params;

    const targetUser = await getUser(userId);
    if (!targetUser.isActive) throw new ApiError(403, "User inactive");

    const post = await POST.findOne({
      _id: postId,
      userId,
      isDeleted: false,
    })
      .populate("userId", "name")
      .lean();

    if (!post) throw new ApiError(404, "Post not found");

    return successResponse(res, 200, "Post fetched", post);
  } catch (error) {
    next(error);
  }
};

//  USER COMMENTS
exports.getAllCommentsOfUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    const targetUser = await getUser(userId);
    if (!targetUser.isActive) throw new ApiError(403, "User inactive");

    const { data, pagination } = await paginate({
      model: COMMENT,
      filter: { userId, isDeleted: false },
      page: pageNum,
      limit: limitNum,
      populate: [
        { path: "userId", select: "name" },
        { path: "postId", select: "content" },
      ],
    });

    return successResponse(res, 200, "Comments fetched", data, pagination);
  } catch (error) {
    next(error);
  }
};

//  SINGLE COMMENT
exports.getCommentOfUser = async (req, res, next) => {
  try {
    const { userId, commentId } = req.params;

    const targetUser = await getUser(userId);
    if (!targetUser.isActive) throw new ApiError(403, "User inactive");

    const comment = await COMMENT.findOne({
      _id: commentId,
      userId,
      isDeleted: false,
    })
      .populate("userId", "name")
      .populate("postId", "content")
      .lean();

    if (!comment) throw new ApiError(404, "Comment not found");

    return successResponse(res, 200, "Comment fetched", comment);
  } catch (error) {
    next(error);
  }
};

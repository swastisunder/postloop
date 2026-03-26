const ApiError = require("../utils/ApiError");
const { successResponse } = require("../utils/ApiResponse");
const { paginate } = require("../utils/pagination");
const { ROLES } = require("../constant/role");

const USER = require("../models/user.model");
const POST = require("../models/post.model");
const COMMENT = require("../models/comment.model");
const { getUser, getPost } = require("../utils/dbHelper");

//  CREATE POST

exports.createPost = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { user, file } = req;

    const post = await POST.create({
      content,
      image: file ? file.filename : null,
      userId: user._id,
      likes: [],
      likeCount: 0,
      isDeleted: false,
    });

    return successResponse(res, 201, "Post created successfully", post);
  } catch (error) {
    next(error);
  }
};

//  GET ALL POSTS

exports.getAllPosts = async (req, res, next) => {
  try {
    const {
      query: { page = 1, limit = 10, userId },
      user,
    } = req;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    const filter = { isDeleted: false };

    if (userId) {
      const targetUser =
        userId === user._id.toString() ? user : await getUser(userId);
      filter.userId = targetUser._id;
    }

    const { data, pagination } = await paginate({
      model: POST,
      filter,
      page: pageNum,
      limit: limitNum,
      populate: { path: "userId", select: "name" },
    });

    const result = { data, pagination };

    return successResponse(
      res,
      200,
      "Posts fetched successfully",
      result.data,
      result.pagination,
    );
  } catch (error) {
    next(error);
  }
};

//  GET SINGLE POST

exports.getPost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await POST.findOne({ _id: postId, isDeleted: false })
      .populate("userId", "name")
      .lean();

    if (!post) throw new ApiError(404, "Post not found");

    return successResponse(res, 200, "Post fetched successfully", post);
  } catch (error) {
    next(error);
  }
};

//  UPDATE POST

exports.updatePost = async (req, res, next) => {
  try {
    const {
      params: { postId },
      body: { content },
      user,
    } = req;

    const post = await getPost(postId);

    if (post.userId.toString() !== user._id.toString())
      throw new ApiError(403, "Not authorized");

    if (content) post.content = content;

    await post.save();

    return successResponse(res, 200, "Post updated successfully", post);
  } catch (error) {
    next(error);
  }
};

//  DELETE POST

exports.deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { user } = req;

    const post = await getPost(postId);

    if (
      user.role !== ROLES.ADMIN &&
      post.userId.toString() !== user._id.toString()
    )
      throw new ApiError(403, "Not authorized");

    post.isDeleted = true;
    post.deletedBy = user._id;

    await post.save();

    await COMMENT.updateMany(
      { postId, isDeleted: false },
      {
        isDeleted: true,
        deletedBy: user._id,
        updatedAt: new Date(),
      },
    );

    return successResponse(res, 200, "Post deleted successfully");
  } catch (error) {
    next(error);
  }
};

//  LIKE POST

exports.likePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { user } = req;

    const post = await getPost(postId);

    const userId = user._id.toString();

    const alreadyLiked = post.likes.map((id) => id.toString()).includes(userId);

    if (alreadyLiked)
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    else post.likes.push(user._id);

    post.likeCount = post.likes.length;

    await post.save();

    return successResponse(res, 200, "Like updated", {
      liked: !alreadyLiked,
      likeCount: post.likeCount,
    });
  } catch (error) {
    next(error);
  }
};

//  GET COMMENTS OF POST

exports.getAllCommentsOfPost = async (req, res, next) => {
  try {
    const {
      params: { postId },
      query: { page = 1, limit = 10 },
    } = req;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    await getPost(postId);

    const { data, pagination } = await paginate({
      model: COMMENT,
      filter: { postId, isDeleted: false },
      page: pageNum,
      limit: limitNum,
      populate: { path: "userId", select: "name" },
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

//  GET SINGLE COMMENT OF POST

exports.getCommentOfPost = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;

    await getPost(postId);

    const comment = await COMMENT.findOne({
      _id: commentId,
      postId,
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

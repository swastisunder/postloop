const { ROLES } = require("../constant/role");
const ApiError = require("../utils/ApiError");
const { readJSON, writeJSON } = require("../utils/fileHandler");
const path = require("path");
const { sanitizedUser } = require("../utils/sanitizedUser");

const USER_PATH = path.join(__dirname, "../data/users.json");
const POST_PATH = path.join(__dirname, "../data/posts.json");

exports.getAllUsers = (req, res, next) => {
  try {
    let { page, limit } = req.query;

    page = parseInt(page) || 1;
    limit = Math.min(parseInt(limit) || 10, 50);

    const users = readJSON(USER_PATH);
    const totalUsers = users.length;

    if (!totalUsers) return next(new ApiError(404, "No users found"));

    const totalPages = Math.ceil(totalUsers / limit) || 1;

    if (page > totalPages)
      return next(
        new ApiError(
          400,
          `Page ${page} does not exist. Total pages: ${totalPages}`,
        ),
      );

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedUser = users.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      page,
      limit,
      totalUsers,
      totalPages,
      data: paginatedUser,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUser = (req, res, next) => {
  try {
    const { userId } = req.params;

    const users = readJSON(USER_PATH);

    const user = users.find((u) => u.userId === userId && !u.isDeleted);

    if (!user) return next(new ApiError(404, "User not found"));

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

exports.newAdmin = (req, res, next) => {
  try {
    const { userId } = req.params;

    const users = readJSON(USER_PATH);

    const userIndex = users.findIndex(
      (u) => u.userId === userId && !u.isDeleted,
    );

    if (userIndex === -1) return next(new ApiError(404, "User not found"));

    if (users[userIndex].role === ROLES.ADMIN)
      return next(new ApiError(400, "User is already an admin"));

    users[userIndex].role = ROLES.ADMIN;

    writeJSON(USER_PATH, users);

    res.status(200).json({
      success: true,
      message: "User promoted to admin successfully",
      data: sanitizedUser(users[userIndex]),
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = (req, res, next) => {
  try {
    const { userId } = req.params;

    const users = readJSON(USER_PATH);

    const userIndex = users.findIndex(
      (u) => u.userId === userId && !u.isDeleted,
    );
    if (userIndex === -1) return next(new ApiError(404, "User not found."));

    if (users[userIndex].role === ROLES.ADMIN)
      return next(new ApiError(403, "Cannot delete an admin."));

    users[userIndex].isDeleted = true;
    users[userIndex].isActive = false;
    users[userIndex].deletedBy = req.user.userId;

    writeJSON(USER_PATH, users);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: users[userIndex],
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllPostsOfAUser = (req, res, next) => {
  try {
    let { page, limit } = req.query;
    const { userId } = req.params;

    page = parseInt(page) || 1;
    limit = Math.min(parseInt(limit) || 10, 50);

    const posts = readJSON(POST_PATH);

    const userPosts = posts.filter((p) => p.userId === userId && !p.isDeleted);

    if (!userPosts) return next(new ApiError(404, "Posts not found"));

    const totalPosts = userPosts.length;
    const totalPages = Math.ceil(totalPosts / limit);

    if (page > totalPages)
      return next(
        new ApiError(
          400,
          `Page ${page} does not exist. Total pages: ${totalPages}`,
        ),
      );

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedPosts = userPosts.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      page,
      limit,
      totalPosts,
      totalPages,
      data: paginatedPosts,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPostOfAUser = (req, res, next) => {
  try {
    const { userId, postId } = req.params;

    const posts = readJSON(POST_PATH);

    const post = posts.find(
      (p) => p.postId === postId && p.userId === userId && !p.isDeleted,
    );

    if (!post) return next(new ApiError(404, "Post not found for this user"));

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

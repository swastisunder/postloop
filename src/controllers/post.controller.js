const { nanoid } = require("nanoid");
const path = require("path");

const { readJSON, writeJSON } = require("../utils/fileHandler");
const ApiError = require("../utils/ApiError");
const POST_PATH = path.join(__dirname, "../data/posts.json");

exports.createPost = (req, res, next) => {
  try {
    const { content } = req.body;

    const posts = readJSON(POST_PATH);

    const newPost = {
      postId: nanoid(8),
      userId: req.user.userId,
      content,
      image: req.file ? req.file.filename : null,
      likes: [],
      likeCount: 0,
      isDeleted: false,
      deletedBy: null,
      createdAt: new Date().toISOString(),
    };

    posts.push(newPost);
    writeJSON(POST_PATH, posts);

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: {
        postId: newPost.postId,
        userId: newPost.userId,
        content: newPost.content,
        image: newPost.image,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getPost = (req, res, next) => {
  try {
    const { postId } = req.params;

    const posts = readJSON(POST_PATH);

    const post = posts.find((p) => p.postId === postId && !p.isDeleted);

    if (!post) return next(new ApiError(404, "Post not found"));

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePost = (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    const posts = readJSON(POST_PATH);

    const postIndex = posts.findIndex(
      (p) => p.postId === postId && !p.isDeleted,
    );

    if (postIndex === -1) return next(new ApiError(404, "Post not found"));

    const post = posts[postIndex];

    if (post.userId !== req.user.userId)
      return next(new ApiError(403, "You cannot edit this post"));

    if (content) post.content = content;

    if (req.file) post.image = req.file.filename;

    posts[postIndex] = post;

    writeJSON(POST_PATH, posts);

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: {
        postId: post.postId,
        content: post.content,
        image: post.image,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePost = (req, res, next) => {
  try {
    const { postId } = req.params;

    const posts = readJSON(POST_PATH);

    const postIndex = posts.findIndex(
      (p) => p.postId === postId && !p.isDeleted,
    );

    if (postIndex === -1) return next(new ApiError(404, "Post not found"));

    const post = posts[postIndex];

    if (post.userId !== req.user.userId)
      return next(new ApiError(403, "You cannot delete this post"));

    post.isDeleted = true;
    post.deletedBy = req.user.userId;

    posts[postIndex] = post;

    writeJSON(POST_PATH, posts);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.likePost = (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const posts = readJSON(POST_PATH);

    const postIndex = posts.findIndex(
      (p) => p.postId === postId && !p.isDeleted,
    );

    if (postIndex === -1) return next(new ApiError(404, "Post not found"));

    const post = posts[postIndex];

    if (post.likes.includes(userId))
      return next(new ApiError(409, "You already liked this post"));

    post.likes.push(userId);
    post.likeCount = post.likes.length;

    posts[postIndex] = post;

    writeJSON(POST_PATH, posts);

    res.status(200).json({
      success: true,
      message: "Post liked successfully",
      likeCount: post.likeCount,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllPosts = (req, res, next) => {
  try {
    let { page, limit, userId } = req.query;

    page = parseInt(page) || 1;
    limit = Math.min(parseInt(limit) || 10, 50);

    const posts = userId
      ? readJSON(POST_PATH).filter((p) => p.userId === userId && !p.isDeleted)
      : readJSON(POST_PATH).filter((p) => !p.isDeleted);

    const totalPosts = posts.length;

    if (!totalPosts) return next(new ApiError(404, "No posts found"));

    const totalPages = Math.ceil(totalPosts / limit) || 1;

    if (page > totalPages)
      return next(
        new ApiError(
          400,
          `Page ${page} does not exist. Total pages: ${totalPages}`,
        ),
      );

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedPosts = posts.slice(startIndex, endIndex);

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

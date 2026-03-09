const { nanoid } = require("nanoid");
const path = require("path");
const { readJSON, writeJSON } = require("../utils/fileHandler");
const ApiError = require("../utils/ApiError");
const COMMENT_PATH = path.join(__dirname, "../data/comments.json");
const POST_PATH = path.join(__dirname, "../data/posts.json");

exports.createComment = (req, res, next) => {
  try {
    const { comment, postId } = req.body;

    const posts = readJSON(POST_PATH);
    const post = posts.find((p) => p.postId === postId && !p.isDeleted);

    if (!post) return next(new ApiError(404, "Post not found"));

    const comments = readJSON(COMMENT_PATH);

    const newComment = {
      commentId: nanoid(8),
      userId: req.user.userId,
      postId,
      comment,
      isDeleted: false,
      deletedBy: null,
      createdAt: new Date().toISOString(),
    };

    comments.push(newComment);
    writeJSON(COMMENT_PATH, comments);

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: {
        commentId: newComment.commentId,
        postId: newComment.postId,
        userId: newComment.userId,
        comment: newComment.comment,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePost = (req, res, next) => {
  try {
    const { commentId } = req.params;

    const comments = readJSON(COMMENT_PATH);
    const commentIndex = comments.findIndex(
      (c) => c.commentId === commentId && !c.isDeleted,
    );

    if (commentIndex === -1)
      return next(new ApiError(404, "Comment not found"));

    const comment = comments[commentIndex];

    if (comment.userId !== req.user.userId)
      return next(new ApiError(403, "You cannot delete this comment"));

    comment.isDeleted = true;
    comment.deletedBy = req.user.userId;

    comments[commentIndex] = comment;
    writeJSON(COMMENT_PATH, comments);

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllComments = (req, res, next) => {
  
};

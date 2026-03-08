const path = require("path");
const { readJSON, writeJSON } = require("../utils/fileHandler");
const { nanoid } = require("nanoid");

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
      createdAt: Date.now(),
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

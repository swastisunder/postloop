const postRouter = require("express").Router();
const { validate } = require("express-validation");
const { authenticate } = require("../middlewares/auth.middleware");
const { createPost } = require("../controllers/post.controller");
const { upload } = require("../middlewares/multer");
const { createPostSchema } = require("../validations/post.validation");

postRouter.post(
  "/",
  authenticate,
  upload.single("image"),
  validate(createPostSchema),
  createPost,
);

module.exports = postRouter;

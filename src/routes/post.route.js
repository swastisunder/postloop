const router = require("express").Router();
const { validate } = require("express-validation");

const { authenticate } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/authorize.middleware");
const { ROLES } = require("../constant/role");
const upload = require("../middlewares/multer");

const {
  createPost,
  getAllPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  getAllCommentsOfPost,
  getCommentOfPost,
} = require("../controllers/post.controller");

const {
  createPostSchema,
  updatePostSchema,
  postIdParamSchema,
  getAllPostsSchema,
  likePostSchema,
  getAllCommentsOfPostSchema,
  getCommentOfPostSchema,
} = require("../validations/post.validation");

router.use(authenticate);

router.post(
  "/",
  authorize(ROLES.USER),
  upload.single("image"),
  validate(createPostSchema),
  createPost,
);

// userId:231321321
router.get(
  "/",
  authorize(ROLES.ADMIN, ROLES.USER),
  validate(getAllPostsSchema),
  getAllPosts,
);

router.get(
  "/:postId",
  authorize(ROLES.ADMIN, ROLES.USER),
  validate(postIdParamSchema),
  getPost,
);

router.put(
  "/:postId",
  authorize(ROLES.USER),
  validate(updatePostSchema),
  updatePost,
);

router.delete(
  "/:postId",
  authorize(ROLES.ADMIN, ROLES.USER),
  validate(postIdParamSchema),
  deletePost,
);

router.put(
  "/:postId/like",
  authorize(ROLES.USER),
  validate(likePostSchema),
  likePost,
);

router.get(
  "/:postId/comments",
  authorize(ROLES.ADMIN, ROLES.USER),
  validate(getAllCommentsOfPostSchema),
  getAllCommentsOfPost,
);

router.get(
  "/:postId/comments/:commentId",
  authorize(ROLES.ADMIN, ROLES.USER),
  validate(getCommentOfPostSchema),
  getCommentOfPost,
);

module.exports = router;

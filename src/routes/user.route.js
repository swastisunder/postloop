const router = require("express").Router();

const { authenticate } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/authorize.middleware");
const { ROLES } = require("../constant/role");
const {
  userIdParamSchema,
  getAllUsersSchema,
  updateUserActionSchema,
  getAllPostsOfUserSchema,
  getPostOfUserSchema,
  getAllCommentsOfUserSchema,
  getCommentOfUserSchema,
} = require("../validations/user.validation");

const {
  getAllUsers,
  getUser,
  deleteUser,
  updateUserAction,
  getAllPostsOfUser,
  getPostOfUser,
  getAllCommentsOfUser,
  getCommentOfUser,
} = require("../controllers/user.controller");
const { validate } = require("express-validation");

router.use(authenticate);

router.get(
  "/",
  authorize(ROLES.ADMIN, ROLES.USER),
  validate(getAllUsersSchema),
  getAllUsers,
);

router.get(
  "/:userId",
  authorize(ROLES.ADMIN, ROLES.USER),
  validate(userIdParamSchema),
  getUser,
);

router.delete(
  "/:userId",
  authorize(ROLES.ADMIN),
  validate(userIdParamSchema),
  deleteUser,
);

router.put(
  "/:userId/:action",
  authorize(ROLES.ADMIN),
  validate(updateUserActionSchema),
  updateUserAction,
);

router.get(
  "/:userId/posts",
  authorize(ROLES.ADMIN, ROLES.USER),
  validate(getAllPostsOfUserSchema),
  getAllPostsOfUser,
);

router.get(
  "/:userId/posts/:postId",
  authorize(ROLES.ADMIN, ROLES.USER),
  validate(getPostOfUserSchema),
  getPostOfUser,
);

router.get(
  "/:userId/comments",
  authorize(ROLES.ADMIN, ROLES.USER),
  validate(getAllCommentsOfUserSchema),
  getAllCommentsOfUser,
);

router.get(
  "/:userId/comments/:commentId",
  authorize(ROLES.ADMIN, ROLES.USER),
  validate(getCommentOfUserSchema),
  getCommentOfUser,
);

module.exports = router;

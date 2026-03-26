const router = require("express").Router();
const { validate } = require("express-validation");

const { authenticate } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/authorize.middleware");
const { ROLES } = require("../constant/role");

const {
  createComment,
  getAllComments,
  getComment,
  updateComment,
  deleteComment,
} = require("../controllers/comment.controller");

const {
  createCommentSchema,
  updateCommentSchema,
  commentIdParamSchema,
  getAllCommentsSchema,
} = require("../validations/comment.validation");

router.use(authenticate);

router.post(
  "/",
  authorize(ROLES.USER),
  validate(createCommentSchema),
  createComment,
);

router.get(
  "/",
  authorize(ROLES.ADMIN),
  validate(getAllCommentsSchema),
  getAllComments,
);

router.get(
  "/:commentId",
  authorize(ROLES.ADMIN, ROLES.USER),
  validate(commentIdParamSchema),
  getComment,
);

router.put(
  "/:commentId",
  authorize(ROLES.USER),
  validate(updateCommentSchema),
  updateComment,
);

router.delete(
  "/:commentId",
  authorize(ROLES.ADMIN, ROLES.USER),
  validate(commentIdParamSchema),
  deleteComment,
);

module.exports = router;

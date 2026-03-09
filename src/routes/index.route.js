const router = require("express").Router();

const authRouter = require("./auth.route");
const commentRouter = require("./comment.route");
const postRouter = require("./post.route");
const userRouter = require("./user.route");

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/posts", postRouter);
router.use("/comments", commentRouter);

module.exports = router;

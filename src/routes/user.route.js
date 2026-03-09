const userRouter = require("express").Router();

const {getAllUsers,getUser,newAdmin,deleteUser,getAllPostsOfAUser,getPostOfAUser} = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/auth.middleware");

userRouter.get("/", authenticate, getAllUsers);
userRouter.get("/:userId", authenticate, getUser);
userRouter.get("/:userId/posts", authenticate, getAllPostsOfAUser);
userRouter.get("/:userId/posts/:postId", authenticate, getPostOfAUser);
userRouter.patch("/promote/:userId", authenticate, newAdmin);
userRouter.delete("/:userId", authenticate, deleteUser);

module.exports = userRouter;

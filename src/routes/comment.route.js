const commentRouter = require("express").Router();
const { validate } = require("express-validation");

const { createComment,deletePost,getAllComments } = require("../controllers/comment.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { createCommentSchema,getCommentsSchema } = require("../validations/comment.validation");

// create comment
commentRouter.post("/",authenticate,validate(createCommentSchema),createComment);

// get all comment
commentRouter.get('/',authenticate,validate(getCommentsSchema),getAllComments)

// delete comment
commentRouter.delete('/:commentId',authenticate,deletePost)

module.exports = commentRouter;

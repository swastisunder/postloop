const postRouter = require("express").Router();
const { validate } = require("express-validation");

const { authenticate } = require("../middlewares/auth.middleware");
const {createPost,getPost,updatePost,deletePost,likePost,getAllPosts} = require("../controllers/post.controller");
const upload = require("../middlewares/multer");
const {createPostSchema,getPostsSchema} = require("../validations/post.validation");


postRouter.route('/')
// create post
.post(authenticate,upload.single("image"),validate(createPostSchema),createPost)
// get all post with pagination and get all post of a user
.get(authenticate, validate(getPostsSchema), getAllPosts);

postRouter.route('/:postId')
// get a post
.get(authenticate, getPost)
// update a post
.patch(authenticate,upload.single("image"),validate(createPostSchema),updatePost)
// delete a post
.delete(authenticate, deletePost);

// like 
postRouter.post("/:postId/like", authenticate, likePost);

module.exports = postRouter;

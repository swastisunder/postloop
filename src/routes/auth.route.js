const { validate } = require("express-validation");
const { signUp, logIn } = require("../controllers/auth.controller");
const { signUpSchema, logInSchema } = require("../validations/auth.validation");
const { authenticate } = require("../middlewares/auth.middleware");

const authRouter = require("express").Router();

authRouter.post("/signup", validate(signUpSchema, {}, {}), signUp);
authRouter.post("/login", validate(logInSchema, {}, {}), logIn);
authRouter.get("/omg", authenticate, (req, res) => res.send("omg"));

module.exports = authRouter;

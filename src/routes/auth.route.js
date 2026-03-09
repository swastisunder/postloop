const { validate } = require("express-validation");
const authRouter = require("express").Router();

const { signUp, logIn } = require("../controllers/auth.controller");
const { signUpSchema, logInSchema } = require("../validations/auth.validation");

authRouter.post("/signup", validate(signUpSchema, {}, {}), signUp);
authRouter.post("/login", validate(logInSchema, {}, {}), logIn);

module.exports = authRouter;

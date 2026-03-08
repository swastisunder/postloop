const { Joi } = require("express-validation");

exports.signUpSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(16).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(4).required(),
  }),
};

exports.logInSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(4).required(),
  }),
};

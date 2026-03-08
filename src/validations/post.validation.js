const { Joi } = require("express-validation");

exports.createPostSchema = {
  body: Joi.object({
    content: Joi.string().trim().min(1).max(1000).required(),
    image: Joi.string().trim().allow(null, "").optional(),
  }),
};

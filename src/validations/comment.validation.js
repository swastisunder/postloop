const { Joi } = require("express-validation");

exports.createCommentSchema = {
  body: Joi.object({
    comment: Joi.string().trim().min(1).max(500).required(),
    postId: Joi.string().required(),
  }),
};

exports.getCommentsSchema = {
  query: Joi.object({
    userId: Joi.string().trim().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
  }).unknown(false),
};
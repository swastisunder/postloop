const { Joi } = require("express-validation");

const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .required()
  .messages({ "string.pattern.base": "Invalid ID format" });

const paginationQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
}).unknown(false);

exports.createCommentSchema = {
  body: Joi.object({
    postId: objectId,
    content: Joi.string().trim().min(1).required(),
  }).unknown(false),

  params: Joi.object().max(0),
  query: Joi.object().max(0),
};

exports.updateCommentSchema = {
  params: Joi.object({
    commentId: objectId,
  }).unknown(false),

  body: Joi.object({
    content: Joi.string().trim().min(1),
  })
    .min(1)
    .unknown(false),

  query: Joi.object().max(0),
};

exports.getAllCommentsSchema = {
  query: paginationQuery,
  params: Joi.object().max(0),
};

exports.commentIdParamSchema = {
  params: Joi.object({
    commentId: objectId,
  }).unknown(false),

  query: Joi.object().max(0),
};

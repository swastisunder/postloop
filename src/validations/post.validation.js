const { Joi } = require("express-validation");

const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .required()
  .messages({ "string.pattern.base": "Invalid ID format" });

const paginationQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
}).unknown(false);

exports.createPostSchema = {
  body: Joi.object({
    content: Joi.string().trim().min(2).required(),
  }).unknown(false),

  params: Joi.object().max(0),
  query: Joi.object().max(0),
};

exports.updatePostSchema = {
  params: Joi.object({
    postId: objectId,
  }).unknown(false),

  body: Joi.object({
    content: Joi.string().trim().min(2),
  }).unknown(false),

  query: Joi.object().max(0),
};

exports.getAllPostsSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
    userId: Joi.alternatives().try(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)),
  }).unknown(false),
};

exports.postIdParamSchema = {
  params: Joi.object({
    postId: objectId,
  }).unknown(false),

  query: Joi.object().max(0),
};

exports.likePostSchema = {
  params: Joi.object({
    postId: objectId,
  }).unknown(false),

  body: Joi.object().max(0),
  query: Joi.object().max(0),
};

exports.getAllCommentsOfPostSchema = {
  params: Joi.object({
    postId: objectId,
  }).unknown(false),

  query: paginationQuery,
};

exports.getCommentOfPostSchema = {
  params: Joi.object({
    postId: objectId,
    commentId: objectId,
  }).unknown(false),

  query: Joi.object().max(0),
};

const { Joi } = require("express-validation");

const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .required()
  .messages({ "string.pattern.base": "Invalid ID format" });

const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
}).unknown(false);

exports.getAllUsersSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),

    name: Joi.string().trim().min(1),
    email: Joi.string().email().trim().lowercase(),
  }).unknown(false),
};

exports.userIdParamSchema = {
  params: Joi.object({
    userId: objectId,
  }).unknown(false),
  query: Joi.object().max(0),
};

exports.updateUserActionSchema = {
  params: Joi.object({
    userId: objectId,
    action: Joi.string().valid("active", "inactive", "promote").required(),
  }).unknown(false),

  query: Joi.object().max(0),
};

exports.getAllPostsOfUserSchema = {
  params: Joi.object({
    userId: objectId,
  }).unknown(false),

  query: paginationQuerySchema,
};

exports.getPostOfUserSchema = {
  params: Joi.object({
    userId: objectId,
    postId: objectId,
  }).unknown(false),

  query: Joi.object().max(0),
};

exports.getAllCommentsOfUserSchema = {
  params: Joi.object({
    userId: objectId,
  }).unknown(false),

  query: paginationQuerySchema,
};

exports.getCommentOfUserSchema = {
  params: Joi.object({
    userId: objectId,
    commentId: objectId,
  }).unknown(false),

  query: Joi.object().max(0),
};

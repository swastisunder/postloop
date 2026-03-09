const { ROLES } = require("../constant/role");
const ApiError = require("../utils/ApiError");

exports.isAdmin = (req, res, next) => {
  if (!req.user) return next(new ApiError(401, "Authentication required"));

  if (req.user.role !== ROLES.ADMIN)
    return next(new ApiError(403, "Access denied: Admins only"));

  next();
};

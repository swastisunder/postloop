exports.successResponse = (
  res,
  statusCode = 200,
  message = "Success",
  data = null,
  extra = {},
) => {
  const response = { success: true, message, ...extra };

  if (data !== null && data !== undefined) response.data = data;

  return res.status(statusCode).json(response);
};

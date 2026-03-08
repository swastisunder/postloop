const globalErrorHandler = (err, req, res, next) => {
  if (err.name === "ValidationError") {
    const message = err.details?.body?.[0]?.message || "Validation failed";

    return res.status(err.statusCode || 400).json({
      success: false,
      message,
    });
  }

  if (err.status && err.message) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
};

module.exports = globalErrorHandler;

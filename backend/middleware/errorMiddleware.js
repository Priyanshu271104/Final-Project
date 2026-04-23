function notFound(req, res, next) {
  const error = new Error(
    `Route not found: ${req.originalUrl}`
  );
  res.status(404);
  next(error);
}

function errorHandler(error, req, res, next) {
  const statusCode =
    res.statusCode && res.statusCode !== 200
      ? res.statusCode
      : 500;

  console.error(
    '[Global Error Handler]:',
    error.message
  );

  res.status(statusCode).json({
    success: false,
    error: error.message || 'Internal Server Error',
  });
}

module.exports = {
  notFound,
  errorHandler,
};
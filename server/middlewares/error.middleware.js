/**
 * Handles requests to routes that don't exist.
 * Must be mounted AFTER all valid routes.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Central error handler. Catches errors thrown/forwarded from
 * anywhere in the app (via asyncHandler or next(err)) and sends
 * a consistent JSON error response.
 * Must be the LAST middleware mounted in app.js.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // If a status code was already set (e.g. via res.status(400)) use it,
  // otherwise default to 500 (Internal Server Error).
  let statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || "Internal Server Error";

  // Mongoose bad ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found";
  }

  // Mongoose duplicate key error (e.g. duplicate email)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate value for field: ${field}`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = { notFound, errorHandler };

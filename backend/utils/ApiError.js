/**
 * Custom Error class used across the app so controllers can throw
 * errors with a specific HTTP status code. The error middleware
 * knows how to read `statusCode` off this class.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;

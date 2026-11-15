/**
 * Wraps an async controller function and forwards any thrown error
 * to Express's `next()`, so we don't need try/catch in every controller.
 *
 * Usage: router.get("/", asyncHandler(controllerFn))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

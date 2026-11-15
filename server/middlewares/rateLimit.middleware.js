const rateLimit = require("express-rate-limit");

const make = (windowMs, limit, message) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });

// Brute-force protection for login/register
const authLimiter = make(15 * 60 * 1000, 30, "Too many attempts. Please try again in a few minutes.");
// Protects Groq quota / cost on any LLM-backed route
const aiLimiter = make(60 * 1000, 12, "You're sending AI requests too quickly. Please wait a moment.");
// General safety net
const apiLimiter = make(15 * 60 * 1000, 600, "Too many requests. Please slow down.");

module.exports = { authLimiter, aiLimiter, apiLimiter };

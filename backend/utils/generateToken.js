const jwt = require("jsonwebtoken");

/**
 * Generates a signed JWT for a given user ID.
 * @param {string} userId - Mongo _id of the user
 * @returns {string} signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

module.exports = generateToken;

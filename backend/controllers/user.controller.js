const asyncHandler = require("../middlewares/asyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../models/User.model");

/**
 * @desc    Get logged-in user's profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Update logged-in user's profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const { name, degree, year, skills, interests, careerGoal } = req.body;

  if (name !== undefined) user.name = name;
  if (degree !== undefined) user.degree = degree;
  if (year !== undefined) user.year = year;
  if (skills !== undefined) user.skills = skills;
  if (interests !== undefined) user.interests = interests;
  if (careerGoal !== undefined) user.careerGoal = careerGoal;

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: updatedUser,
  });
});

module.exports = { getProfile, updateProfile };

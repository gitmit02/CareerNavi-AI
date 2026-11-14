const asyncHandler = require("../middlewares/asyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../models/User.model");
const generateToken = require("../utils/generateToken");

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, degree, year, skills, interests, careerGoal } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(400, "A user with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    degree,
    year,
    skills,
    interests,
    careerGoal,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        degree: user.degree,
        year: user.year,
        skills: user.skills,
        interests: user.interests,
        careerGoal: user.careerGoal,
      },
      token,
    },
  });
});

/**
 * @desc    Login user & return JWT
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // password field has `select: false` in schema, explicitly include it here
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        degree: user.degree,
        year: user.year,
        skills: user.skills,
        interests: user.interests,
        careerGoal: user.careerGoal,
      },
      token,
    },
  });
});

module.exports = { register, login };

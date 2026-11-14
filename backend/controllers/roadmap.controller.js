const asyncHandler = require("../middlewares/asyncHandler");
const ApiError = require("../utils/ApiError");
const Roadmap = require("../models/Roadmap.model");
const aiService = require("../services/ai.service");

/**
 * @desc    Generate a new AI career roadmap based on the logged-in user's profile
 * @route   POST /api/roadmap/generate
 * @access  Private
 */
const generateRoadmap = asyncHandler(async (req, res) => {
  const user = req.user;

  // Allow overriding the goal for this specific generation without changing the saved profile
  const careerGoal = req.body.careerGoal || user.careerGoal;

  const aiResult = await aiService.generateCareerRoadmap({
    name: user.name,
    degree: user.degree,
    year: user.year,
    skills: user.skills,
    interests: user.interests,
    careerGoal,
  });

  if (!aiResult.careerPath || !Array.isArray(aiResult.steps)) {
    throw new ApiError(502, "AI returned an unexpected roadmap format");
  }

  const roadmap = await Roadmap.create({
    user: user._id,
    careerPath: aiResult.careerPath,
    steps: aiResult.steps.map((s) => ({
      title: s.title,
      description: s.description || "",
      duration: s.duration || "",
      completed: false,
    })),
    timeline: aiResult.timeline || "90 days",
    requiredSkills: aiResult.requiredSkills || [],
    tools: aiResult.tools || [],
    rawAIResponse: aiResult,
  });

  res.status(201).json({
    success: true,
    message: "Career roadmap generated successfully",
    data: roadmap,
  });
});

/**
 * @desc    Get all roadmaps for the logged-in user
 * @route   GET /api/roadmap
 * @access  Private
 */
const getRoadmaps = asyncHandler(async (req, res) => {
  const roadmaps = await Roadmap.find({ user: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: roadmaps.length,
    data: roadmaps,
  });
});

/**
 * @desc    Get a single roadmap by ID (must belong to the logged-in user)
 * @route   GET /api/roadmap/:id
 * @access  Private
 */
const getRoadmapById = asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findOne({ _id: req.params.id, user: req.user._id });

  if (!roadmap) {
    throw new ApiError(404, "Roadmap not found");
  }

  res.status(200).json({
    success: true,
    data: roadmap,
  });
});

module.exports = { generateRoadmap, getRoadmaps, getRoadmapById };

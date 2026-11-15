const asyncHandler = require("../middlewares/asyncHandler");
const ApiError = require("../utils/ApiError");
const aiService = require("../services/ai.service");

/**
 * @desc    Analyze skill gap between the logged-in user's current skills
 *          and a target role
 * @route   POST /api/skill-gap/analyze
 * @access  Private
 * @body    { targetRole: string, skills?: string[] }  -- skills optional, defaults to profile skills
 */
const analyzeSkillGap = asyncHandler(async (req, res) => {
  const { skills } = req.body;
  const targetRole = typeof req.body.targetRole === "string" ? req.body.targetRole.trim().slice(0, 100) : "";

  if (!targetRole) {
    throw new ApiError(400, "targetRole is required");
  }

  const currentSkills = (Array.isArray(skills) && skills.length ? skills : req.user.skills).slice(0, 40).map((s) => String(s).slice(0, 50));

  const result = await aiService.analyzeSkillGap({
    currentSkills,
    targetRole,
  }, { userId: req.user._id });

  res.status(200).json({
    success: true,
    message: "Skill gap analysis completed",
    data: result,
  });
});

module.exports = { analyzeSkillGap };

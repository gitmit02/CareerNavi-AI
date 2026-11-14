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
  const { targetRole, skills } = req.body;

  if (!targetRole) {
    throw new ApiError(400, "targetRole is required");
  }

  const currentSkills = Array.isArray(skills) && skills.length ? skills : req.user.skills;

  const result = await aiService.analyzeSkillGap({
    currentSkills,
    targetRole,
  });

  res.status(200).json({
    success: true,
    message: "Skill gap analysis completed",
    data: result,
  });
});

module.exports = { analyzeSkillGap };

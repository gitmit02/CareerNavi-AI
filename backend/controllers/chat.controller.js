const asyncHandler = require("../middlewares/asyncHandler");
const ApiError = require("../utils/ApiError");
const aiService = require("../services/ai.service");

/**
 * @desc    Ask the AI mentor a question (stateless - no chat history/memory)
 * @route   POST /api/chat/ask
 * @access  Private
 * @body    { question: string }
 */
const askMentor = asyncHandler(async (req, res) => {
  const { question } = req.body;

  if (!question || !question.trim()) {
    throw new ApiError(400, "question is required");
  }

  const answer = await aiService.askMentor(question.trim());

  res.status(200).json({
    success: true,
    data: {
      question,
      answer,
    },
  });
});

module.exports = { askMentor };

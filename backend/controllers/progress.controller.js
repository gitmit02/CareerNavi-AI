const asyncHandler = require("../middlewares/asyncHandler");
const ApiError = require("../utils/ApiError");
const Progress = require("../models/Progress.model");
const Roadmap = require("../models/Roadmap.model");

/**
 * Recalculates progressPercent based on completed steps vs total steps.
 */
const recalcPercent = (completedCount, totalCount) => {
  if (!totalCount) return 0;
  return Math.round((completedCount / totalCount) * 100);
};

/**
 * @desc    Mark a roadmap step as complete/incomplete and get/update progress
 * @route   POST /api/progress/:roadmapId/step
 * @access  Private
 * @body    { stepId: string, completed: boolean }
 */
const updateStepProgress = asyncHandler(async (req, res) => {
  const { roadmapId } = req.params;
  const { stepId, completed } = req.body;

  if (!stepId || typeof completed !== "boolean") {
    throw new ApiError(400, "stepId and completed (boolean) are required");
  }

  const roadmap = await Roadmap.findOne({ _id: roadmapId, user: req.user._id });
  if (!roadmap) {
    throw new ApiError(404, "Roadmap not found");
  }

  const step = roadmap.steps.id(stepId);
  if (!step) {
    throw new ApiError(404, "Step not found in this roadmap");
  }

  step.completed = completed;
  await roadmap.save();

  // Find or create the Progress document for this user + roadmap
  let progress = await Progress.findOne({ user: req.user._id, roadmap: roadmapId });
  if (!progress) {
    progress = await Progress.create({ user: req.user._id, roadmap: roadmapId });
  }

  const completedStepIds = roadmap.steps.filter((s) => s.completed).map((s) => s._id);
  progress.completedStepIds = completedStepIds;
  progress.progressPercent = recalcPercent(completedStepIds.length, roadmap.steps.length);

  await progress.save();

  res.status(200).json({
    success: true,
    message: "Progress updated",
    data: { roadmap, progress },
  });
});

/**
 * @desc    Add a weekly progress update/note
 * @route   POST /api/progress/:roadmapId/weekly-update
 * @access  Private
 * @body    { note: string }
 */
const addWeeklyUpdate = asyncHandler(async (req, res) => {
  const { roadmapId } = req.params;
  const { note } = req.body;

  if (!note || !note.trim()) {
    throw new ApiError(400, "note is required");
  }

  const roadmap = await Roadmap.findOne({ _id: roadmapId, user: req.user._id });
  if (!roadmap) {
    throw new ApiError(404, "Roadmap not found");
  }

  let progress = await Progress.findOne({ user: req.user._id, roadmap: roadmapId });
  if (!progress) {
    progress = await Progress.create({ user: req.user._id, roadmap: roadmapId });
  }

  progress.weeklyUpdates.push({ note: note.trim(), date: new Date() });
  await progress.save();

  res.status(201).json({
    success: true,
    message: "Weekly update added",
    data: progress,
  });
});

/**
 * @desc    Get progress for a specific roadmap
 * @route   GET /api/progress/:roadmapId
 * @access  Private
 */
const getProgress = asyncHandler(async (req, res) => {
  const { roadmapId } = req.params;

  const progress = await Progress.findOne({
    user: req.user._id,
    roadmap: roadmapId,
  }).populate("roadmap");

  if (!progress) {
    throw new ApiError(404, "No progress found for this roadmap yet");
  }

  res.status(200).json({
    success: true,
    data: progress,
  });
});

/**
 * @desc    Get progress across ALL roadmaps for the logged-in user
 * @route   GET /api/progress
 * @access  Private
 */
const getAllProgress = asyncHandler(async (req, res) => {
  const progressList = await Progress.find({ user: req.user._id }).populate("roadmap");

  res.status(200).json({
    success: true,
    count: progressList.length,
    data: progressList,
  });
});

module.exports = { updateStepProgress, addWeeklyUpdate, getProgress, getAllProgress };

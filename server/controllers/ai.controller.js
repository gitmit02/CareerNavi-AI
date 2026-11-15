const asyncHandler = require("../middlewares/asyncHandler");
const LlmLog = require("../models/LlmLog.model");
const gateway = require("../services/llmGateway.service");

/** @route GET /api/ai/usage -> the logged-in user's AI gateway usage (last 30 days) + gateway status */
const getUsage = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const status = gateway.getStatus();

  const [totals, byFeature, today, recent] = await Promise.all([
    LlmLog.aggregate([
      { $match: { user: req.user._id, createdAt: { $gte: since } } },
      { $group: {
          _id: null, requests: { $sum: 1 }, errors: { $sum: { $cond: [{ $eq: ["$status", "error"] }, 1, 0] } },
          tokens: { $sum: { $ifNull: ["$totalTokens", 0] } }, cacheHits: { $sum: { $cond: ["$cacheHit", 1, 0] } },
          fallbacks: { $sum: { $cond: [{ $eq: ["$provider", "prune-fallback"] }, 1, 0] } }, avgLatencyMs: { $avg: "$latencyMs" },
      } },
    ]),
    LlmLog.aggregate([
      { $match: { user: req.user._id, createdAt: { $gte: since } } },
      { $group: { _id: "$feature", requests: { $sum: 1 }, tokens: { $sum: { $ifNull: ["$totalTokens", 0] } } } },
      { $sort: { requests: -1 } },
    ]),
    LlmLog.countDocuments({ user: req.user._id, createdAt: { $gte: dayStart } }),
    LlmLog.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(8)
      .select("feature provider model status latencyMs totalTokens cacheHit createdAt").lean(),
  ]);

  const t = totals[0] || { requests: 0, errors: 0, tokens: 0, cacheHits: 0, fallbacks: 0, avgLatencyMs: 0 };
  res.status(200).json({
    success: true,
    data: {
      gateway: status,
      today: { used: today, limit: status.dailyLimit, remaining: Math.max(0, status.dailyLimit - today) },
      last30Days: { ...t, avgLatencyMs: Math.round(t.avgLatencyMs || 0), _id: undefined },
      byFeature: byFeature.map((f) => ({ feature: f._id, requests: f.requests, tokens: f.tokens })),
      recent,
    },
  });
});

module.exports = { getUsage };

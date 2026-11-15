const mongoose = require("mongoose");

// One row per LLM request. Powers usage monitoring + daily per-user limits.
// Never stores prompts, responses or API keys.
const llmLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    feature: { type: String, default: "general" }, // roadmap | skill_gap | mentor_chat | opportunity_analysis
    provider: { type: String, enum: ["prune", "prune-fallback", "direct"], required: true },
    model: String,
    status: { type: String, enum: ["ok", "error"], required: true },
    latencyMs: Number,
    promptTokens: Number,
    completionTokens: Number,
    totalTokens: Number,
    cacheHit: { type: Boolean, default: false },
    pruneMeta: { type: mongoose.Schema.Types.Mixed, default: {} }, // x-prune-* response headers, if any
    fallbackReason: String,
    error: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

llmLogSchema.index({ user: 1, createdAt: -1 });
llmLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 }); // keep 90 days

module.exports = mongoose.model("LlmLog", llmLogSchema);

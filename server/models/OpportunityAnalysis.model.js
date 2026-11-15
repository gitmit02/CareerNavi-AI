const mongoose = require("mongoose");

// Cached AI analysis per (user, opportunity, profile snapshot) so repeat clicks cost nothing.
const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    opportunity: { type: mongoose.Schema.Types.ObjectId, ref: "Opportunity", required: true },
    profileHash: { type: String, required: true },
    result: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);
schema.index({ user: 1, opportunity: 1, profileHash: 1 }, { unique: true });

module.exports = mongoose.model("OpportunityAnalysis", schema);

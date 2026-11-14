const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    duration: { type: String, default: "" }, // e.g. "Week 1-2"
    completed: { type: Boolean, default: false },
  },
  { _id: true }
);

const roadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    careerPath: {
      type: String,
      required: true,
    },
    steps: {
      type: [stepSchema],
      default: [],
    },
    timeline: {
      type: String, // e.g. "90 days"
      default: "90 days",
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    tools: {
      type: [String],
      default: [],
    },
    rawAIResponse: {
      // keeps the original structured JSON from the AI for debugging/reference
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Roadmap", roadmapSchema);

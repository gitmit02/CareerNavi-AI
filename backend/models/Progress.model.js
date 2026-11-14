const mongoose = require("mongoose");

const weeklyUpdateSchema = new mongoose.Schema(
  {
    note: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roadmap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roadmap",
      required: true,
    },
    completedStepIds: {
      // stores the _id of each completed step from the Roadmap.steps array
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    weeklyUpdates: {
      type: [weeklyUpdateSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Ensure a user has only one progress document per roadmap
progressSchema.index({ user: 1, roadmap: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);

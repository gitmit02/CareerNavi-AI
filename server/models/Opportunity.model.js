const mongoose = require("mongoose");

// Normalised listing pulled from a real external source (never AI-generated).
const opportunitySchema = new mongoose.Schema(
  {
    source: { type: String, required: true }, // remotive | arbeitnow | themuse | adzuna | directory
    externalId: { type: String, required: true },
    title: { type: String, required: true },
    company: { type: String, default: "" },
    location: { type: String, default: "" },
    remote: { type: Boolean, default: false },
    type: { type: String, enum: ["internship", "job", "program"], default: "job" },
    url: { type: String, required: true }, // official posting / apply link
    description: { type: String, default: "" }, // plain text, truncated
    partialDescription: { type: Boolean, default: false }, // source only gives an excerpt
    tags: { type: [String], default: [] },
    salary: { type: String, default: "" },
    postedAt: Date,
    curated: { type: Boolean, default: false }, // directory pointer, not a live listing
    fetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

opportunitySchema.index({ source: 1, externalId: 1 }, { unique: true });
opportunitySchema.index({ title: "text", company: "text", tags: "text", description: "text" }, { weights: { title: 5, tags: 3, company: 2, description: 1 } });
opportunitySchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 }); // drop listings not refreshed in 30 days

// Remembers when each source was last fetched so we respect free-API rate limits.
const sourceFetchSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  fetchedAt: Date,
  ok: Boolean,
  count: Number,
  error: String,
});

module.exports = {
  Opportunity: mongoose.model("Opportunity", opportunitySchema),
  SourceFetch: mongoose.model("SourceFetch", sourceFetchSchema),
};

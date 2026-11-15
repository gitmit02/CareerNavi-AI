const crypto = require("crypto");
const asyncHandler = require("../middlewares/asyncHandler");
const ApiError = require("../utils/ApiError");
const { Opportunity } = require("../models/Opportunity.model");
const OpportunityAnalysis = require("../models/OpportunityAnalysis.model");
const sources = require("../services/opportunitySources.service");
const matcher = require("../services/matcher.service");
const roleMatcher = require("../services/roleMatcher.service");
const aiService = require("../services/ai.service");

const profileOf = (u) => ({
  skills: u.skills || [], interests: u.interests || [], degree: u.degree || "", year: u.year || "", careerGoal: u.careerGoal || "",
});
const profileHash = (p) =>
  crypto.createHash("sha1").update(JSON.stringify([p.skills, p.interests, p.degree, p.year, p.careerGoal])).digest("hex").slice(0, 16);
const clean = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : "");
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toListItem = (o, m) => ({
  _id: o._id, title: o.title, company: o.company, location: o.location, remote: o.remote, type: o.type, source: o.source,
  url: o.url, postedAt: o.postedAt, curated: !!o.curated, partialDescription: !!o.partialDescription,
  snippet: (o.description || "").replace(/\s+/g, " ").slice(0, 260),
  matchScore: m.matchScore, verdict: m.verdict, matchedSkills: m.matchedSkills.slice(0, 6), missingSkills: m.missingSkills.slice(0, 5),
});

/**
 * @route GET /api/opportunities/search?q=&type=&remote=&location=&limit=&skip=
 * Refreshes real listings from external sources (cached), then ranks them against the profile.
 */
const search = asyncHandler(async (req, res) => {
  const profile = profileOf(req.user);
  const typed = clean(req.query.q, 80);
  const q = typed || clean(profile.careerGoal, 80);
  const type = ["internship", "job", "program"].includes(req.query.type) ? req.query.type : null;
  const location = clean(req.query.location, 40);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
  const skip = Math.max(parseInt(req.query.skip, 10) || 0, 0);

  const sourceStatus = await sources.ensureFresh(q);

  const filter = {};
  if (q && type !== "program") filter.$text = { $search: q };
  if (type) filter.type = type;
  if (req.query.remote === "true") filter.remote = true;
  if (location) filter.location = new RegExp(escapeRegex(location), "i");

  let query = Opportunity.find(filter);
  if (filter.$text) query = query.select({ score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } });
  else query = query.sort({ postedAt: -1 });
  const docs = await query.limit(250).lean();

  const seen = new Set();
  const ranked = [];
  for (const o of docs) {
    const k = `${o.title}|${o.company}`.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    ranked.push(toListItem(o, matcher.analyze(profile, o)));
  }
  ranked.sort((a, b) => b.matchScore - a.matchScore);

  const roleData = roleMatcher.matchRolesForUser(profile, typed);

  res.status(200).json({
    success: true,
    data: {
      items: ranked.slice(skip, skip + limit),
      roles: roleData.roles,
      userSkills: roleData.userSkills,
      total: ranked.length,
      query: q,
      usedProfileGoal: !typed && !!q,
      profileComplete: profile.skills.length > 0 && !!profile.degree,
      sources: sourceStatus,
    },
  });
});

/**
 * @route GET /api/opportunities/roles?skills=
 * Matches the user's current profile skills + any entered skills/terms to active roles in India
 * with matched skills, missing skills to build, and direct application portal links.
 */
const getRoles = asyncHandler(async (req, res) => {
  const profile = profileOf(req.user);
  const extra = clean(req.query.skills || req.query.q || "", 200);
  const result = roleMatcher.matchRolesForUser(profile, extra);

  res.status(200).json({
    success: true,
    data: {
      roles: result.roles,
      total: result.roles.length,
      userSkills: result.userSkills,
      extraInput: result.extraInput,
      careerGoal: profile.careerGoal,
    },
  });
});

/** @route GET /api/opportunities/:id  -> full listing + rule-based match + saved AI analysis (if any) */
const getOne = asyncHandler(async (req, res) => {
  const opp = await Opportunity.findById(req.params.id).lean();
  if (!opp) throw new ApiError(404, "Opportunity not found");
  const profile = profileOf(req.user);
  const saved = await OpportunityAnalysis.findOne({ user: req.user._id, opportunity: opp._id, profileHash: profileHash(profile) }).lean();
  res.status(200).json({
    success: true,
    data: { opportunity: opp, match: matcher.analyze(profile, opp), ai: saved?.result || null, aiCreatedAt: saved?.createdAt || null },
  });
});

/** @route POST /api/opportunities/:id/analyze  body: { refresh?: boolean }  -> AI explanation + prep roadmap */
const analyze = asyncHandler(async (req, res) => {
  const opp = await Opportunity.findById(req.params.id).lean();
  if (!opp) throw new ApiError(404, "Opportunity not found");
  const profile = profileOf(req.user);
  const hash = profileHash(profile);
  const match = matcher.analyze(profile, opp);

  if (!req.body?.refresh) {
    const saved = await OpportunityAnalysis.findOne({ user: req.user._id, opportunity: opp._id, profileHash: hash }).lean();
    if (saved) return res.status(200).json({ success: true, data: { ai: saved.result, match, cached: true } });
  }

  const ai = await aiService.analyzeOpportunity({ profile, opportunity: opp, match }, { userId: req.user._id });
  await OpportunityAnalysis.findOneAndUpdate(
    { user: req.user._id, opportunity: opp._id, profileHash: hash },
    { $set: { result: ai } },
    { upsert: true, new: true }
  );
  res.status(200).json({ success: true, data: { ai, match, cached: false } });
});

module.exports = { search, getRoles, getOne, analyze };

const ApiError = require("../utils/ApiError");
const gateway = require("./llmGateway.service");
 
/**
 * All LLM traffic goes through the gateway (Prune proxy -> Groq, with logging,
 * per-user daily limits and optional direct fallback). See llmGateway.service.js.
 * @param {Array<{role: string, content: string}>} messages
 * @param {Object} options - { jsonMode, temperature, maxTokens, feature, userId }
 * @returns {Promise<string>} raw text content returned by the model
 */
const callGroq = async (messages, options = {}) => (await gateway.chat(messages, options)).content;

/**
 * Safely parses a JSON string returned by the model.
 * Strips markdown code fences if the model wraps JSON in ```json ... ```.
 */
const safeParseJSON = (text) => {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/, "");
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first > 0 && last > first) cleaned = cleaned.slice(first, last + 1);
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new ApiError(502, "AI service returned malformed JSON");
  }
};

/**
 * Generates a structured career roadmap based on the user's profile.
 * Always returns structured JSON (never plain text) for frontend use.
 *
 * @param {Object} profile - { name, skills, interests, careerGoal, degree, year }
 * @returns {Promise<Object>} structured roadmap JSON
 */
const generateCareerRoadmap = async (profile, ctx = {}) => {
  const systemPrompt = `You are CareerNavi AI, an expert career mentor for college students.
You MUST respond with ONLY a valid JSON object — no markdown, no preamble, no explanation.
The JSON object must exactly follow this schema:
{
  "careerPath": "string - the recommended career path/role",
  "summary": "string - 2-3 sentence overview of why this path fits the student",
  "timeline": "string - e.g. '90 days'",
  "steps": [
    {
      "title": "string - short step title",
      "description": "string - what to do in this step",
      "duration": "string - e.g. 'Week 1-2' or 'Days 1-30'"
    }
  ],
  "requiredSkills": ["string array of skills needed for this career path"],
  "tools": ["string array of tools/technologies to learn"]
}
Generate 5 to 8 steps covering a realistic 30/90 day plan. Be specific and actionable.`;

  const userPrompt = `Generate a personalized career roadmap for this student:
Name: ${profile.name}
Degree: ${profile.degree || "Not specified"}
Year: ${profile.year || "Not specified"}
Current Skills: ${profile.skills?.length ? profile.skills.join(", ") : "None listed"}
Interests: ${profile.interests?.length ? profile.interests.join(", ") : "None listed"}
Career Goal: ${profile.careerGoal || "Not specified - suggest a suitable path based on skills and interests"}

Respond with ONLY the JSON object as per the schema.`;

  const raw = await callGroq(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { jsonMode: true, temperature: 0.5, maxTokens: 4096, feature: "roadmap", userId: ctx.userId }
  );

  return safeParseJSON(raw);
};

/**
 * Analyzes the gap between a user's current skills and a target role's
 * required skills, and returns a structured readiness report.
 *
 * @param {Object} params - { currentSkills: string[], targetRole: string }
 * @returns {Promise<Object>} structured skill gap JSON
 */
const analyzeSkillGap = async (params, ctx = {}) => {
  const { currentSkills, targetRole } = params;

  const systemPrompt = `You are CareerNavi AI's skill assessment engine.
You MUST respond with ONLY a valid JSON object — no markdown, no preamble.
The JSON object must exactly follow this schema:
{
  "targetRole": "string",
  "readinessScore": number (0-100, integer),
  "matchedSkills": ["skills the student already has that are relevant"],
  "missingSkills": ["skills the student needs to learn"],
  "estimatedTimeToGoal": "string - e.g. '3-4 months'",
  "recommendation": "string - 2-3 sentence actionable advice"
}`;

  const userPrompt = `Student's current skills: ${
    currentSkills?.length ? currentSkills.join(", ") : "None listed"
  }
Target role: ${targetRole}

Analyze the gap and respond with ONLY the JSON object as per the schema.`;

  const raw = await callGroq(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { jsonMode: true, temperature: 0.3, maxTokens: 2048, feature: "skill_gap", userId: ctx.userId }
  );

  return safeParseJSON(raw);
};

/**
 * Stateless AI mentor chat. Takes a single question and returns a
 * plain-text mentor-style response (no conversation memory in Phase 1).
 *
 * @param {string} question
 * @returns {Promise<string>} AI response text
 */
const askMentor = async (question, ctx = {}) => {
  const systemPrompt = `You are CareerNavi AI, a friendly, sharp, and knowledgeable career mentor for college students in India.
You MUST format every response in a neat, structured, point-wise layout — NEVER write a single dense paragraph.

Formatting rules:
1. Start with a short 1-sentence direct summary.
2. Organize your advice under 2 to 3 clear section headings using "### Heading Name".
3. Under each heading, write 2 to 4 concise bullet points starting with "- **Bold Point Title:** Clear, actionable explanation with proper punctuation."
4. Leave a blank line between sections so the reply is easy to scan.
5. Keep total length under 220 words unless the user asks for a deep dive.`;

  const response = await callGroq(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ],
    { jsonMode: false, temperature: 0.6, maxTokens: 1500, feature: "mentor_chat", userId: ctx.userId }
  );

  return response.trim();
};

const asArray = (v) => (Array.isArray(v) ? v : []);
const str = (v, d = "") => (typeof v === "string" ? v : d);

/**
 * Explains a REAL listing for a student and builds a prep plan.
 * The model only sees the listing text + rule-based findings and is told not to invent anything.
 * Student name/email are never sent (data minimisation).
 */
const analyzeOpportunity = async ({ profile, opportunity, match }, ctx = {}) => {
  const systemPrompt = `You are CareerNavi AI's opportunity advisor for college students.
You MUST respond with ONLY a valid JSON object — no markdown, no preamble.
STRICT RULES:
- Use ONLY the listing text and the rule-based findings provided. Never invent requirements, deadlines, salaries, eligibility rules, company facts or URLs. Do not output any links.
- If the listing does not state something, write "Not stated in the listing".
- Anything you add beyond the listing (e.g. skills commonly expected for this kind of role) must have basis "typical-for-role"; otherwise basis is "listing".
Schema:
{
  "summary": "string - 2 sentences on what this opportunity is and how well it fits the student",
  "eligibilityExplanation": "string - 3-5 sentences explaining why the student is or isn't eligible, citing the listing",
  "missingSkills": [{ "skill": "string", "importance": "required|preferred", "basis": "listing|typical-for-role", "whyItMatters": "string" }],
  "learnBeforeApplying": [{ "topic": "string", "action": "string - concrete thing to build or practise", "resourceType": "string - kind of resource, no links", "timeEstimate": "string" }],
  "preparationRoadmap": { "totalWeeks": number, "steps": [{ "title": "string", "description": "string", "duration": "string - e.g. 'Week 1-2'" }] },
  "applicationTips": ["string"],
  "caveats": ["string - anything the student must verify on the official posting"]
}
Give 3-6 learnBeforeApplying items and 4-6 roadmap steps. Be specific and realistic.`;

  const userPrompt = `STUDENT PROFILE
Degree: ${profile.degree || "Not specified"}
Year: ${profile.year || "Not specified"}
Skills: ${profile.skills?.length ? profile.skills.join(", ") : "None listed"}
Interests: ${profile.interests?.length ? profile.interests.join(", ") : "None listed"}
Career goal: ${profile.careerGoal || "Not specified"}

LISTING (source: ${opportunity.source}${opportunity.partialDescription ? ", EXCERPT ONLY - full requirements not available" : ""})
Title: ${opportunity.title}
Company: ${opportunity.company || "Not stated"}
Type: ${opportunity.type}
Location: ${opportunity.location || "Not stated"}${opportunity.remote ? " (remote)" : ""}
Text:
${(opportunity.description || "").slice(0, 4000)}

RULE-BASED FINDINGS (already computed from the listing text)
Verdict: ${match.verdict}
Matched skills: ${match.matchedSkills.join(", ") || "none"}
Missing required skills: ${match.missingSkills.join(", ") || "none"}
Missing preferred skills: ${match.preferredMissing.join(", ") || "none"}
Reasons:
${match.reasons.map((r) => `- [${r.status}] ${r.text}`).join("\n")}

Respond with ONLY the JSON object as per the schema.`;

  const raw = await callGroq(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { jsonMode: true, temperature: 0.3, maxTokens: 4096, feature: "opportunity_analysis", userId: ctx.userId }
  );
  const r = safeParseJSON(raw);
  if (!r || typeof r !== "object") throw new ApiError(502, "AI returned an unexpected analysis format");

  return {
    summary: str(r.summary),
    eligibilityExplanation: str(r.eligibilityExplanation),
    missingSkills: asArray(r.missingSkills).map((m) => ({
      skill: str(m.skill), importance: m.importance === "preferred" ? "preferred" : "required",
      basis: m.basis === "typical-for-role" ? "typical-for-role" : "listing", whyItMatters: str(m.whyItMatters),
    })).filter((m) => m.skill),
    learnBeforeApplying: asArray(r.learnBeforeApplying).map((l) => ({
      topic: str(l.topic), action: str(l.action), resourceType: str(l.resourceType), timeEstimate: str(l.timeEstimate),
    })).filter((l) => l.topic),
    preparationRoadmap: {
      totalWeeks: Number(r.preparationRoadmap?.totalWeeks) || 0,
      steps: asArray(r.preparationRoadmap?.steps).map((s) => ({ title: str(s.title), description: str(s.description), duration: str(s.duration) })).filter((s) => s.title),
    },
    applicationTips: asArray(r.applicationTips).map((t) => str(t)).filter(Boolean),
    caveats: asArray(r.caveats).map((t) => str(t)).filter(Boolean),
  };
};

module.exports = {
  generateCareerRoadmap,
  analyzeSkillGap,
  askMentor,
  analyzeOpportunity,
};

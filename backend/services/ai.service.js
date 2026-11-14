const axios = require("axios");
const ApiError = require("../utils/ApiError");

const GROQ_API_URL =
  process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";

/**
 * Low-level helper that sends a chat completion request to Groq.
 * @param {Array<{role: string, content: string}>} messages
 * @param {Object} options - { jsonMode: boolean, temperature: number }
 * @returns {Promise<string>} raw text content returned by the model
 */
const callGroq = async (messages, options = {}) => {
  const { jsonMode = false, temperature = 0.4 } = options;

  if (!process.env.GROQ_API_KEY) {
    throw new ApiError(500, "GROQ_API_KEY is not configured on the server");
  }

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        // model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
        messages,
        temperature,
        // Groq supports OpenAI-style JSON mode for structured output
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new ApiError(502, "AI service returned an empty response");
    }
    return content;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    const status = error.response?.status;
    const groqMessage =
      error.response?.data?.error?.message || error.message || "Unknown AI error";

    console.error("Groq API Error:", groqMessage);
    throw new ApiError(
      status && status < 500 ? 502 : 503,
      `AI service request failed: ${groqMessage}`
    );
  }
};

/**
 * Safely parses a JSON string returned by the model.
 * Strips markdown code fences if the model wraps JSON in ```json ... ```.
 */
const safeParseJSON = (text) => {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/, "");
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
const generateCareerRoadmap = async (profile) => {
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
    { jsonMode: true, temperature: 0.5 }
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
const analyzeSkillGap = async (params) => {
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
    { jsonMode: true, temperature: 0.3 }
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
const askMentor = async (question) => {
  const systemPrompt = `You are CareerNavi AI, a friendly and knowledgeable career mentor for college students.
Give clear, concise, encouraging, and practical advice. Keep responses focused and under 200 words
unless the question requires more detail. Do not use markdown headers.`;

  const response = await callGroq(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ],
    { jsonMode: false, temperature: 0.6 }
  );

  return response.trim();
};

module.exports = {
  generateCareerRoadmap,
  analyzeSkillGap,
  askMentor,
};

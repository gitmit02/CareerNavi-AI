const axios = require("axios");
const ApiError = require("../utils/ApiError");

// `deps` is exported so tests can swap the DB model / HTTP client.
const deps = { LlmLog: require("../models/LlmLog.model"), http: axios };

const int = (v, d) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
};

// Read env lazily so tests / dotenv load order never matter.
const config = () => ({
  groqUrl: process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions",
  groqKey: process.env.GROQ_API_KEY,
  model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  pruneKey: process.env.PRUNE_API_KEY,
  pruneBase: (process.env.PRUNE_BASE_URL || "https://api.withprune.com").replace(/\/+$/, ""),
  fallback: process.env.PRUNE_FALLBACK !== "false",
  dailyLimit: int(process.env.AI_DAILY_LIMIT_PER_USER, 40),
  timeout: int(process.env.AI_TIMEOUT_MS, 45000),
  maxPromptChars: int(process.env.AI_MAX_PROMPT_CHARS, 16000),
});
 
/** Non-secret status, used by the usage endpoint / UI. */
const getStatus = () => {
  const c = config();
  return {
    gateway: c.pruneKey ? "prune" : "direct",
    pruneConfigured: !!c.pruneKey,
    fallbackEnabled: c.fallback,
    model: c.model,
    dailyLimit: c.dailyLimit,
  };
};

const pruneMetaFrom = (headers = {}) => {
  const meta = {};
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase().startsWith("x-prune-")) meta[k.toLowerCase()] = String(v).slice(0, 200);
  }
  return meta;
};
// Best effort: any x-prune-*cache* header whose value says hit/true.
const detectCacheHit = (meta) => Object.entries(meta).some(([k, v]) => /cache/.test(k) && /hit|true/i.test(v));

const enforceDailyLimit = async (userId, limit) => {
  if (!userId || limit <= 0) return;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  let used;
  try {
    used = await deps.LlmLog.countDocuments({ user: userId, createdAt: { $gte: start } });
  } catch {
    return; // monitoring DB hiccup must not take the feature down
  }
  if (used >= limit) {
    throw new ApiError(429, `Daily AI request limit reached (${limit}/day). Please try again tomorrow.`);
  }
};

const viaPrune = (c, body, feature) =>
  deps.http.post(
    `${c.pruneBase}/v1/proxy/groq/chat/completions`,
    { ...body, user_api_key: c.groqKey }, // Prune vaults/forwards the provider key
    {
      timeout: c.timeout,
      headers: {
        "Content-Type": "application/json",
        "X-Prune-Key": c.pruneKey,
        Authorization: `Bearer ${c.groqKey}`,
        "X-Prune-Workload": feature,
        "X-Prune-Template-Id": `careernavi_${feature}`,
      },
    }
  );

const viaDirect = (c, body) =>
  deps.http.post(c.groqUrl, body, {
    timeout: c.timeout,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${c.groqKey}` },
  });

// Don't silently bypass Prune when it refuses because of a budget / rate limit.
const shouldFallback = (err) => ![402, 429].includes(err.response?.status);

/**
 * Single entry point for every LLM call in the app.
 * @returns {Promise<{content: string, meta: object}>}
 */
const chat = async (messages, opts = {}) => {
  const { jsonMode = false, temperature = 0.4, maxTokens = 2048, feature = "general", userId = null } = opts;
  const c = config();

  if (!c.groqKey) throw new ApiError(500, "GROQ_API_KEY is not configured on the server");

  const chars = messages.reduce((n, m) => n + (m.content || "").length, 0);
  if (chars > c.maxPromptChars) throw new ApiError(413, "Request is too large for the AI service");

  await enforceDailyLimit(userId, c.dailyLimit);

  const body = {
    model: c.model,
    messages,
    temperature,
    max_completion_tokens: maxTokens,
    ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
  };

  const started = Date.now();
  let provider = c.pruneKey ? "prune" : "direct";
  let fallbackReason;
  let response;

  const log = (fields) =>
    Promise.resolve(
      deps.LlmLog.create({ user: userId || undefined, feature, model: c.model, latencyMs: Date.now() - started, ...fields })
    ).catch(() => {});

  try {
    if (c.pruneKey) {
      try {
        response = await viaPrune(c, body, feature);
      } catch (err) {
        if (!c.fallback || !shouldFallback(err)) throw err;
        fallbackReason = err.response ? `proxy HTTP ${err.response.status}` : `proxy ${err.code || "network error"}`;
        provider = "prune-fallback";
        response = await viaDirect(c, body);
      }
    } else {
      response = await viaDirect(c, body);
    }

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) throw new ApiError(502, "AI service returned an empty response");

    const usage = response.data?.usage || {};
    const pruneMeta = pruneMetaFrom(response.headers);
    const cacheHit = detectCacheHit(pruneMeta);
    const meta = {
      provider,
      cacheHit,
      latencyMs: Date.now() - started,
      totalTokens: usage.total_tokens || 0,
      fallbackReason,
    };
    log({
      provider,
      status: "ok",
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      cacheHit,
      pruneMeta,
      fallbackReason,
    });
    return { content, meta };
  } catch (error) {
    const status = error.response?.status;
    const upstream = error.response?.data?.error?.message || error.response?.data?.message || error.message || "Unknown AI error";
    log({ provider, status: "error", fallbackReason, error: String(upstream).slice(0, 300) });
    if (error instanceof ApiError) throw error;
    console.error(`LLM gateway error (${provider}):`, upstream);
    throw new ApiError(status && status < 500 ? 502 : 503, `AI service request failed: ${upstream}`);
  }
};

module.exports = { chat, getStatus, deps };

const test = require("node:test");
const assert = require("node:assert");
const http = require("http");
const gw = require("../services/llmGateway.service");

const startServer = (handler) =>
  new Promise((resolve) => {
    const hits = [];
    const srv = http.createServer((req, res) => {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        const parsed = body ? JSON.parse(body) : {};
        hits.push({ url: req.url, headers: req.headers, body: parsed });
        handler(req, res, parsed);
      });
    });
    srv.listen(0, "127.0.0.1", () => resolve({ srv, hits, url: `http://127.0.0.1:${srv.address().port}` }));
  });

const ok = (res, extraHeaders = {}) => {
  res.writeHead(200, { "Content-Type": "application/json", ...extraHeaders });
  res.end(JSON.stringify({ choices: [{ message: { content: '{"a":1}' } }], usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 } }));
};
const fail = (res, code) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: { message: `status ${code}` } })); };

const logs = [];
let used = 0;
gw.deps.LlmLog = { countDocuments: async () => used, create: async (d) => { logs.push(d); } };
const msgs = [{ role: "user", content: "hi" }];
const set = (o) => Object.entries(o).forEach(([k, v]) => (v === undefined ? delete process.env[k] : (process.env[k] = v)));
const base = { GROQ_API_KEY: "gsk_test", GROQ_MODEL: "m", PRUNE_API_KEY: undefined, PRUNE_FALLBACK: undefined, AI_DAILY_LIMIT_PER_USER: "5" };

test("no Prune key -> goes direct to Groq with bearer key, logs it", async () => {
  const groq = await startServer((q, r) => ok(r));
  set({ ...base, GROQ_API_URL: groq.url + "/chat" });
  logs.length = 0;
  const { content, meta } = await gw.chat(msgs, { feature: "mentor_chat", userId: "u1", jsonMode: true });
  assert.strictEqual(content, '{"a":1}');
  assert.strictEqual(meta.provider, "direct");
  assert.strictEqual(groq.hits[0].headers.authorization, "Bearer gsk_test");
  assert.deepStrictEqual(groq.hits[0].body.response_format, { type: "json_object" });
  assert.strictEqual(logs[0].provider, "direct"); assert.strictEqual(logs[0].totalTokens, 15);
  groq.srv.close();
});

test("Prune configured -> proxied with X-Prune-Key + workload, cache-hit header recorded", async () => {
  const prune = await startServer((q, r) => ok(r, { "x-prune-cache": "hit", "x-prune-tokens-saved": "120" }));
  set({ ...base, PRUNE_API_KEY: "prune_k", PRUNE_BASE_URL: prune.url + "/" });
  logs.length = 0;
  const { meta } = await gw.chat(msgs, { feature: "roadmap", userId: "u1" });
  assert.strictEqual(meta.provider, "prune"); assert.strictEqual(meta.cacheHit, true);
  const h = prune.hits[0];
  assert.strictEqual(h.url, "/v1/proxy/groq/chat/completions");
  assert.strictEqual(h.headers["x-prune-key"], "prune_k");
  assert.strictEqual(h.headers["x-prune-workload"], "roadmap");
  assert.strictEqual(h.body.user_api_key, "gsk_test");
  assert.strictEqual(logs[0].pruneMeta["x-prune-tokens-saved"], "120");
  prune.srv.close();
});

test("Prune 5xx -> falls back to Groq directly and records why", async () => {
  const prune = await startServer((q, r) => fail(r, 502));
  const groq = await startServer((q, r) => ok(r));
  set({ ...base, PRUNE_API_KEY: "prune_k", PRUNE_BASE_URL: prune.url, GROQ_API_URL: groq.url });
  logs.length = 0;
  const { meta } = await gw.chat(msgs, { userId: "u1" });
  assert.strictEqual(meta.provider, "prune-fallback");
  assert.match(meta.fallbackReason, /502/);
  assert.strictEqual(groq.hits.length, 1);
  prune.srv.close(); groq.srv.close();
});

test("Prune 429/402 (budget or rate refusal) is NOT bypassed via fallback", async () => {
  const prune = await startServer((q, r) => fail(r, 429));
  const groq = await startServer((q, r) => ok(r));
  set({ ...base, PRUNE_API_KEY: "prune_k", PRUNE_BASE_URL: prune.url, GROQ_API_URL: groq.url });
  await assert.rejects(() => gw.chat(msgs, { userId: "u1" }), (e) => e.statusCode === 502);
  assert.strictEqual(groq.hits.length, 0);
  prune.srv.close(); groq.srv.close();
});

test("PRUNE_FALLBACK=false disables fallback", async () => {
  const prune = await startServer((q, r) => fail(r, 500));
  const groq = await startServer((q, r) => ok(r));
  set({ ...base, PRUNE_API_KEY: "prune_k", PRUNE_BASE_URL: prune.url, GROQ_API_URL: groq.url, PRUNE_FALLBACK: "false" });
  await assert.rejects(() => gw.chat(msgs, { userId: "u1" }), (e) => e.statusCode === 503);
  assert.strictEqual(groq.hits.length, 0);
  prune.srv.close(); groq.srv.close();
});

test("daily limit, prompt size cap and missing key are enforced before any network call", async () => {
  set({ ...base, GROQ_API_URL: "http://127.0.0.1:1/never" });
  used = 5;
  await assert.rejects(() => gw.chat(msgs, { userId: "u1" }), (e) => e.statusCode === 429);
  used = 0;
  await assert.rejects(() => gw.chat([{ role: "user", content: "x".repeat(17000) }], { userId: "u1" }), (e) => e.statusCode === 413);
  set({ GROQ_API_KEY: undefined });
  await assert.rejects(() => gw.chat(msgs, {}), (e) => e.statusCode === 500);
});

test("errors are logged without leaking keys", async () => {
  const groq = await startServer((q, r) => fail(r, 500));
  set({ ...base, GROQ_API_URL: groq.url });
  logs.length = 0;
  await assert.rejects(() => gw.chat(msgs, { userId: "u1" }));
  assert.strictEqual(logs[0].status, "error");
  assert.ok(!JSON.stringify(logs[0]).includes("gsk_test"));
  groq.srv.close();
});

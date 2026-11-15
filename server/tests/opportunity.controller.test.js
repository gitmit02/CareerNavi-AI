const test = require("node:test");
const assert = require("node:assert");
const http = require("http");

const { Opportunity } = require("../models/Opportunity.model");
const OpportunityAnalysis = require("../models/OpportunityAnalysis.model");
const sources = require("../services/opportunitySources.service");
const gw = require("../services/llmGateway.service");
const ctrl = require("../controllers/opportunity.controller");

const user = { _id: "u1", name: "Riya Sharma", email: "riya@example.com", skills: ["JavaScript", "React", "Git"], interests: ["Web Development"], degree: "B.Tech CSE", year: "3rd Year", careerGoal: "Frontend Developer" };
const docs = [
  { _id: "a1", source: "remotive", title: "Frontend Intern", company: "Acme", type: "internship", url: "https://x/1", remote: true, description: "Currently enrolled students. React, JavaScript, Git. Nice to have: Docker.", tags: [] },
  { _id: "a2", source: "arbeitnow", title: "Senior Platform Engineer", company: "Big", type: "job", url: "https://x/2", description: "8+ years of experience with Kubernetes, AWS and Java.", tags: [] },
  { _id: "a3", source: "themuse", title: "Frontend Intern", company: "Acme", type: "internship", url: "https://x/3", description: "duplicate of a1 from another source", tags: [] },
];

const call = (fn, req) => new Promise((resolve, reject) => {
  const res = { status(c) { this.code = c; return this; }, json(b) { resolve({ code: this.code, body: b }); } };
  fn(req, res, reject);
});

let seenFilter;
Opportunity.find = (f) => { seenFilter = f; const c = { select: () => c, sort: () => c, limit: () => c, lean: async () => docs }; return c; };
Opportunity.findById = (id) => ({ lean: async () => docs.find((d) => d._id === id) || null });
sources.ensureFresh = async () => [{ name: "remotive", ok: true, count: 3 }];

test("search ranks by match, drops duplicates, uses career goal when q is empty, hides full descriptions", async () => {
  const { code, body } = await call(ctrl.search, { user, query: {} });
  assert.strictEqual(code, 200);
  const d = body.data;
  assert.strictEqual(d.usedProfileGoal, true);
  assert.strictEqual(d.query, "Frontend Developer");
  assert.deepStrictEqual(seenFilter.$text, { $search: "Frontend Developer" });
  assert.strictEqual(d.items.length, 2, "duplicate title+company removed");
  assert.strictEqual(d.items[0].title, "Frontend Intern");
  assert.strictEqual(d.items[0].verdict, "eligible");
  assert.strictEqual(d.items[1].verdict, "not_eligible");
  assert.ok(d.items[0].matchScore > d.items[1].matchScore);
  assert.ok(!("description" in d.items[0]));
  assert.ok(d.sources.length === 1);
});

test("type=program skips the text filter so directory programmes always list; inputs are sanitised", async () => {
  await call(ctrl.search, { user, query: { type: "program", q: "x".repeat(500), location: "De.lhi(" } });
  assert.strictEqual(seenFilter.$text, undefined);
  assert.strictEqual(seenFilter.type, "program");
  assert.ok(seenFilter.location instanceof RegExp && seenFilter.location.test("De.lhi("));
});

test("analyze: prompt is grounded + minimised, output is sanitised, result cached", async () => {
  let groqHits = [];
  const groq = http.createServer((req, res) => {
    let b = ""; req.on("data", (c) => (b += c));
    req.on("end", () => {
      groqHits.push(JSON.parse(b));
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        choices: [{ message: { content: "```json\n" + JSON.stringify({
          summary: "Good fit.", eligibilityExplanation: "You are a current student.",
          missingSkills: [{ skill: "Docker", importance: "weird", basis: "listing", whyItMatters: "listed as nice to have" }, { skill: "" }],
          learnBeforeApplying: [{ topic: "Docker basics", action: "Containerise a MERN app", resourceType: "official docs", timeEstimate: "1 week" }],
          preparationRoadmap: { totalWeeks: "3", steps: [{ title: "Learn Docker", description: "d", duration: "Week 1" }, { nope: 1 }] },
          applicationTips: ["Tailor your CV", 5], caveats: ["Confirm deadline on the official page"],
        }) + "\n```" } }],
        usage: { total_tokens: 200 },
      }));
    });
  });
  await new Promise((r) => groq.listen(0, "127.0.0.1", r));
  Object.assign(process.env, { GROQ_API_KEY: "gsk_t", GROQ_API_URL: `http://127.0.0.1:${groq.address().port}` });
  delete process.env.PRUNE_API_KEY;
  gw.deps.LlmLog = { countDocuments: async () => 0, create: async () => {} };

  let saved = null;
  OpportunityAnalysis.findOne = () => ({ lean: async () => saved });
  OpportunityAnalysis.findOneAndUpdate = async (q, u) => { saved = { result: u.$set.result, createdAt: new Date() }; return saved; };

  const first = await call(ctrl.analyze, { user, params: { id: "a1" }, body: {} });
  assert.strictEqual(first.body.data.cached, false);
  const ai = first.body.data.ai;
  assert.strictEqual(ai.missingSkills.length, 1);
  assert.strictEqual(ai.missingSkills[0].importance, "required"); // invalid enum -> safe default
  assert.strictEqual(ai.preparationRoadmap.totalWeeks, 3);
  assert.strictEqual(ai.preparationRoadmap.steps.length, 1);
  assert.deepStrictEqual(ai.applicationTips, ["Tailor your CV", ""].filter(Boolean));

  const sent = JSON.stringify(groqHits[0].messages);
  assert.ok(sent.includes("Frontend Intern") && sent.includes("Currently enrolled"), "listing text is in the prompt");
  assert.ok(sent.includes("Never invent"), "grounding rule present");
  assert.ok(!sent.includes("Riya") && !sent.includes("riya@example.com"), "no PII sent to the LLM");
  assert.strictEqual(groqHits[0].response_format.type, "json_object");

  const second = await call(ctrl.analyze, { user, params: { id: "a1" }, body: {} });
  assert.strictEqual(second.body.data.cached, true);
  assert.strictEqual(groqHits.length, 1, "cached result must not call the LLM again");

  const forced = await call(ctrl.analyze, { user, params: { id: "a1" }, body: { refresh: true } });
  assert.strictEqual(forced.body.data.cached, false);
  assert.strictEqual(groqHits.length, 2);
  groq.close();
});

test("analyze/getOne return 404 for unknown id", async () => {
  await assert.rejects(() => call(ctrl.analyze, { user, params: { id: "nope" }, body: {} }), (e) => e.statusCode === 404);
  await assert.rejects(() => call(ctrl.getOne, { user, params: { id: "nope" } }), (e) => e.statusCode === 404);
});

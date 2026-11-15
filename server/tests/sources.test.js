const test = require("node:test");
const assert = require("node:assert");
const svc = require("../services/opportunitySources.service");
const { normalizers, htmlToText, classify } = svc;

test("htmlToText strips tags/entities", () => {
  assert.strictEqual(htmlToText("<p>Hello &amp; welcome</p><ul><li>React</li><li>Node</li></ul>"), "Hello & welcome\nReact\nNode");
});

test("classify detects internships/trainee roles only from title/type", () => {
  assert.strictEqual(classify("Software Engineering Intern"), "internship");
  assert.strictEqual(classify("Data Analyst", "full_time"), "job");
  assert.strictEqual(classify("Graduate Trainee"), "internship");
});

// Fixtures follow each provider's documented response shape.
test("remotive / arbeitnow / themuse / adzuna normalisers", () => {
  const r = normalizers.remotive({ id: 1, url: "https://remotive.com/x", title: "Backend Intern", company_name: "Acme", tags: ["node"], candidate_required_location: "Worldwide", description: "<p>Node</p>", publication_date: "2026-11-01T00:00:00" });
  assert.deepStrictEqual([r.source, r.type, r.remote, r.description], ["remotive", "internship", true, "Node"]);
  const a = normalizers.arbeitnow({ slug: "abc", title: "Dev", company_name: "B", location: "Berlin", remote: false, url: "https://arbeitnow.com/abc", description: "<b>x</b>", tags: [], job_types: ["internship"], created_at: 1760000000 });
  assert.strictEqual(a.type, "internship"); assert.ok(a.postedAt instanceof Date);
  const m = normalizers.themuse({ id: 9, name: "Analyst", company: { name: "C" }, locations: [{ name: "Flexible / Remote" }], levels: [{ name: "Internship" }], categories: [{ name: "Data" }], refs: { landing_page: "https://themuse.com/j" }, contents: "<p>SQL</p>", publication_date: "2026-10-01T00:00:00Z" });
  assert.deepStrictEqual([m.type, m.remote, m.tags], ["internship", true, ["Data"]]);
  const z = normalizers.adzuna({ id: "77", title: "Trainee", company: { display_name: "D" }, location: { display_name: "Delhi" }, redirect_url: "https://adzuna.in/x", description: "excerpt", created: "2026-11-02T00:00:00Z", category: { label: "IT" } });
  assert.deepStrictEqual([z.type, z.partialDescription, z.location], ["internship", true, "Delhi"]);
});

test("directory programmes carry no dates or eligibility claims", () => {
  for (const p of svc.PROGRAMS) {
    assert.strictEqual(p.type, "program");
    assert.ok(/^https:\/\//.test(p.url));
    assert.ok(!/\b20\d\d\b|stipend|\$/i.test(p.description), p.title);
  }
});

test("ensureFresh: caches by TTL, tolerates failing sources, skips unconfigured ones", async () => {
  const store = new Map(); const written = [];
  let calls = 0;
  svc.deps.SourceFetch = {
    findOne: ({ key }) => ({ lean: async () => store.get(key) || null }),
    updateOne: async ({ key }, { $set }) => { store.set(key, { key, ...$set }); },
  };
  svc.deps.Opportunity = { bulkWrite: async (ops) => { written.push(...ops); } };
  svc.deps.http = {
    get: async (url) => {
      calls++;
      if (url.includes("remotive")) return { data: { jobs: [{ id: 1, url: "https://remotive.com/1", title: "Intern", company_name: "A", description: "x" }, { id: 2, title: "no url -> dropped" }] } };
      if (url.includes("arbeitnow")) throw Object.assign(new Error("boom"), { response: { status: 503 } });
      return { data: { results: [] } };
    },
  };
  delete process.env.ADZUNA_APP_ID;
  const first = await svc.ensureFresh("react");
  const by = Object.fromEntries(first.map((s) => [s.name, s]));
  assert.strictEqual(by.remotive.ok, true); assert.strictEqual(by.remotive.count, 1);
  assert.strictEqual(by.arbeitnow.ok, false); assert.match(by.arbeitnow.error, /503/);
  assert.strictEqual(by.adzuna.skipped, true);
  assert.strictEqual(by.directory.count, svc.PROGRAMS.length);
  assert.strictEqual(written.filter((o) => o.updateOne.filter.source === "remotive").length, 1);

  const before = calls;
  const second = await svc.ensureFresh("react");
  assert.strictEqual(calls, before, "second call must be served from cache / failure backoff (no new HTTP)");
  assert.ok(second.find((s) => s.name === "remotive").cached);
});

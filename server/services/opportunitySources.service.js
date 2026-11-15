const axios = require("axios");
const { Opportunity, SourceFetch } = require("../models/Opportunity.model");

const deps = { http: axios, Opportunity, SourceFetch };

const TTL_MS = (parseInt(process.env.OPPORTUNITY_CACHE_MINUTES, 10) || 360) * 60 * 1000;
const FAIL_BACKOFF_MS = 10 * 60 * 1000;
const UA = { "User-Agent": "CareerNaviAI/1.0 (student career project)" };

// ---------- helpers ----------
const htmlToText = (html = "") =>
  String(html)
    .replace(/<\s*(br|\/p|\/li|\/div|\/h\d)\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&rsquo;|&apos;/g, "'")
    .replace(/[ \t]+/g, " ").replace(/ ?\n ?/g, "\n").replace(/\n{2,}/g, "\n").trim()
    .slice(0, 6000);

const INTERN_RE = /\b(intern(ship)?s?|trainee|apprentice(ship)?|fresher|co-?op|working student)\b/i;
const classify = (title = "", extra = "") => (INTERN_RE.test(`${title} ${extra}`) ? "internship" : "job");
const toDate = (v) => { const d = v ? new Date(v) : null; return d && !isNaN(d) ? d : undefined; };
const get = (url, params) => deps.http.get(url, { params, timeout: 15000, headers: UA }).then((r) => r.data);

// ---------- per-source normalisers (pure; unit-tested) ----------
const normalizers = {
  remotive: (j) => ({
    source: "remotive", externalId: String(j.id), title: j.title, company: j.company_name,
    location: j.candidate_required_location || "Remote", remote: true, type: classify(j.title, j.job_type),
    url: j.url, description: htmlToText(j.description), tags: j.tags || [], salary: j.salary || "", postedAt: toDate(j.publication_date),
  }),
  arbeitnow: (j) => ({
    source: "arbeitnow", externalId: String(j.slug), title: j.title, company: j.company_name, location: j.location || "",
    remote: !!j.remote, type: classify(j.title, (j.job_types || []).join(" ")), url: j.url,
    description: htmlToText(j.description), tags: j.tags || [], postedAt: j.created_at ? new Date(j.created_at * 1000) : undefined,
  }),
  themuse: (j) => ({
    source: "themuse", externalId: String(j.id), title: j.name, company: j.company?.name || "",
    location: (j.locations || []).map((l) => l.name).join("; ") || "Not specified",
    remote: (j.locations || []).some((l) => /remote|flexible/i.test(l.name)),
    type: (j.levels || []).some((l) => /intern/i.test(l.name)) ? "internship" : classify(j.name),
    url: j.refs?.landing_page, description: htmlToText(j.contents), tags: (j.categories || []).map((c) => c.name),
    postedAt: toDate(j.publication_date),
  }),
  adzuna: (j) => ({
    source: "adzuna", externalId: String(j.id), title: htmlToText(j.title), company: j.company?.display_name || "",
    location: j.location?.display_name || "", remote: /remote/i.test(`${j.title} ${j.location?.display_name}`),
    type: classify(j.title, j.contract_type || ""), url: j.redirect_url, description: htmlToText(j.description),
    partialDescription: true, // Adzuna only returns an excerpt
    tags: [j.category?.label].filter(Boolean),
    salary: j.salary_min ? `${Math.round(j.salary_min)}${j.salary_max ? `–${Math.round(j.salary_max)}` : ""}` : "",
    postedAt: toDate(j.created),
  }),
};

// ---------- directory of well-known student programmes (pointers only) ----------
// Deliberately NO dates, stipends or eligibility: those change every cycle and
// must be read from the official page. The matcher reports them as "unclear".
const NOTE = " Timelines and eligibility change every cycle; read the official page before applying.";
const PROGRAMS = [
  { id: "gsoc", title: "Google Summer of Code", company: "Google & open-source organisations", url: "https://summerofcode.withgoogle.com/", tags: ["open source", "mentorship"], description: "Programme where contributors work on open-source projects with mentoring organisations." + NOTE },
  { id: "outreachy", title: "Outreachy Internships", company: "Outreachy", url: "https://www.outreachy.org/", tags: ["open source", "internship"], description: "Remote internship programme in open source and open science." + NOTE },
  { id: "mlh-fellowship", title: "MLH Fellowship", company: "Major League Hacking", url: "https://fellowship.mlh.io/", tags: ["fellowship", "software engineering"], description: "Remote tech fellowship run by Major League Hacking." + NOTE },
  { id: "lfx-mentorship", title: "LFX Mentorship", company: "Linux Foundation", url: "https://lfx.linuxfoundation.org/tools/mentorship/", tags: ["open source", "mentorship"], description: "Mentorship programme connecting contributors with Linux Foundation open-source projects." + NOTE },
].map((p) => ({ source: "directory", externalId: p.id, title: p.title, company: p.company, location: "Remote / Online", remote: true, type: "program", url: p.url, description: p.description, tags: p.tags, curated: true }));

// ---------- fetchers ----------
const MUSE_PARAMS = [{ level: "Internship", page: 0 }, { level: "Internship", page: 1 }, { level: "Entry Level", page: 0 }];

const SOURCES = [
  { name: "remotive", fetch: async () => (await get("https://remotive.com/api/remote-jobs", { limit: 300 })).jobs.map(normalizers.remotive) },
  { name: "arbeitnow", fetch: async () => (await get("https://www.arbeitnow.com/api/job-board-api")).data.map(normalizers.arbeitnow) },
  {
    name: "themuse",
    fetch: async () => {
      const key = process.env.MUSE_API_KEY;
      const pages = await Promise.all(MUSE_PARAMS.map((p) => get("https://www.themuse.com/api/public/jobs", { ...p, ...(key ? { api_key: key } : {}) })));
      return pages.flatMap((d) => d.results || []).map(normalizers.themuse);
    },
  },
  {
    name: "adzuna", perQuery: true,
    enabled: () => !!(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY),
    fetch: async (q) => {
      const country = (process.env.ADZUNA_COUNTRY || "in").toLowerCase();
      const data = await get(`https://api.adzuna.com/v1/api/jobs/${country}/search/1`, {
        app_id: process.env.ADZUNA_APP_ID, app_key: process.env.ADZUNA_APP_KEY, results_per_page: 50,
        what_or: "intern internship trainee fresher graduate", ...(q ? { what: q } : {}),
      });
      return (data.results || []).map(normalizers.adzuna);
    },
  },
  { name: "directory", fetch: async () => PROGRAMS },
];

const valid = (o) => o && o.title && o.url && o.externalId && /^https?:\/\//i.test(o.url);

/** Refresh any source whose cache is stale. Failures are reported, never hidden or faked. */
const ensureFresh = async (q = "") => {
  const query = q.trim().toLowerCase();
  const statuses = await Promise.all(
    SOURCES.map(async (src) => {
      if (src.enabled && !src.enabled()) return { name: src.name, ok: false, skipped: true, error: "not configured (add API keys to enable)" };
      const key = `${src.name}:${src.perQuery ? query : "*"}`;
      try {
        const rec = await deps.SourceFetch.findOne({ key }).lean();
        const age = rec ? Date.now() - new Date(rec.fetchedAt).getTime() : Infinity;
        if (rec?.ok && age < TTL_MS) return { name: src.name, ok: true, cached: true, count: rec.count };
        if (rec && !rec.ok && age < FAIL_BACKOFF_MS) return { name: src.name, ok: false, cached: true, error: rec.error };

        let status;
        try {
          const items = (await src.fetch(query)).filter(valid);
          const now = new Date();
          if (items.length) {
            await deps.Opportunity.bulkWrite(
              items.map((o) => ({ updateOne: { filter: { source: o.source, externalId: o.externalId }, update: { $set: { ...o, fetchedAt: now } }, upsert: true } })),
              { ordered: false }
            );
          }
          await deps.SourceFetch.updateOne({ key }, { $set: { fetchedAt: now, ok: true, count: items.length, error: "" } }, { upsert: true });
          status = { name: src.name, ok: true, count: items.length };
        } catch (err) {
          const msg = (err.response ? `HTTP ${err.response.status}` : err.message || "request failed").slice(0, 150);
          await deps.SourceFetch.updateOne({ key }, { $set: { fetchedAt: new Date(), ok: false, count: 0, error: msg } }, { upsert: true });
          status = { name: src.name, ok: false, error: msg };
        }
        return status;
      } catch (err) {
        return { name: src.name, ok: false, error: "cache lookup failed" };
      }
    })
  );
  return statuses;
};

module.exports = { ensureFresh, normalizers, htmlToText, classify, PROGRAMS, SOURCES, deps };

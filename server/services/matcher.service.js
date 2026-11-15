/**
 * Rule-based opportunity matcher. No LLM, no network, no invented facts:
 * every eligibility reason is derived from the listing text (with an evidence
 * snippet) or from the student's saved profile. If the listing is silent,
 * we say so instead of guessing.
 */

// canonical skill -> aliases (all lowercase)
const SKILLS = {
  javascript: ["javascript", "js", "es6"], typescript: ["typescript", "ts"], python: ["python"], java: ["java"],
  "c++": ["c++", "cpp"], "c#": ["c#", "csharp"], golang: ["golang"], rust: ["rust"], php: ["php"], ruby: ["ruby", "ruby on rails"],
  kotlin: ["kotlin"], swift: ["swift"], sql: ["sql"], mysql: ["mysql"], postgresql: ["postgresql", "postgres"],
  mongodb: ["mongodb", "mongo"], redis: ["redis"], react: ["react", "reactjs", "react.js"], "react native": ["react native"],
  "next.js": ["next.js", "nextjs"], angular: ["angular", "angularjs"], vue: ["vue", "vuejs", "vue.js"],
  "node.js": ["node.js", "nodejs", "node"], express: ["express", "expressjs", "express.js"], django: ["django"], flask: ["flask"],
  fastapi: ["fastapi"], "spring boot": ["spring boot", "spring"], html: ["html", "html5"], css: ["css", "css3"],
  tailwind: ["tailwind", "tailwindcss"], bootstrap: ["bootstrap"], "rest api": ["rest api", "restful", "rest apis", "rest"],
  graphql: ["graphql"], git: ["git"], github: ["github"], docker: ["docker"], kubernetes: ["kubernetes", "k8s"],
  aws: ["aws", "amazon web services"], azure: ["azure"], gcp: ["gcp", "google cloud"], linux: ["linux"],
  "ci/cd": ["ci/cd", "cicd", "continuous integration"], terraform: ["terraform"], devops: ["devops"],
  "machine learning": ["machine learning", "ml"], "deep learning": ["deep learning"], nlp: ["nlp", "natural language processing"],
  "computer vision": ["computer vision"], pytorch: ["pytorch"], tensorflow: ["tensorflow"], "scikit-learn": ["scikit-learn", "sklearn"],
  pandas: ["pandas"], numpy: ["numpy"], "data analysis": ["data analysis", "data analytics", "data analyst"],
  "data visualization": ["data visualization", "data visualisation"], tableau: ["tableau"], "power bi": ["power bi", "powerbi"],
  excel: ["excel"], statistics: ["statistics", "statistical"], spark: ["spark", "pyspark"], etl: ["etl"], airflow: ["airflow"],
  "data structures": ["data structures"], algorithms: ["algorithms"], "system design": ["system design"], oop: ["oop", "object-oriented", "object oriented"],
  testing: ["jest", "junit", "pytest", "selenium", "unit testing", "cypress"], agile: ["agile", "scrum"], figma: ["figma"],
  "ui/ux": ["ui/ux", "ux", "user experience"], "product management": ["product management"], seo: ["seo"],
  "content writing": ["content writing", "copywriting"], "digital marketing": ["digital marketing"], flutter: ["flutter"],
  android: ["android"], ios: ["ios"], firebase: ["firebase"], cybersecurity: ["cybersecurity", "cyber security", "infosec"],
  networking: ["networking"], "embedded systems": ["embedded systems", "embedded"], iot: ["iot"], blockchain: ["blockchain"],
  solidity: ["solidity"], llm: ["llm", "llms", "large language models"], "prompt engineering": ["prompt engineering"],
  langchain: ["langchain"], wordpress: ["wordpress"], jira: ["jira"], communication: ["communication skills", "communication"],
};
// Expands umbrella terms students commonly write
const EXPANSIONS = { mern: ["mongodb", "express", "react", "node.js"], "mern stack": ["mongodb", "express", "react", "node.js"], mean: ["mongodb", "express", "angular", "node.js"] };

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const termRegex = (t) => new RegExp(`(?<![a-z0-9+#.])${esc(t)}(?![a-z0-9+#])`, "i");

const ALIAS_TO_CANON = {};
const CANON_REGEX = {};
for (const [canon, aliases] of Object.entries(SKILLS)) {
  ALIAS_TO_CANON[canon] = canon;
  aliases.forEach((a) => (ALIAS_TO_CANON[a] = canon));
  CANON_REGEX[canon] = new RegExp(`(?<![a-z0-9+#.])(?:${[...new Set([canon, ...aliases])].map(esc).join("|")})(?![a-z0-9+#])`, "i");
}

/** Normalise the student's free-text skills to { canonical set, custom terms }. */
const normalizeStudentSkills = (skills = []) => {
  const canon = new Set();
  const custom = new Set();
  for (const raw of skills) {
    const s = String(raw).trim().toLowerCase();
    if (!s) continue;
    if (EXPANSIONS[s]) EXPANSIONS[s].forEach((x) => canon.add(x));
    else if (ALIAS_TO_CANON[s]) canon.add(ALIAS_TO_CANON[s]);
    else custom.add(s);
  }
  return { canon, custom };
};

const REQ_SPLIT = /(nice[- ]to[- ]have|preferred|bonus|good to have|a plus|desirable|optional)/i;

/** Skills found in a listing, split heuristically into required vs preferred. */
const extractListingSkills = (title, text) => {
  const full = `${title}\n${text}`;
  const marker = text.search(REQ_SPLIT);
  const required = [];
  const preferred = [];
  for (const canon of Object.keys(SKILLS)) {
    const inTitle = CANON_REGEX[canon].test(title);
    const m = CANON_REGEX[canon].exec(text);
    if (!inTitle && !m) continue;
    if (inTitle || marker === -1 || m.index < marker) required.push(canon);
    else preferred.push(canon);
  }
  return { required, preferred, any: required.length + preferred.length > 0, full };
};

const snippet = (text, index, len = 110) => {
  const start = Math.max(0, index - 40);
  return (start > 0 ? "…" : "") + text.slice(start, start + len).replace(/\s+/g, " ").trim() + "…";
};

const parseYear = (year = "") => {
  const y = year.toLowerCase();
  if (/post|pg|master/.test(y)) return 5;
  if (/final|4th|fourth/.test(y)) return 4;
  if (/3rd|third/.test(y)) return 3;
  if (/2nd|second/.test(y)) return 2;
  if (/1st|first/.test(y)) return 1;
  return 0; // unknown
};
const degreeLevel = (degree = "", yearNum) => {
  if (yearNum === 5 || /m\.?tech|master|msc|m\.sc|mca|mba|postgrad/i.test(degree)) return "masters";
  if (degree.trim()) return "bachelors";
  return "unknown";
};

const findExperienceYears = (text) => {
  const range = /(\d{1,2})\s*(?:-|–|to)\s*\d{1,2}\s*\+?\s*(?:years?|yrs?)/gi;
  const single = /(\d{1,2})\s*\+?\s*(?:years?|yrs?)/gi;
  for (const re of [range, single]) {
    let m;
    while ((m = re.exec(text))) {
      const around = text.slice(Math.max(0, m.index - 50), m.index + m[0].length + 50);
      if (/experience/i.test(around)) return { years: parseInt(m[1], 10), evidence: snippet(text, m.index) };
    }
  }
  return null;
};

const STOP = new Set(["and", "the", "for", "with", "developer", "engineer", "intern", "internship"]);
const words = (s) => String(s).toLowerCase().split(/[^a-z0-9+#.]+/).filter((w) => w.length > 2 && !STOP.has(w));

const interestScore = (profile, opp) => {
  const phrases = [profile.careerGoal, ...(profile.interests || [])].map((p) => String(p || "").trim()).filter(Boolean);
  if (!phrases.length) return 0.5;
  const hay = `${opp.title} ${(opp.tags || []).join(" ")} ${(opp.description || "").slice(0, 800)}`.toLowerCase();
  const hits = phrases.filter((p) => {
    const w = words(p);
    return w.length ? w.every((x) => hay.includes(x)) : hay.includes(p.toLowerCase());
  }).length;
  return Math.min(1, hits / Math.min(phrases.length, 2));
};

/**
 * @param profile { skills, interests, degree, year, careerGoal }
 * @param opp     { title, description, type, tags, partialDescription }
 */
const analyze = (profile, opp) => {
  const title = opp.title || "";
  const text = opp.description || "";
  const yearNum = parseYear(profile.year);
  const level = degreeLevel(profile.degree, yearNum);
  const { canon: owned, custom } = normalizeStudentSkills(profile.skills);
  const listing = extractListingSkills(title, text);

  const reasons = []; // { status: pass|warn|fail|info, text }
  const push = (status, t) => reasons.push({ status, text: t });

  // --- Seniority / experience ---
  const isSenior = /\b(senior|sr\.?|lead|principal|staff|manager|director|head of|vp)\b/i.test(title);
  if (isSenior && opp.type !== "internship") push("fail", `The title (“${title}”) signals a senior role, which normally needs prior professional experience.`);
  const exp = findExperienceYears(text);
  if (exp) {
    if (opp.type === "internship") push("warn", `The listing mentions ${exp.years}+ years of experience: ${exp.evidence}`);
    else if (exp.years >= 2) push("fail", `The listing asks for about ${exp.years}+ years of experience: ${exp.evidence}`);
    else push("warn", `The listing asks for about ${exp.years} year of experience: ${exp.evidence}`);
  }

  // --- Education / student status ---
  let m;
  if ((m = /\b(currently\s+(?:enrolled|pursuing)|enrolled in|pursuing an?|undergraduate student|current(?:ly)? students?)\b/i.exec(text))) {
    push(profile.degree || yearNum ? "pass" : "info", `Open to current students: ${snippet(text, m.index)}`);
  }
  if ((m = /\b(recent graduates?|recently graduated|fresh graduates?|new grads?|fresher)\b/i.exec(text))) {
    if (yearNum >= 4) push("pass", `Targets recent graduates and you're in your final year / postgraduate: ${snippet(text, m.index)}`);
    else if (yearNum > 0) push("warn", `Targets recent graduates; your profile says "${profile.year}", so you may only qualify later: ${snippet(text, m.index)}`);
    else push("info", `Targets recent graduates; add your academic year to your profile to check: ${snippet(text, m.index)}`);
  }
  if ((m = /\b(final[- ]year|last year of|graduating (?:in )?20\d\d|class of 20\d\d)\b/i.exec(text)) && yearNum > 0 && yearNum < 4) {
    push("warn", `Mentions final-year students; your profile says "${profile.year}": ${snippet(text, m.index)}`);
  }
  if ((m = /(?:master'?s|m\.?tech|msc|ph\.?d)[^.\n]{0,50}\b(?:required|mandatory|must)\b|\b(?:required|mandatory|must)\b[^.\n]{0,50}(?:master'?s|m\.?tech|msc|ph\.?d)/i.exec(text)) && level !== "masters") {
    push("fail", `A master's/PhD appears to be required, but your profile lists ${profile.degree || "no degree"}: ${snippet(text, m.index)}`);
  } else if ((m = /\b(master'?s|m\.?tech|msc|ph\.?d)\b/i.exec(text)) && level === "bachelors" && !/\b(bachelor|b\.?tech|bsc|undergraduate)\b/i.test(text)) {
    push("warn", `Mentions a master's/PhD; check whether it's required: ${snippet(text, m.index)}`);
  }

  // --- Skills ---
  const has = (c) => owned.has(c) || [...custom].some((x) => CANON_REGEX[c].test(x));
  const matchedReq = listing.required.filter(has);
  const missingReq = listing.required.filter((c) => !has(c));
  const matchedPref = listing.preferred.filter(has);
  const missingPref = listing.preferred.filter((c) => !has(c));
  const customHits = [...custom].filter((c) => termRegex(c).test(`${title}\n${text}`));
  const coverage = listing.required.length ? matchedReq.length / listing.required.length : null;

  if (coverage !== null) {
    const pct = Math.round(coverage * 100);
    const base = `You have ${matchedReq.length} of ${listing.required.length} required skills mentioned in the listing (${pct}%).`;
    if (coverage >= 0.7) push("pass", base);
    else if (coverage >= 0.4) push("warn", `${base} Missing: ${missingReq.join(", ")}.`);
    else push("warn", `${base} This is a large skills gap (not a hard eligibility rule). Missing: ${missingReq.join(", ")}.`);
  } else {
    push("info", opp.partialDescription ? "Only a short excerpt of this listing is available, so skill requirements couldn't be checked. Open the posting for the full requirements." : "The listing doesn't name specific technical skills I can check against your profile.");
  }

  if (!reasons.some((r) => r.status !== "info") && !listing.any) {
    push("info", "No explicit eligibility criteria are stated in the listing text. Confirm on the official posting.");
  }

  // --- Verdict (based on listing text only) ---
  const verdict = reasons.some((r) => r.status === "fail") ? "not_eligible"
    : reasons.some((r) => r.status === "warn") ? "partial"
    : reasons.some((r) => r.status === "pass") ? "eligible" : "unclear";

  // --- Score ---
  const level01 = opp.type === "internship" || opp.type === "program" ? 1
    : isSenior ? 0 : /\b(junior|entry|graduate|fresher|trainee|associate)\b/i.test(title) ? 0.9 : 0.5;
  const cov = coverage === null ? (customHits.length ? 0.6 : 0.4) : coverage;
  let score = Math.round(100 * (0.5 * cov + 0.2 * interestScore(profile, opp) + 0.15 * level01 + 0.15 * (verdict === "not_eligible" ? 0 : verdict === "partial" ? 0.5 : 0.8)));
  if (verdict === "not_eligible") score = Math.min(score, 45);

  return {
    matchScore: Math.max(0, Math.min(100, score)),
    verdict,
    basis: "listing text + your saved profile",
    reasons,
    matchedSkills: [...new Set([...matchedReq, ...matchedPref, ...customHits])],
    missingSkills: missingReq,
    preferredMissing: missingPref,
    listingSkills: { required: listing.required, preferred: listing.preferred },
    skillCoverage: coverage === null ? null : Math.round(coverage * 100),
  };
};

module.exports = { analyze, normalizeStudentSkills, extractListingSkills, parseYear };

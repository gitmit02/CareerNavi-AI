const test = require("node:test");
const assert = require("node:assert");
const { analyze } = require("../services/matcher.service");

const student = { skills: ["JavaScript", "React", "Node", "MongoDB", "Git"], interests: ["Web Development"], degree: "B.Tech CSE", year: "3rd Year", careerGoal: "Frontend Developer" };

test("good internship match: eligible, matched skills, evidence in reasons", () => {
  const r = analyze(student, {
    title: "Frontend Developer Intern", type: "internship", tags: ["web"],
    description: "We are looking for currently enrolled students. You know React, JavaScript and Git. Nice to have: Docker.",
  });
  assert.strictEqual(r.verdict, "eligible");
  assert.deepStrictEqual(r.matchedSkills.sort(), ["git", "javascript", "react"]);
  assert.deepStrictEqual(r.missingSkills, []);
  assert.deepStrictEqual(r.preferredMissing, ["docker"]);
  assert.ok(r.reasons.some((x) => x.status === "pass" && /currently enrolled/i.test(x.text)));
  assert.ok(r.matchScore >= 70, `score ${r.matchScore}`);
});

test("senior role with years of experience is not eligible, with reasons", () => {
  const r = analyze(student, { title: "Senior Backend Engineer", type: "job", description: "Requires 5+ years of experience with Java, Spring Boot, Kubernetes and AWS." });
  assert.strictEqual(r.verdict, "not_eligible");
  assert.ok(r.reasons.filter((x) => x.status === "fail").length >= 2);
  assert.ok(r.missingSkills.includes("java") && r.missingSkills.includes("kubernetes"));
  assert.ok(r.matchScore <= 45);
});

test("skill matching does not confuse java/javascript or sql/mysql", () => {
  const r = analyze({ ...student, skills: ["JavaScript"] }, { title: "Developer", type: "job", description: "Strong JavaScript. MySQL experience." });
  assert.ok(r.listingSkills.required.includes("javascript"));
  assert.ok(!r.listingSkills.required.includes("java"));
  assert.ok(!r.listingSkills.required.includes("sql"));
  assert.ok(r.listingSkills.required.includes("mysql"));
});

test("MERN expands to its parts; aliases like nodejs/reactjs normalise", () => {
  const r = analyze({ ...student, skills: ["MERN"] }, { title: "Full Stack Intern", type: "internship", description: "React, Node.js, MongoDB and Express." });
  assert.strictEqual(r.skillCoverage, 100);
});

test("silent listing is 'unclear' and says so (no invented criteria)", () => {
  const r = analyze(student, { title: "Open Source Programme", type: "program", description: "Check the official page." });
  assert.strictEqual(r.verdict, "unclear");
  assert.ok(r.reasons.every((x) => x.status === "info"));
});

test("excerpt-only listings are flagged rather than guessed", () => {
  const r = analyze(student, { title: "Marketing Trainee", type: "internship", partialDescription: true, description: "Short excerpt" });
  assert.ok(r.reasons.some((x) => /excerpt/i.test(x.text)));
});

test("recent-grad listing: warn for 3rd year, pass for final year", () => {
  const opp = { title: "Graduate Analyst", type: "job", description: "Open to recent graduates. SQL and Excel." };
  assert.strictEqual(analyze(student, opp).verdict, "partial");
  assert.ok(analyze({ ...student, year: "Final Year" }, opp).reasons.some((x) => x.status === "pass" && /recent graduates/i.test(x.text)));
});

test("required master's degree is a fail for a bachelor's student", () => {
  const r = analyze(student, { title: "Research Associate", type: "job", description: "A master's degree is required. Python." });
  assert.strictEqual(r.verdict, "not_eligible");
});

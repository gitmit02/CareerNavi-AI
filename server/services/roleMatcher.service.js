const { normalizeStudentSkills } = require("./matcher.service");

const INDIA_LOCATIONS = [
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Delhi NCR (Gurugram / Noida)",
  "Mumbai",
  "Chennai",
  "Remote (India)",
];

const EXTRA_ALIASES = {
  py: "python",
  js: "javascript",
  ts: "typescript",
  reactjs: "react",
  "react.js": "react",
  nodejs: "node.js",
  "node.js": "node.js",
  node: "node.js",
  expressjs: "express",
  "express.js": "express",
  nextjs: "next.js",
  vuejs: "vue",
  cpp: "c++",
  csharp: "c#",
  postgres: "postgresql",
  mongo: "mongodb",
  tailwindcss: "tailwind",
  ml: "machine learning",
  dl: "deep learning",
  ai: "machine learning",
  genai: "llm",
  powerbi: "power bi",
  dsa: "data structures",
  ux: "ui/ux",
  ui: "ui/ux",
  k8s: "kubernetes",
};

/**
 * Curated catalog of real tech & digital roles in India.
 * Helps students decode confusing industry role titles, see exact matched vs missing skills,
 * and jump directly to active Indian job/internship portals (Naukri, LinkedIn India, Internshala, Unstop).
 */
const ROLE_CATALOG = [
  {
    id: "frontend-developer",
    title: "Frontend Developer",
    alsoKnownAs: ["UI Engineer", "React.js Developer", "Web UI Developer"],
    category: "Web & Software",
    oneLiner: "Builds interactive user interfaces and responsive web apps.",
    requiredSkills: ["html", "css", "javascript", "react", "tailwind", "git"],
    naukriSlug: "frontend-developer",
    internshalaSlug: "front-end-development",
    searchQuery: "Frontend Developer",
  },
  {
    id: "fullstack-developer",
    title: "Full-Stack Developer (MERN / Web)",
    alsoKnownAs: ["MERN Stack Developer", "Product Engineer", "Web Application Developer"],
    category: "Web & Software",
    oneLiner: "Builds both client-facing web interfaces and backend APIs/databases.",
    requiredSkills: ["javascript", "react", "node.js", "express", "mongodb", "rest api", "git"],
    naukriSlug: "full-stack-developer",
    internshalaSlug: "full-stack-development",
    searchQuery: "Full Stack Developer",
  },
  {
    id: "backend-developer",
    title: "Backend Engineer",
    alsoKnownAs: ["API Developer", "Server-Side Engineer", "Node.js / Python / Java Backend Dev"],
    category: "Web & Software",
    oneLiner: "Designs server logic, APIs, authentication, and database architectures.",
    requiredSkills: ["node.js", "python", "sql", "mongodb", "rest api", "git", "docker"],
    naukriSlug: "backend-developer",
    internshalaSlug: "backend-development",
    searchQuery: "Backend Developer",
  },
  {
    id: "sde-fresher",
    title: "Software Development Engineer (SDE-1 / GET)",
    alsoKnownAs: ["Associate Software Engineer (ASE)", "Graduate Engineer Trainee (GET)", "Programmer Analyst"],
    category: "Core Engineering",
    oneLiner: "Entry-level software engineering role focused on problem-solving and core development.",
    requiredSkills: ["data structures", "algorithms", "oop", "git", "sql", "java", "c++", "python"],
    naukriSlug: "software-developer-fresher",
    internshalaSlug: "software-development",
    searchQuery: "Software Engineer Fresher",
  },
  {
    id: "python-developer",
    title: "Python Software Developer",
    alsoKnownAs: ["Django / FastAPI Developer", "Python Automation Engineer", "Junior Python Engineer"],
    category: "Web & Software",
    oneLiner: "Develops backend services, automation scripts, and data-driven web apps in Python.",
    requiredSkills: ["python", "sql", "rest api", "django", "flask", "fastapi", "git"],
    naukriSlug: "python-developer",
    internshalaSlug: "python-development",
    searchQuery: "Python Developer",
  },
  {
    id: "java-developer",
    title: "Java / Spring Boot Developer",
    alsoKnownAs: ["Enterprise Java Engineer", "J2EE Developer", "Associate Java Engineer"],
    category: "Web & Software",
    oneLiner: "Builds scalable enterprise backend microservices using Java and Spring Boot.",
    requiredSkills: ["java", "spring boot", "sql", "oop", "rest api", "git"],
    naukriSlug: "java-developer",
    internshalaSlug: "java-development",
    searchQuery: "Java Developer",
  },
  {
    id: "data-analyst",
    title: "Data Analyst / Business Intelligence (BI) Analyst",
    alsoKnownAs: ["BI Developer", "Product Data Analyst", "Operations / Reporting Analyst"],
    category: "Data & Analytics",
    oneLiner: "Turns raw business data into dashboards, SQL reports, and actionable insights.",
    requiredSkills: ["sql", "excel", "python", "data analysis", "power bi", "tableau", "statistics"],
    naukriSlug: "data-analyst",
    internshalaSlug: "data-analytics",
    searchQuery: "Data Analyst",
  },
  {
    id: "data-scientist",
    title: "Data Scientist / Decision Scientist",
    alsoKnownAs: ["Junior Data Scientist", "Quantitative Analyst", "Predictive Modeling Analyst"],
    category: "Data & Analytics",
    oneLiner: "Applies statistical modeling, Python, and machine learning to solve business problems.",
    requiredSkills: ["python", "machine learning", "pandas", "numpy", "scikit-learn", "sql", "statistics"],
    naukriSlug: "data-scientist",
    internshalaSlug: "data-science",
    searchQuery: "Data Scientist",
  },
  {
    id: "ml-ai-engineer",
    title: "Machine Learning / AI Engineer",
    alsoKnownAs: ["Applied ML Engineer", "Deep Learning Engineer", "Computer Vision / NLP Engineer"],
    category: "AI & Machine Learning",
    oneLiner: "Trains, optimizes, and deploys machine learning and deep learning models into production.",
    requiredSkills: ["python", "machine learning", "deep learning", "pytorch", "tensorflow", "scikit-learn", "git"],
    naukriSlug: "machine-learning-engineer",
    internshalaSlug: "machine-learning",
    searchQuery: "Machine Learning Engineer",
  },
  {
    id: "genai-llm-developer",
    title: "GenAI & LLM Application Engineer",
    alsoKnownAs: ["AI Agent Developer", "Prompt & RAG Engineer", "Applied AI Developer"],
    category: "AI & Machine Learning",
    oneLiner: "Builds AI copilots, RAG pipelines, and LLM-powered applications.",
    requiredSkills: ["python", "llm", "langchain", "prompt engineering", "rest api", "javascript"],
    naukriSlug: "generative-ai-engineer",
    internshalaSlug: "artificial-intelligence-ai",
    searchQuery: "Generative AI Engineer",
  },
  {
    id: "data-engineer",
    title: "Data Engineer / Big Data Developer",
    alsoKnownAs: ["ETL Developer", "Analytics Engineer", "Data Pipeline Engineer"],
    category: "Data & Analytics",
    oneLiner: "Builds reliable data pipelines, warehouses, and ETL workflows for analytics and AI.",
    requiredSkills: ["sql", "python", "etl", "spark", "airflow", "aws"],
    naukriSlug: "data-engineer",
    internshalaSlug: "data-science",
    searchQuery: "Data Engineer",
  },
  {
    id: "devops-cloud-engineer",
    title: "DevOps & Cloud Engineer",
    alsoKnownAs: ["Site Reliability Engineer (SRE)", "Cloud Infrastructure Engineer", "Platform Engineer"],
    category: "Cloud & DevOps",
    oneLiner: "Automates CI/CD deployments, containers, and cloud infrastructure on AWS/Azure/GCP.",
    requiredSkills: ["linux", "docker", "kubernetes", "aws", "ci/cd", "git", "terraform"],
    naukriSlug: "devops-engineer",
    internshalaSlug: "cloud-computing",
    searchQuery: "DevOps Cloud Engineer",
  },
  {
    id: "mobile-app-developer",
    title: "Mobile App Developer (Flutter / React Native)",
    alsoKnownAs: ["Cross-Platform App Developer", "Android / iOS App Engineer", "Flutter Developer"],
    category: "Mobile Development",
    oneLiner: "Builds native and cross-platform mobile applications for Android and iOS.",
    requiredSkills: ["flutter", "react native", "javascript", "android", "firebase", "git"],
    naukriSlug: "mobile-application-developer",
    internshalaSlug: "mobile-app-development",
    searchQuery: "Mobile App Developer",
  },
  {
    id: "android-developer",
    title: "Android App Developer",
    alsoKnownAs: ["Kotlin Android Engineer", "Native Mobile Developer", "Junior Android Dev"],
    category: "Mobile Development",
    oneLiner: "Creates native Android applications using Kotlin, Java, and Android Jetpack.",
    requiredSkills: ["android", "kotlin", "java", "firebase", "rest api", "git"],
    naukriSlug: "android-developer",
    internshalaSlug: "android-app-development",
    searchQuery: "Android Developer",
  },
  {
    id: "ui-ux-designer",
    title: "UI/UX & Product Designer",
    alsoKnownAs: ["Interaction Designer", "User Experience Designer", "Visual Product Designer"],
    category: "Design & Product",
    oneLiner: "Designs user flows, wireframes, design systems, and interactive Figma prototypes.",
    requiredSkills: ["figma", "ui/ux", "html", "css", "communication"],
    naukriSlug: "ui-ux-designer",
    internshalaSlug: "ui-ux-design",
    searchQuery: "UI UX Designer",
  },
  {
    id: "product-management",
    title: "Associate Product Manager (APM) / Product Analyst",
    alsoKnownAs: ["Product Management Intern", "Junior Product Manager", "Business Analyst"],
    category: "Design & Product",
    oneLiner: "Defines product roadmaps, user stories, metrics, and cross-functional execution.",
    requiredSkills: ["product management", "agile", "sql", "data analysis", "communication", "jira"],
    naukriSlug: "associate-product-manager",
    internshalaSlug: "product-management",
    searchQuery: "Associate Product Manager",
  },
  {
    id: "qa-automation-engineer",
    title: "QA Automation Engineer / SDET",
    alsoKnownAs: ["Software Development Engineer in Test (SDET)", "Quality Assurance Analyst", "Test Engineer"],
    category: "Core Engineering",
    oneLiner: "Writes automated test suites, API tests, and quality checks for software releases.",
    requiredSkills: ["testing", "javascript", "python", "java", "sql", "git"],
    naukriSlug: "qa-automation-engineer",
    internshalaSlug: "software-testing",
    searchQuery: "QA Automation Engineer",
  },
  {
    id: "cybersecurity-analyst",
    title: "Cybersecurity / InfoSec Analyst",
    alsoKnownAs: ["SOC Analyst", "VAPT / Penetration Tester", "Application Security Engineer"],
    category: "Cloud & Security",
    oneLiner: "Protects networks, cloud systems, and web apps from vulnerabilities and threats.",
    requiredSkills: ["cybersecurity", "networking", "linux", "python", "aws"],
    naukriSlug: "cyber-security-analyst",
    internshalaSlug: "cyber-security",
    searchQuery: "Cyber Security Analyst",
  },
  {
    id: "blockchain-web3-developer",
    title: "Blockchain / Web3 Developer",
    alsoKnownAs: ["Smart Contract Engineer", "Solidity Developer", "dApp Developer"],
    category: "Emerging Tech",
    oneLiner: "Develops decentralized applications (dApps) and smart contracts.",
    requiredSkills: ["blockchain", "solidity", "javascript", "react", "node.js", "git"],
    naukriSlug: "blockchain-developer",
    internshalaSlug: "blockchain-development",
    searchQuery: "Blockchain Developer",
  },
  {
    id: "embedded-iot-engineer",
    title: "Embedded Systems & IoT Engineer",
    alsoKnownAs: ["Firmware Engineer", "Robotics / Hardware-Software Engineer", "IoT Developer"],
    category: "Core Engineering",
    oneLiner: "Programs microcontrollers, connected sensors, and embedded C/C++ firmware.",
    requiredSkills: ["embedded systems", "iot", "c++", "python", "linux"],
    naukriSlug: "embedded-systems-engineer",
    internshalaSlug: "embedded-systems",
    searchQuery: "Embedded Systems Engineer",
  },
];

/**
 * Builds direct, India-specific portal links where the user can immediately apply
 * for active jobs and internships for a given role.
 */
const buildIndiaPortalLinks = (role) => {
  const qEncoded = encodeURIComponent(role.searchQuery);
  return [
    {
      platform: "Naukri.com",
      type: "Jobs & Freshers (India)",
      url: `https://www.naukri.com/${role.naukriSlug}-jobs?k=${qEncoded}&l=india`,
    },
    {
      platform: "LinkedIn India",
      type: "Active Jobs & Internships",
      url: `https://www.linkedin.com/jobs/search/?keywords=${qEncoded}&location=India`,
    },
    {
      platform: "Internshala",
      type: "Student Internships (India)",
      url: `https://internshala.com/internships/${role.internshalaSlug}-internship/`,
    },
    {
      platform: "Unstop",
      type: "Campus Hiring & Challenges",
      url: `https://unstop.com/internships?searchTerm=${qEncoded}`,
    },
    {
      platform: "Indeed India",
      type: "Verified India Openings",
      url: `https://in.indeed.com/jobs?q=${qEncoded}&l=India`,
    },
  ];
};

const parseRawInputTokens = (raw = "") =>
  String(raw || "")
    .split(/[,;|/]+|\s{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Matches the user's saved skills + any extra skills/keywords entered in the UI
 * against our India Tech Role Catalog.
 */
const matchRolesForUser = (profile = {}, extraInput = "") => {
  const extraTokens = parseRawInputTokens(extraInput);
  // Also split space-separated single-word skills if user typed e.g. "react python sql"
  const spaceWords = String(extraInput || "")
    .toLowerCase()
    .split(/[\s,]+/)
    .map((w) => EXTRA_ALIASES[w] || w)
    .filter(Boolean);

  const combinedSkills = [
    ...(profile.skills || []),
    ...extraTokens,
    ...spaceWords,
  ];

  const { canon: ownedCanon, custom: ownedCustom } = normalizeStudentSkills(combinedSkills);
  for (const w of spaceWords) {
    if (EXTRA_ALIASES[w]) ownedCanon.add(EXTRA_ALIASES[w]);
  }

  const queryLower = String(extraInput || "").trim().toLowerCase();
  const goalLower = String(profile.careerGoal || "").trim().toLowerCase();

  const results = ROLE_CATALOG.map((role) => {
    const matchedSkills = [];
    const missingSkills = [];

    for (const reqSkill of role.requiredSkills) {
      const hasCanon = ownedCanon.has(reqSkill);
      const hasCustom = [...ownedCustom].some(
        (c) => c === reqSkill || reqSkill.includes(c) || c.includes(reqSkill)
      );
      if (hasCanon || hasCustom) {
        matchedSkills.push(reqSkill);
      } else {
        missingSkills.push(reqSkill);
      }
    }

    const totalReq = role.requiredSkills.length || 1;
    const skillRatio = matchedSkills.length / totalReq;

    // Check if the role title / alias matches the user's typed query or career goal
    const hay = `${role.title} ${role.alsoKnownAs.join(" ")} ${role.category} ${role.requiredSkills.join(" ")}`.toLowerCase();
    const matchesTypedQuery = queryLower
      ? queryLower.split(/[\s,]+/).some((tok) => tok.length > 1 && hay.includes(tok))
      : false;
    const matchesGoal = goalLower ? hay.includes(goalLower) || goalLower.split(/\s+/).some((w) => w.length > 3 && hay.includes(w)) : false;

    let matchScore = Math.round(skillRatio * 100);
    if (matchesTypedQuery && matchScore < 85) matchScore = Math.min(98, matchScore + 15);
    else if (matchesGoal && matchScore < 85) matchScore = Math.min(95, matchScore + 10);

    return {
      _id: role.id,
      title: role.title,
      alsoKnownAs: role.alsoKnownAs,
      category: role.category,
      oneLiner: role.oneLiner,
      locations: INDIA_LOCATIONS,
      locationSummary: "India (Bengaluru, Hyderabad, Pune, Delhi NCR, Mumbai, Chennai & Remote)",
      matchScore,
      matchedCount: matchedSkills.length,
      totalRequired: role.requiredSkills.length,
      matchedSkills,
      missingSkills,
      matchesTypedQuery,
      applyLinks: buildIndiaPortalLinks(role),
    };
  });

  // Filter & sort:
  // If user has skills or typed something, prioritize roles with >= 1 matched skill or matching query
  const hasAnyMatches = results.some((r) => r.matchedCount > 0 || r.matchesTypedQuery);
  const filtered = hasAnyMatches
    ? results.filter((r) => r.matchedCount > 0 || r.matchesTypedQuery)
    : results;

  filtered.sort((a, b) => {
    if (b.matchesTypedQuery !== a.matchesTypedQuery) return b.matchesTypedQuery ? 1 : -1;
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return b.matchedCount - a.matchedCount;
  });

  return {
    roles: filtered,
    userSkills: profile.skills || [],
    extraInput: String(extraInput || "").trim(),
  };
};

module.exports = { matchRolesForUser, ROLE_CATALOG, INDIA_LOCATIONS };

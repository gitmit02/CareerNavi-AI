import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Map,
  BarChart3,
  MessageCircle,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Check,
  Navigation,
  Flag,
  Briefcase,
  Clock,
  Lock,
} from "lucide-react";
import Logo from "../components/ui/Logo";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import ThemeToggle from "../components/ui/ThemeToggle";
import { useAuth } from "../hooks/useAuth";

const INITIAL_DEMO_ROAD = [
  {
    id: "demo-1",
    phase: "Foundation",
    title: "Master TypeScript, Modern React & System Fundamentals",
    duration: "Weeks 1–2",
    description: "Build type-safe component architectures, state hooks, and responsive design systems.",
    completed: true,
  },
  {
    id: "demo-2",
    phase: "Core Build",
    title: "Ship 2 Full-Stack Production Apps with REST & Auth",
    duration: "Weeks 3–5",
    description: "Deploy real-world portfolio projects with authentication, caching, and clean API integration.",
    completed: true,
  },
  {
    id: "demo-3",
    phase: "Acceleration",
    title: "Close Skill Gaps in Testing, CI/CD & Performance",
    duration: "Weeks 6–8",
    description: "Add automated tests, Lighthouse optimization, and system design fundamentals for interviews.",
    completed: false,
  },
  {
    id: "demo-4",
    phase: "Launch Readiness",
    title: "Apply to High-Match Internships & Ace Technical Rounds",
    duration: "Weeks 9–12",
    description: "Target verified listings matched to your profile with tailored AI preparation plans.",
    completed: false,
  },
];

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [demoSteps, setDemoSteps] = useState(INITIAL_DEMO_ROAD);

  const toggleDemoStep = (id) => {
    setDemoSteps((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const firstInc = prev.findIndex((s) => !s.completed);
      const lastComp = firstInc === -1 ? prev.length - 1 : firstInc - 1;
      const target = prev[idx];

      // Only allow checking the next sequential step, and unchecking the latest completed step
      if (!target.completed && idx !== firstInc) return prev;
      if (target.completed && idx !== lastComp) return prev;

      return prev.map((s, i) => (i === idx ? { ...s, completed: !s.completed } : s));
    });
  };

  const completedCount = demoSteps.filter((s) => s.completed).length;
  const demoPercent = Math.round((completedCount / demoSteps.length) * 100);
  const firstIncompleteIdx = demoSteps.findIndex((s) => !s.completed);
  const lastCompletedIdx = firstIncompleteIdx === -1 ? demoSteps.length - 1 : firstIncompleteIdx - 1;

  return (
    <div className="min-h-screen bg-bg bg-crimson-grid relative">
      {/* Floating Startup Navbar */}
      <div className="sticky top-3 z-30 px-4 sm:px-6 lg:px-8 pt-3">
        <header className="mx-auto max-w-6xl rounded-2xl border border-border bg-surface/85 backdrop-blur-xl shadow-soft px-4 sm:px-6 py-3 flex items-center justify-between">
          <Logo size={26} />
          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="sm" icon={ArrowRight} iconPosition="right">
                  Open Workspace
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline-block">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" icon={ArrowRight} iconPosition="right">
                    Start Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </header>
      </div>

      {/* ============================================================
          CENTER-STAGE HERO + INTERACTIVE CAREER ROAD (MAIN ATTRACTION)
          ============================================================ */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-14 pb-20 sm:pt-20 sm:pb-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 shadow-sm mb-6">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="coord-label text-ink">AI Career Navigation Engine · Live</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-bold text-ink tracking-tight leading-[1.06] text-balance mb-5">
            Your career isn't a checklist.{" "}
            <span className="font-serif italic font-normal text-gradient-crimson">It's a road you drive.</span>
          </h1>

          <p className="text-base sm:text-lg text-muted leading-relaxed max-w-2xl mx-auto mb-8">
            CareerNavi AI maps your exact skills against real industry roles and builds an interactive milestone
            highway — so you can tick off every stop from classroom to offer letter.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={isAuthenticated ? "/roadmap" : "/register"} className="w-full sm:w-auto">
              <Button size="lg" icon={ArrowRight} iconPosition="right" className="w-full sm:w-auto">
                {isAuthenticated ? "Go to your Career Road" : "Build my Career Road"}
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign in to workspace
              </Button>
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted">
            {["Interactive milestone road", "Real internship matching", "Light, Dark & Fun modes"].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-success" /> {item}
              </span>
            ))}
          </div>
        </div>

        {/* ============================================================
            THE MAIN ATTRACTION: INTERACTIVE LIVE CAREER ROAD SHOWCASE
            ============================================================ */}
        <div className="mt-14 sm:mt-16 rounded-3xl border border-border bg-surface/90 backdrop-blur-xl shadow-soft p-5 sm:p-8 lg:p-10">
          {/* Top bar of the interactive showcase */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="primary">Interactive Demo — Try Ticking a Stop</Badge>
                <Badge variant="accent">90-Day Route</Badge>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                Full-Stack Software Engineer Highway
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="coord-label text-muted block">Live Readiness</span>
                <span className="font-display text-2xl font-bold text-ink">
                  {demoPercent}%{" "}
                  <span className="text-xs font-mono text-success">
                    ({completedCount}/{demoSteps.length} stops)
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Centerpiece Highway inside the showcase */}
          <div className="relative mx-auto max-w-4xl pt-8 pb-4">
            {/* Origin Badge */}
            <div className="relative z-20 flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface2 px-4 py-1.5 text-xs font-display font-semibold text-ink shadow-sm">
                <Navigation size={13} className="text-primary rotate-45" />
                <span>Origin: Current Student Profile · Click any checkbox or road stop below</span>
              </div>
            </div>

            <div className="relative">
              {/* Central Highway Road Track (Desktop) */}
              <div
                aria-hidden="true"
                className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-12 rounded-full border-x-2 border-[var(--road-border)] bg-[var(--road-asphalt)] shadow-inner overflow-hidden"
              >
                <div
                  className="w-full bg-gradient-to-b from-success/30 via-primary/30 to-transparent transition-all duration-500"
                  style={{ height: `${Math.max(10, demoPercent)}%` }}
                />
                <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                  <line
                    x1="50%"
                    y1="0"
                    x2="50%"
                    y2="100%"
                    stroke="rgba(255,255,255,0.22)"
                    strokeWidth="2"
                    strokeDasharray="12 12"
                  />
                  <line
                    x1="50%"
                    y1="0"
                    x2="50%"
                    y2={`${Math.max(8, demoPercent)}%`}
                    stroke="var(--c-primary-light)"
                    strokeWidth="2.5"
                    className="road-lane-dash"
                  />
                </svg>
              </div>

              {/* Mobile Highway Road Track */}
              <div
                aria-hidden="true"
                className="md:hidden absolute left-5 top-0 bottom-0 -translate-x-1/2 w-8 rounded-full border-x-2 border-[var(--road-border)] bg-[var(--road-asphalt)] overflow-hidden"
              />

              {/* Interactive Road Stops */}
              <div className="space-y-6 md:space-y-8 relative z-10">
                {demoSteps.map((step, i) => {
                  const isLeft = i % 2 === 0;
                  const isCurrent = i === firstIncompleteIdx;
                  const isLocked = !step.completed && firstIncompleteIdx !== -1 && i > firstIncompleteIdx;
                  const canUncheck = step.completed && i === lastCompletedIdx;
                  const num = String(i + 1).padStart(2, "0");

                  const cardEl = (
                    <div
                      onClick={() => !isLocked && toggleDemoStep(step.id)}
                      className={`rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${
                        step.completed
                          ? "bg-surface/90 border-success/45 shadow-card cursor-pointer"
                          : isCurrent
                          ? "bg-surface border-primary shadow-crimson ring-1 ring-primary/25 cursor-pointer"
                          : "bg-surface/65 border-border/70 opacity-75 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-bold ${
                              step.completed
                                ? "bg-success/15 text-success"
                                : isCurrent
                                ? "bg-primary text-white"
                                : "bg-surface2 text-muted"
                            }`}
                          >
                            STOP {num}
                          </span>
                          <span className="coord-label text-muted">{step.phase}</span>
                        </div>

                        <button
                          type="button"
                          role="checkbox"
                          disabled={isLocked || (step.completed && !canUncheck)}
                          aria-checked={step.completed}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDemoStep(step.id);
                          }}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-display font-semibold transition-all ${
                            step.completed
                              ? canUncheck
                                ? "border-success/40 bg-success/15 text-success"
                                : "border-success/30 bg-success/10 text-success/75 cursor-not-allowed"
                              : isLocked
                              ? "border-border bg-surface2/60 text-muted cursor-not-allowed"
                              : "border-primary/50 bg-primary/10 text-primary-light hover:bg-primary hover:text-white"
                          }`}
                        >
                          {isLocked ? (
                            <>
                              <Lock size={11} /> Locked
                            </>
                          ) : (
                            <>
                              <span
                                className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                                  step.completed ? "border-success bg-success text-white" : "border-primary-light bg-surface"
                                }`}
                              >
                                {step.completed && <Check size={10} strokeWidth={3} />}
                              </span>
                              {step.completed ? "Done" : "Tick off"}
                            </>
                          )}
                        </button>
                      </div>

                      <h3
                        className={`font-display font-bold text-base mb-1 ${
                          step.completed ? "line-through text-muted" : "text-ink"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted leading-relaxed">{step.description}</p>
                      <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-muted">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} className="text-primary-light" /> {step.duration}
                        </span>
                        {isCurrent && !step.completed && (
                          <span className="text-primary-light font-semibold">● Unlocked Next</span>
                        )}
                        {isLocked && (
                          <span className="text-muted">Complete Stop {String(i).padStart(2, "0")} first</span>
                        )}
                      </div>
                    </div>
                  );

                  return (
                    <div
                      key={step.id}
                      className="relative grid grid-cols-1 md:grid-cols-[1fr_5.5rem_1fr] items-center pl-12 md:pl-0"
                    >
                      <div className={isLeft ? "md:pr-4" : "hidden md:block"}>
                        {isLeft && cardEl}
                      </div>

                      {/* Road Checkpoint Node */}
                      <div className="absolute left-5 md:static md:left-auto -translate-x-1/2 md:translate-x-0 flex justify-center">
                        <button
                          type="button"
                          disabled={isLocked || (step.completed && !canUncheck)}
                          onClick={() => toggleDemoStep(step.id)}
                          aria-label={`Toggle Stop ${num}`}
                          className={`flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-2xl border-2 font-mono text-xs font-bold transition-all ${
                            step.completed
                              ? "bg-success border-white text-white shadow-[0_0_20px_rgba(16,185,129,0.7)]"
                              : isCurrent
                              ? "bg-primary border-accent text-white shadow-crimson scale-110"
                              : "bg-surface border-border text-muted opacity-75 cursor-not-allowed"
                          }`}
                        >
                          {step.completed ? (
                            <Check size={18} strokeWidth={3} />
                          ) : isLocked ? (
                            <Lock size={14} />
                          ) : (
                            num
                          )}
                        </button>
                      </div>

                      <div className={!isLeft ? "md:pl-4" : "hidden md:block"}>
                        {!isLeft && cardEl}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Destination Footer Node */}
            <div className="relative z-20 flex justify-center mt-8">
              <div
                className={`inline-flex items-center gap-2.5 rounded-2xl border px-5 py-2.5 text-xs font-display font-bold shadow-sm transition-all ${
                  demoPercent === 100
                    ? "border-success bg-success/15 text-success"
                    : "border-border bg-surface2 text-ink"
                }`}
              >
                <Flag size={15} className={demoPercent === 100 ? "text-success" : "text-primary"} />
                <span>
                  {demoPercent === 100
                    ? "Destination Reached: Full-Stack Software Engineer Ready!"
                    : "Destination: Full-Stack Software Engineer Offer"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          STARTUP BENTO GRID SECTION
          ============================================================ */}
      <section className="border-t border-border bg-surface/50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-12">
            <span className="coord-label text-primary">Platform Architecture</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink mt-2 tracking-tight">
              Built like a modern startup tool,{" "}
              <span className="font-serif italic font-normal text-gradient-crimson">designed for your career.</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-12 gap-5">
            {/* Bento 1: Interactive Road (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl border border-border bg-surface p-6 sm:p-8 flex flex-col justify-between shadow-card">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Map size={20} />
                  </span>
                  <Badge variant="primary">Core Engine</Badge>
                </div>
                <h3 className="font-display text-xl font-bold text-ink mb-2">
                  Centerpiece Interactive Career Highway
                </h3>
                <p className="text-sm text-muted leading-relaxed max-w-lg">
                  Forget static PDFs and boring bullet lists. Your AI roadmap renders as an interactive highway with
                  tick-off checkpoints, phase breakdowns, and instant progress telemetry.
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-border flex flex-wrap items-center gap-2">
                {["Phase 01 · Foundation", "Phase 02 · Core Build", "Phase 03 · Acceleration", "Phase 04 · Launch"].map(
                  (p) => (
                    <span key={p} className="rounded-lg border border-border bg-surface2 px-3 py-1.5 font-mono text-xs text-ink">
                      {p}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Bento 2: Skill Gap Radar (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl border border-border bg-surface p-6 sm:p-8 flex flex-col justify-between shadow-card">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                    <BarChart3 size={20} />
                  </span>
                  <Badge variant="accent">Readiness Score</Badge>
                </div>
                <h3 className="font-display text-xl font-bold text-ink mb-2">Skill Gap Diagnostics</h3>
                <p className="text-sm text-muted leading-relaxed">
                  Compare your current stack against any target role to uncover matched strengths, missing skills, and
                  estimated time-to-readiness.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-1.5">
                <Badge variant="success">✓ React</Badge>
                <Badge variant="success">✓ Python</Badge>
                <Badge variant="danger">+ System Design</Badge>
                <Badge variant="danger">+ Docker</Badge>
              </div>
            </div>

            {/* Bento 3: Live Opportunities (6 cols) */}
            <div className="lg:col-span-6 rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-success/15 text-success">
                  <Briefcase size={20} />
                </span>
                <Badge variant="success">Live Feeds</Badge>
              </div>
              <h3 className="font-display text-xl font-bold text-ink mb-2">Verified Opportunity Matcher</h3>
              <p className="text-sm text-muted leading-relaxed">
                Real internships, jobs, and student programs ranked by profile match score — with transparent eligibility
                verdicts and one-click AI preparation plans.
              </p>
            </div>

            {/* Bento 4: AI Mentor & Velocity (6 cols) */}
            <div className="lg:col-span-6 rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-2/15 text-accent-2">
                  <MessageCircle size={20} />
                </span>
                <Badge>24/7 Copilot</Badge>
              </div>
              <h3 className="font-display text-xl font-bold text-ink mb-2">AI Career Mentor & Weekly Velocity</h3>
              <p className="text-sm text-muted leading-relaxed">
                Ask grounded questions about interviews, portfolios, and career pivots anytime — and log weekly updates to
                visualize your momentum.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-surface p-8 sm:p-14 text-center shadow-soft">
          <span className="coord-label text-primary">Ready to Drive?</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink mt-2 mb-4 tracking-tight">
            Generate your personalized Career Road in 60 seconds.
          </h2>
          <p className="text-muted mb-8 max-w-md mx-auto text-sm sm:text-base">
            Join students using CareerNavi AI to turn career uncertainty into a clear, step-by-step highway.
          </p>
          <Link to="/register">
            <Button size="lg" icon={Sparkles}>
              Create free account
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border bg-surface/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size={22} />
          <p className="text-xs text-muted">© {new Date().getFullYear()} CareerNavi AI · Built for ambitious students.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

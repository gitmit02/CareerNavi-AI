import { Link } from "react-router-dom";
import { Map, BarChart3, MessageCircle, TrendingUp, ArrowRight, CheckCircle2 } from "lucide-react";
import Logo from "../components/ui/Logo";
import Button from "../components/ui/Button";
import ThemeToggle from "../components/ui/ThemeToggle";
import { useAuth } from "../hooks/useAuth";

const FEATURES = [
  {
    icon: Map,
    title: "AI Career Roadmap",
    description:
      "Get a personalized, step-by-step 30/90-day plan built around your skills, interests, and goals.",
  },
  {
    icon: BarChart3,
    title: "Skill Gap Analysis",
    description: "See exactly what's missing between where you are and the role you want — with a readiness score.",
  },
  {
    icon: MessageCircle,
    title: "AI Career Mentor",
    description: "Ask real questions about internships, interviews, and skills, and get grounded, practical answers.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Check off roadmap steps, log weekly updates, and watch your readiness grow over time.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Tell us about you",
    description: "Share your degree, year, current skills, interests, and career goal (or let AI suggest one).",
  },
  {
    n: "02",
    title: "Get your roadmap",
    description: "CareerNavi AI generates a structured path with concrete steps, timelines, and tools to learn.",
  },
  {
    n: "03",
    title: "Track and adjust",
    description: "Mark steps done, log weekly progress, and ask your AI mentor whenever you're stuck.",
  },
];

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="sm">Go to dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Get started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-20 sm:pt-20 sm:pb-28 grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <span className="coord-label inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-primary mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> AI career mentor for students
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-ink leading-[1.08] text-balance mb-5">
              Navigate your career with a plan, not a guess.
            </h1>
            <p className="text-base sm:text-lg text-muted leading-relaxed max-w-lg mb-8">
              CareerNavi AI reads your skills and goals, then builds a real roadmap — with steps, timelines, and a
              readiness score — so you always know your next move.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/register">
                <Button size="lg" icon={ArrowRight} iconPosition="right" className="w-full sm:w-auto">
                  Start your roadmap
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  I already have an account
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
              {["No credit card needed", "Built for students", "Personalized by AI"].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-xs text-muted">
                  <CheckCircle2 size={14} className="text-success" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Signature waypoint-path visual */}
          <div className="relative z-10">
            <div className="rounded-2xl border border-border bg-surface shadow-soft p-6 sm:p-8">
              <p className="coord-label text-muted mb-6">Your path · Frontend Developer</p>
              <svg viewBox="0 0 320 280" className="w-full h-auto" aria-hidden="true">
                <path
                  d="M20 20 C 90 20, 60 90, 140 90 S 230 160, 300 160 S 250 240, 300 260"
                  fill="none"
                  stroke="var(--c-border)"
                  strokeWidth="2.5"
                  className="waypoint-dash"
                />
                {[
                  { x: 20, y: 20, done: true },
                  { x: 140, y: 90, done: true },
                  { x: 300, y: 160, done: false },
                  { x: 300, y: 260, done: false },
                ].map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r="9" fill={p.done ? "var(--c-success)" : "var(--c-surface)"} stroke={p.done ? "var(--c-success)" : "var(--c-primary)"} strokeWidth="2.5" />
                    {p.done && <circle cx={p.x} cy={p.y} r="3" fill="white" />}
                  </g>
                ))}
              </svg>
              <div className="space-y-3 mt-2">
                {[
                  { label: "Learn HTML/CSS/JS fundamentals", meta: "Week 1–2 · Done", done: true },
                  { label: "Build 3 portfolio projects with React", meta: "Week 3–6 · Done", done: true },
                  { label: "Apply to 15 frontend internships", meta: "Week 7–9 · In progress", done: false },
                ].map((s) => (
                  <div key={s.label} className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${
                        s.done ? "bg-success border-success" : "border-primary"
                      }`}
                    />
                    <div>
                      <p className={`text-sm text-ink ${s.done ? "line-through decoration-muted" : ""}`}>{s.label}</p>
                      <p className="coord-label text-muted mt-0.5">{s.meta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Ambient background path */}
        <svg
          className="pointer-events-none absolute inset-0 -z-0 opacity-[0.35] hidden lg:block"
          viewBox="0 0 1440 800"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M-50 400 C 200 200, 400 600, 700 400 S 1200 200, 1500 400"
            fill="none"
            stroke="var(--c-primary)"
            strokeWidth="1.5"
            strokeDasharray="2 12"
          />
        </svg>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-surface/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-xl mb-12">
            <span className="coord-label text-primary">What you get</span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-2 text-balance">
              Everything you need to move from unsure to on-track.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-2xl border border-border bg-surface p-5 hover:border-primary/40 transition-colors">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={19} />
                </div>
                <h3 className="font-display font-semibold text-ink mb-1.5">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-xl mb-12">
            <span className="coord-label text-primary">How it works</span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-2 text-balance">
              Three steps to a real career plan.
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                <span className="font-display text-4xl font-bold text-border">{s.n}</span>
                <h3 className="font-display font-semibold text-ink mt-3 mb-1.5">{s.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{s.description}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-4 -right-4 w-8 border-t-2 border-dashed border-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-surface/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-4 text-balance">
            Stop guessing. Start navigating.
          </h2>
          <p className="text-muted mb-8 max-w-md mx-auto">
            Create your free profile and get your first AI-generated roadmap in minutes.
          </p>
          <Link to="/register">
            <Button size="lg" icon={ArrowRight} iconPosition="right">
              Create your roadmap
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size={22} />
          <p className="text-xs text-muted">© {new Date().getFullYear()} CareerNavi AI. Built for students.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

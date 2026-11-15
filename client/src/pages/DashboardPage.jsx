import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Map,
  BarChart3,
  Sparkles,
  ArrowRight,
  ListChecks,
  Compass,
  Target,
  Clock,
  CheckCircle2,
  Lock,
  Briefcase,
  MessageCircle,
  TrendingUp,
  Wrench,
} from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import ProgressRing from "../components/ui/ProgressRing";
import { SkeletonCard } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { getRoadmaps } from "../api/roadmap.service";
import { getAllProgress, updateStepProgress } from "../api/progress.service";
import { clampPercent, formatRelative } from "../utils/formatters";

const DashboardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState(null);
  const [progress, setProgress] = useState(null);
  const [updatingStep, setUpdatingStep] = useState(false);

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? "Good morning" : greetingHour < 18 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [roadmapRes, progressRes] = await Promise.all([getRoadmaps(), getAllProgress()]);
        if (!mounted) return;
        const latestRoadmap = roadmapRes.data?.[0] || null;
        setRoadmap(latestRoadmap);

        if (latestRoadmap) {
          const match = progressRes.data?.find(
            (p) => p.roadmap?._id === latestRoadmap._id || p.roadmap === latestRoadmap._id
          );
          setProgress(match || null);
        }
      } catch (err) {
        toast.error(err.message || "Couldn't load your dashboard data.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const firstIncompleteIndex = roadmap?.steps?.findIndex((s) => !s.completed) ?? -1;
  const nextStep = firstIncompleteIndex !== -1 ? roadmap?.steps?.[firstIncompleteIndex] : null;

  const handleCompleteCurrentStep = async () => {
    if (!roadmap || !nextStep || updatingStep) return;
    setUpdatingStep(true);
    const prevSteps = roadmap.steps;
    const nextSteps = roadmap.steps.map((s) => (s._id === nextStep._id ? { ...s, completed: true } : s));
    setRoadmap({ ...roadmap, steps: nextSteps });

    try {
      await updateStepProgress(roadmap._id, nextStep._id, true);
      const done = nextSteps.filter((s) => s.completed).length;
      const pct = nextSteps.length ? Math.round((done / nextSteps.length) * 100) : 0;
      setProgress((prev) => ({ ...(prev || {}), progressPercent: pct, updatedAt: new Date().toISOString() }));
      toast.success(`Stop ${String(firstIncompleteIndex + 1).padStart(2, "0")} completed!`);
    } catch (err) {
      setRoadmap({ ...roadmap, steps: prevSteps });
      toast.error(err.message || "Couldn't update that milestone.");
    } finally {
      setUpdatingStep(false);
    }
  };

  const completedCount = roadmap?.steps?.filter((s) => s.completed).length || 0;
  const totalCount = roadmap?.steps?.length || 0;
  const computedPercent = totalCount
    ? Math.round((completedCount / totalCount) * 100)
    : progress?.progressPercent || 0;
  const progressPercent = clampPercent(computedPercent);

  const userSkillsLower = new Set((user?.skills || []).map((s) => s.toLowerCase().trim()));
  const requiredSkills = roadmap?.requiredSkills || [];
  const matchedRequiredCount = requiredSkills.filter((r) => userSkillsLower.has(r.toLowerCase().trim())).length;

  return (
    <DashboardLayout
      title={`${greeting}, ${user?.name?.split(" ")[0] || "there"}`}
      subtitle="Executive summary of your career readiness, active milestones, and skill alignment."
    >
      {loading ? (
        <div className="grid lg:grid-cols-3 gap-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : !roadmap ? (
        <Card>
          <EmptyState
            icon={Map}
            title="No career roadmap active"
            description="Generate your personalized AI career roadmap to unlock executive telemetry, skill gap analysis, and milestone tracking."
            actionLabel="Generate my roadmap"
            onAction={() => (window.location.href = "/roadmap")}
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {/* ============================================================
              ROW 1: EXECUTIVE KPI METRICS STRIP (4 CARDS)
              ============================================================ */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Target Role */}
            <Card className="!p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="coord-label text-muted">Target Role</span>
                  <Compass size={16} className="text-primary" />
                </div>
                <p className="font-display text-lg font-bold text-ink leading-snug line-clamp-1">
                  {roadmap.careerPath}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted">Horizon</span>
                <span className="font-mono font-semibold text-ink">{roadmap.timeline}</span>
              </div>
            </Card>

            {/* KPI 2: Milestone Velocity */}
            <Card className="!p-5 flex items-center justify-between gap-3">
              <div>
                <span className="coord-label text-muted block mb-1">Completion</span>
                <p className="font-display text-2xl font-bold text-ink">
                  {completedCount}
                  <span className="text-sm font-normal text-muted"> / {totalCount}</span>
                </p>
                <p className="text-xs text-muted mt-1">Milestones cleared</p>
              </div>
              <ProgressRing percent={progressPercent} size={72} strokeWidth={7} />
            </Card>

            {/* KPI 3: Skill Coverage */}
            <Card className="!p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="coord-label text-muted">Skill Alignment</span>
                  <BarChart3 size={16} className="text-accent" />
                </div>
                <p className="font-display text-2xl font-bold text-ink">
                  {requiredSkills.length ? `${matchedRequiredCount}/${requiredSkills.length}` : user?.skills?.length || 0}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted">Profile skills</span>
                <span className="font-mono font-semibold text-ink">{user?.skills?.length || 0} listed</span>
              </div>
            </Card>

            {/* KPI 4: Weekly Activity */}
            <Card className="!p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="coord-label text-muted">Weekly Logs</span>
                  <TrendingUp size={16} className="text-success" />
                </div>
                <p className="font-display text-2xl font-bold text-ink">
                  {progress?.weeklyUpdates?.length || 0}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted">Last activity</span>
                <span className="font-mono text-ink">
                  {progress?.updatedAt ? formatRelative(progress.updatedAt) : "Just started"}
                </span>
              </div>
            </Card>
          </div>

          {/* ============================================================
              ROW 2: MAIN PROFESSIONAL WORKSPACE GRID (2/3 + 1/3)
              ============================================================ */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN (8 cols): Active Focus + Sequential Milestone Schedule */}
            <div className="lg:col-span-8 space-y-6">
              {/* Current Active Milestone Focus Card */}
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="coord-label text-primary">Current Priority Milestone</span>
                    {nextStep && (
                      <Badge variant="primary">
                        Stop {String(firstIncompleteIndex + 1).padStart(2, "0")} of {totalCount}
                      </Badge>
                    )}
                  </div>
                  {nextStep?.duration && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-muted">
                      <Clock size={13} className="text-primary-light" /> {nextStep.duration}
                    </span>
                  )}
                </div>

                {nextStep ? (
                  <>
                    <h3 className="font-display text-xl font-bold text-ink mb-2">{nextStep.title}</h3>
                    <p className="text-sm text-muted leading-relaxed mb-5">{nextStep.description}</p>
                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
                      <Button
                        size="sm"
                        icon={CheckCircle2}
                        loading={updatingStep}
                        onClick={handleCompleteCurrentStep}
                      >
                        Mark Stop {String(firstIncompleteIndex + 1).padStart(2, "0")} Complete
                      </Button>
                      <Link to="/roadmap">
                        <Button variant="secondary" size="sm" icon={ArrowRight} iconPosition="right">
                          Open Interactive Career Road
                        </Button>
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="py-4 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2.5 text-success text-sm font-display font-semibold">
                      <ListChecks size={20} /> All milestones on this roadmap have been completed!
                    </div>
                    <Link to="/roadmap">
                      <Button variant="secondary" size="sm" icon={ArrowRight} iconPosition="right">
                        Review Career Road
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>

              {/* Milestone Schedule Queue (Clean Tabular List — Not the Road Graphic) */}
              <Card noPadding>
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border">
                  <div>
                    <h3 className="font-display font-bold text-ink text-base">Milestone Execution Queue</h3>
                    <p className="text-xs text-muted mt-0.5">
                      Steps unlock strictly in sequential order as each milestone is completed.
                    </p>
                  </div>
                  <Link
                    to="/roadmap"
                    className="text-xs font-display font-semibold text-primary-light hover:underline inline-flex items-center gap-1"
                  >
                    Full Road View <ArrowRight size={13} />
                  </Link>
                </div>

                <div className="divide-y divide-border">
                  {roadmap.steps.slice(0, 5).map((step, idx) => {
                    const isCurrent = idx === firstIncompleteIndex;
                    const isLocked = !step.completed && firstIncompleteIndex !== -1 && idx > firstIncompleteIndex;
                    const stepNo = String(idx + 1).padStart(2, "0");

                    return (
                      <div
                        key={step._id || idx}
                        className="flex items-center justify-between gap-4 px-5 sm:px-6 py-3.5 hover:bg-surface2/40 transition-colors"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                              step.completed
                                ? "bg-success/15 text-success border border-success/30"
                                : isCurrent
                                ? "bg-primary text-white"
                                : "bg-surface2 text-muted border border-border"
                            }`}
                          >
                            {step.completed ? "✓" : stepNo}
                          </span>
                          <div className="min-w-0">
                            <p
                              className={`text-sm font-display font-semibold truncate ${
                                step.completed ? "line-through text-muted" : "text-ink"
                              }`}
                            >
                              {step.title}
                            </p>
                            {step.duration && (
                              <p className="text-xs font-mono text-muted">{step.duration}</p>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0">
                          {step.completed ? (
                            <Badge variant="success">Completed</Badge>
                          ) : isCurrent ? (
                            <Badge variant="primary">In Progress</Badge>
                          ) : isLocked ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface2 px-2.5 py-1 text-xs font-medium text-muted">
                              <Lock size={11} /> Locked
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* RIGHT COLUMN (4 cols): Skill Alignment & Quick Actions */}
            <div className="lg:col-span-4 space-y-6">
              {/* Required Skills Matrix */}
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-bold text-ink text-base">Path Skill Requirements</h3>
                  <Target size={16} className="text-primary" />
                </div>
                <p className="text-xs text-muted mb-4">
                  Green badges indicate skills already listed on your profile.
                </p>

                {requiredSkills.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {requiredSkills.map((s) => {
                      const hasSkill = userSkillsLower.has(s.toLowerCase().trim());
                      return (
                        <Badge key={s} variant={hasSkill ? "success" : "default"}>
                          {hasSkill ? `✓ ${s}` : s}
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted">No required skills listed.</p>
                )}

                {roadmap.tools?.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-border">
                    <p className="coord-label text-muted flex items-center gap-1.5 mb-2.5">
                      <Wrench size={12} className="text-accent" /> Recommended Stack & Tools
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {roadmap.tools.map((t) => (
                        <Badge key={t} variant="accent">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Link to="/skill-gap" className="block mt-5">
                  <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right" className="w-full">
                    Run Full Skill Gap Analysis
                  </Button>
                </Link>
              </Card>

              {/* Quick Workspace Shortcuts */}
              <Card>
                <h3 className="font-display font-bold text-ink text-base mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Link
                    to="/opportunities"
                    className="flex items-center justify-between rounded-xl border border-border bg-surface2/50 hover:border-primary/40 px-3.5 py-2.5 text-sm font-display font-medium text-ink transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <Briefcase size={16} className="text-primary-light" />
                      Browse Matched Internships
                    </span>
                    <ArrowRight size={14} className="text-muted" />
                  </Link>
                  <Link
                    to="/mentor"
                    className="flex items-center justify-between rounded-xl border border-border bg-surface2/50 hover:border-primary/40 px-3.5 py-2.5 text-sm font-display font-medium text-ink transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <MessageCircle size={16} className="text-accent" />
                      Ask AI Career Mentor
                    </span>
                    <ArrowRight size={14} className="text-muted" />
                  </Link>
                  <Link
                    to="/progress"
                    className="flex items-center justify-between rounded-xl border border-border bg-surface2/50 hover:border-primary/40 px-3.5 py-2.5 text-sm font-display font-medium text-ink transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <Sparkles size={16} className="text-success" />
                      Log Weekly Progress Update
                    </span>
                    <ArrowRight size={14} className="text-muted" />
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DashboardPage;

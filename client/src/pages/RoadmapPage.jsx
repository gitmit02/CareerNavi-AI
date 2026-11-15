import { useEffect, useState } from "react";
import { Sparkles, Wrench, Target, RefreshCw, Compass, CheckCircle2, Filter, Lock } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { EmptyState, ErrorState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import RoadmapTimeline from "../components/roadmap/RoadmapTimeline";
import { useToast } from "../hooks/useToast";
import { getRoadmaps, generateRoadmap } from "../api/roadmap.service";
import { updateStepProgress } from "../api/progress.service";
import { clampPercent } from "../utils/formatters";

const FILTERS = [
  { id: "all", label: "Full Road" },
  { id: "Remaining", label: "Remaining Stops" },
  { id: "completed", label: "Completed" },
];

const RoadmapPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [updatingStepId, setUpdatingStepId] = useState(null);
  const [filter, setFilter] = useState("all");

  const loadRoadmap = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getRoadmaps();
      setRoadmap(res.data?.[0] || null);
    } catch (err) {
      setError(true);
      toast.error(err.message || "Couldn't load your roadmap.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateRoadmap();
      setRoadmap(res.data);
      toast.success("Your new career road is ready!");
    } catch (err) {
      toast.error(err.message || "The AI couldn't generate a roadmap right now. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleStep = async (stepId, completed) => {
    if (!roadmap) return;
    const stepIndex = roadmap.steps.findIndex((s) => s._id === stepId);
    if (stepIndex === -1) return;

    const firstIncompleteIndex = roadmap.steps.findIndex((s) => !s.completed);
    const lastCompletedIndex =
      firstIncompleteIndex === -1 ? roadmap.steps.length - 1 : firstIncompleteIndex - 1;

    // Enforce strict sequential order when checking a step
    if (completed && firstIncompleteIndex !== -1 && stepIndex > firstIncompleteIndex) {
      toast.info(
        `Please complete Stop ${String(firstIncompleteIndex + 1).padStart(2, "0")} first before ticking off Stop ${String(
          stepIndex + 1
        ).padStart(2, "0")}.`
      );
      return;
    }

    // Enforce reverse sequential order when unchecking so sequence doesn't get gaps
    if (!completed && stepIndex !== lastCompletedIndex) {
      toast.info("Uncheck later milestones first to keep your road progress in sequential order.");
      return;
    }

    setUpdatingStepId(stepId);
    const prevSteps = roadmap.steps;
    setRoadmap({
      ...roadmap,
      steps: roadmap.steps.map((s) => (s._id === stepId ? { ...s, completed } : s)),
    });
    try {
      await updateStepProgress(roadmap._id, stepId, completed);
      toast.success(
        completed
          ? `Stop ${String(stepIndex + 1).padStart(2, "0")} completed! Next milestone unlocked.`
          : `Stop ${String(stepIndex + 1).padStart(2, "0")} marked incomplete.`
      );
    } catch (err) {
      setRoadmap({ ...roadmap, steps: prevSteps });
      toast.error(err.message || "Couldn't update that step. Please try again.");
    } finally {
      setUpdatingStepId(null);
    }
  };

  const completedCount = roadmap?.steps?.filter((s) => s.completed).length || 0;
  const totalCount = roadmap?.steps?.length || 0;
  const percent = clampPercent(totalCount ? (completedCount / totalCount) * 100 : 0);
  const firstIncompleteIndex = roadmap?.steps?.findIndex((s) => !s.completed) ?? -1;

  const visibleSteps =
    roadmap?.steps?.filter((s) => {
      if (filter === "Remaining") return !s.completed;
      if (filter === "completed") return s.completed;
      return true;
    }) || [];

  return (
    <DashboardLayout
      title="Interactive Career Road"
      subtitle="Follow your center-stage highway and tick off each milestone in sequence as you build toward your target role."
    >
      {loading ? (
        <div className="space-y-4 max-w-4xl mx-auto">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : error ? (
        <Card>
          <ErrorState onAction={loadRoadmap} />
        </Card>
      ) : !roadmap ? (
        <Card className="max-w-2xl mx-auto">
          <EmptyState
            icon={Sparkles}
            title="No career road generated yet"
            description="Generate a personalized, interactive career highway based on your skills, interests, and target role."
            actionLabel={generating ? "Building your road…" : "Generate my career road"}
            onAction={handleGenerate}
          />
        </Card>
      ) : (
        <div className="space-y-8">
          {/* ============================================================
              COMMAND HUD HEADER CARD
              ============================================================ */}
          <Card className="mx-auto max-w-5xl border-primary/30 shadow-soft">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="primary">
                    <Compass size={12} /> Active Route
                  </Badge>
                  <Badge variant="accent">Timeline: {roadmap.timeline}</Badge>
                  <Badge>
                    <Lock size={11} /> Sequential Unlock
                  </Badge>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                  {roadmap.careerPath}
                </h2>
                <p className="text-sm text-muted mt-1">
                  Milestones unlock in order — complete each stop to unlock the next checkpoint along the highway.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <div className="rounded-xl border border-border bg-surface2/70 px-4 py-2.5 text-right">
                  <span className="coord-label text-muted block">Route Completion</span>
                  <span className="font-display text-xl font-bold text-ink">
                    {completedCount}/{totalCount}{" "}
                    <span className="text-primary-light font-mono text-sm">({percent}%)</span>
                  </span>
                </div>
                <Button variant="secondary" size="md" icon={RefreshCw} loading={generating} onClick={handleGenerate}>
                  Regenerate Road
                </Button>
              </div>
            </div>

            {/* Segmented Highway Progress Bar (Sequential) */}
            <div className="mt-6">
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                {roadmap.steps.map((s, idx) => {
                  const isNext = idx === firstIncompleteIndex;
                  const isLocked = !s.completed && firstIncompleteIndex !== -1 && idx > firstIncompleteIndex;
                  return (
                    <button
                      key={s._id || idx}
                      type="button"
                      onClick={() => handleToggleStep(s._id, !s.completed)}
                      title={
                        isLocked
                          ? `Stop ${idx + 1}: ${s.title} (Locked — complete Stop ${firstIncompleteIndex + 1} first)`
                          : `Stop ${idx + 1}: ${s.title} (${s.completed ? "Completed" : "Next up — click to complete"})`
                      }
                      className={`h-2.5 rounded-full transition-all ${
                        s.completed
                          ? "bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                          : isNext
                          ? "bg-primary/70 hover:bg-primary animate-pulse"
                          : "bg-surface2 border border-border opacity-60 cursor-not-allowed"
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Skills & Tools Arsenal Drawer */}
            <div className="grid sm:grid-cols-2 gap-5 mt-6 pt-5 border-t border-border">
              <div>
                <p className="flex items-center gap-1.5 coord-label text-muted mb-2.5">
                  <Target size={12} className="text-primary-light" /> Core Skills Along This Road
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {roadmap.requiredSkills?.length ? (
                    roadmap.requiredSkills.map((s) => <Badge key={s}>{s}</Badge>)
                  ) : (
                    <p className="text-sm text-muted italic">None listed</p>
                  )}
                </div>
              </div>
              <div>
                <p className="flex items-center gap-1.5 coord-label text-muted mb-2.5">
                  <Wrench size={12} className="text-accent" /> Tools & Stack to Master
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {roadmap.tools?.length ? (
                    roadmap.tools.map((t) => (
                      <Badge key={t} variant="accent">
                        {t}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted italic">None listed</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* ============================================================
              ROAD CONTROLS & CENTERPIECE HIGHWAY
              ============================================================ */}
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-primary-light" />
                <h3 className="font-display text-lg font-bold text-ink">
                  Centerpiece Milestone Highway
                </h3>
              </div>

              <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface p-1 self-start sm:self-auto">
                <Filter size={13} className="text-muted ml-2 mr-1" />
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={`rounded-lg px-3 py-1 text-xs font-display font-medium transition-colors ${
                      filter === f.id
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {visibleSteps.length ? (
              <RoadmapTimeline
                steps={visibleSteps}
                allSteps={roadmap.steps}
                onToggleStep={handleToggleStep}
                updatingStepId={updatingStepId}
                careerPath={roadmap.careerPath}
              />
            ) : (
              <Card className="text-center py-10">
                <p className="text-sm text-muted">No milestones match the selected filter.</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default RoadmapPage;

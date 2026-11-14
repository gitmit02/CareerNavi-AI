import { useEffect, useState } from "react";
import { Sparkles, Wrench, Target, RefreshCw } from "lucide-react";
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

const RoadmapPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [updatingStepId, setUpdatingStepId] = useState(null);

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
      toast.success("Your new roadmap is ready!");
    } catch (err) {
      toast.error(err.message || "The AI couldn't generate a roadmap right now. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleStep = async (stepId, completed) => {
    if (!roadmap) return;
    setUpdatingStepId(stepId);
    const prevSteps = roadmap.steps;
    setRoadmap({
      ...roadmap,
      steps: roadmap.steps.map((s) => (s._id === stepId ? { ...s, completed } : s)),
    });
    try {
      await updateStepProgress(roadmap._id, stepId, completed);
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

  return (
    <DashboardLayout title="Career Roadmap" subtitle="Your AI-generated, step-by-step path to your goal.">
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : error ? (
        <Card>
          <ErrorState onAction={loadRoadmap} />
        </Card>
      ) : !roadmap ? (
        <Card>
          <EmptyState
            icon={Sparkles}
            title="No roadmap generated yet"
            description="Generate a personalized career roadmap based on your skills, interests, and goal."
            actionLabel={generating ? "Generating…" : "Generate my roadmap"}
            onAction={handleGenerate}
          />
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <span className="coord-label text-primary">Career path</span>
                <h2 className="font-display text-xl font-bold text-ink mt-1.5">{roadmap.careerPath}</h2>
                <p className="text-sm text-muted mt-1">
                  Timeline: {roadmap.timeline} · {completedCount}/{totalCount} steps complete ({percent}%)
                </p>
              </div>
              <Button variant="secondary" size="sm" icon={RefreshCw} loading={generating} onClick={handleGenerate}>
                Regenerate
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 mt-6 pt-6 border-t border-border">
              <div>
                <p className="flex items-center gap-1.5 coord-label text-muted mb-2">
                  <Target size={12} /> Required skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {roadmap.requiredSkills?.length ? (
                    roadmap.requiredSkills.map((s) => <Badge key={s}>{s}</Badge>)
                  ) : (
                    <p className="text-sm text-muted italic">None listed</p>
                  )}
                </div>
              </div>
              <div>
                <p className="flex items-center gap-1.5 coord-label text-muted mb-2">
                  <Wrench size={12} /> Tools & technologies
                </p>
                <div className="flex flex-wrap gap-2">
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

          <div>
            <h3 className="font-display font-semibold text-ink mb-4">Step-by-step path</h3>
            <RoadmapTimeline steps={roadmap.steps} onToggleStep={handleToggleStep} updatingStepId={updatingStepId} />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default RoadmapPage;

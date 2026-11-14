import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Map, BarChart3, Sparkles, ArrowRight, ListChecks } from "lucide-react";
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
import { getAllProgress } from "../api/progress.service";
import { clampPercent } from "../utils/formatters";

const DashboardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState(null);
  const [progress, setProgress] = useState(null);

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
          const match = progressRes.data?.find((p) => p.roadmap?._id === latestRoadmap._id || p.roadmap === latestRoadmap._id);
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

  const progressPercent = clampPercent(progress?.progressPercent || 0);
  const nextStep = roadmap?.steps?.find((s) => !s.completed);

  return (
    <DashboardLayout title={`${greeting}, ${user?.name?.split(" ")[0] || "there"} 👋`} subtitle="Here's where your career journey stands today.">
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
            title="No roadmap yet"
            description="Generate your first AI career roadmap to unlock your dashboard, skill gap analysis, and progress tracking."
            actionLabel="Generate my roadmap"
            onAction={() => (window.location.href = "/roadmap")}
          />
        </Card>
      ) : (
        <div className="space-y-5">
          {/* Top row: goal + readiness + progress */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Card className="flex flex-col justify-between">
              <div>
                <span className="coord-label text-primary">Career goal</span>
                <h3 className="font-display text-lg font-bold text-ink mt-1.5 mb-1">{roadmap.careerPath}</h3>
                <p className="text-sm text-muted">Timeline: {roadmap.timeline}</p>
              </div>
              <Link to="/roadmap" className="mt-4">
                <Button variant="secondary" size="sm" icon={ArrowRight} iconPosition="right" className="w-full">
                  View roadmap
                </Button>
              </Link>
            </Card>

            <Card className="flex flex-col items-center text-center">
              <span className="coord-label text-muted mb-3">Roadmap progress</span>
              <ProgressRing percent={progressPercent} size={96} />
              <p className="text-xs text-muted mt-3">
                {roadmap.steps.filter((s) => s.completed).length} of {roadmap.steps.length} steps complete
              </p>
            </Card>

            <Card>
              <span className="coord-label text-muted">Today's recommended task</span>
              {nextStep ? (
                <>
                  <h3 className="font-display font-semibold text-ink mt-2 mb-1.5">{nextStep.title}</h3>
                  <p className="text-sm text-muted leading-relaxed line-clamp-3">{nextStep.description}</p>
                  <Link to="/roadmap">
                    <Button variant="ghost" size="sm" className="mt-3 -ml-3" icon={ArrowRight} iconPosition="right">
                      Go to step
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="mt-3 flex items-center gap-2 text-success text-sm font-medium">
                  <ListChecks size={16} /> All steps complete — great work!
                </div>
              )}
            </Card>
          </div>

          {/* Second row: skill snapshot + AI recommendations */}
          <div className="grid lg:grid-cols-2 gap-5">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-ink">Skill snapshot</h3>
                <BarChart3 size={16} className="text-muted" />
              </div>
              {user?.skills?.length ? (
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">No skills listed yet — add some from your profile.</p>
              )}
              <Link to="/skill-gap">
                <Button variant="ghost" size="sm" className="mt-4 -ml-3" icon={ArrowRight} iconPosition="right">
                  Run a skill gap analysis
                </Button>
              </Link>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-ink">Required skills for your path</h3>
                <Sparkles size={16} className="text-accent-2" />
              </div>
              {roadmap.requiredSkills?.length ? (
                <div className="flex flex-wrap gap-2">
                  {roadmap.requiredSkills.map((s) => (
                    <Badge key={s} variant="primary">
                      {s}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">No skills data available for this roadmap.</p>
              )}
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DashboardPage;

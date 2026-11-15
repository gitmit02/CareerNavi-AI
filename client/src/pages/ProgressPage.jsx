import { useEffect, useState } from "react";
import { TrendingUp, NotebookPen, Send } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Textarea } from "../components/ui/Input";
import ProgressRing from "../components/ui/ProgressRing";
import { EmptyState, ErrorState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import ProgressLineChart from "../components/charts/ProgressLineChart";
import RoadmapCompletionChart from "../components/charts/RoadmapCompletionChart";
import { useToast } from "../hooks/useToast";
import { getAllProgress, addWeeklyUpdate } from "../api/progress.service";
import { formatDate, formatRelative, clampPercent } from "../utils/formatters";

const ProgressPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [progressList, setProgressList] = useState([]);
  const [note, setNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getAllProgress();
      setProgressList(res.data || []);
    } catch (err) {
      setError(true);
      toast.error(err.message || "Couldn't load your progress.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const primary = progressList[0]; // most recently created roadmap's progress

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!note.trim() || !primary) return;
    setSubmittingNote(true);
    try {
      const roadmapId = primary.roadmap?._id || primary.roadmap;
      const res = await addWeeklyUpdate(roadmapId, note.trim());
      setProgressList((prev) => prev.map((p) => (p._id === primary._id ? { ...p, weeklyUpdates: res.data.weeklyUpdates } : p)));
      setNote("");
      toast.success("Weekly update added.");
    } catch (err) {
      toast.error(err.message || "Couldn't save your update. Please try again.");
    } finally {
      setSubmittingNote(false);
    }
  };

  // Build chart data purely from real backend data — weekly updates as a proxy timeline,
  // and per-roadmap completion percentages across all tracked roadmaps.
  const timelineData = primary?.weeklyUpdates?.length
    ? primary.weeklyUpdates.map((u, i) => ({
        label: `Update ${i + 1}`,
        progress: clampPercent(primary.progressPercent), // backend doesn't version history, so we show current % per logged update
      }))
    : [];

  const completionData = progressList.map((p, i) => ({
    label: p.roadmap?.careerPath || `Roadmap ${i + 1}`,
    progress: clampPercent(p.progressPercent),
  }));

  return (
    <DashboardLayout title="Progress & Analytics" subtitle="Track how far you've come across your roadmaps.">
      {loading ? (
        <div className="grid lg:grid-cols-2 gap-5">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : error ? (
        <Card>
          <ErrorState onAction={load} />
        </Card>
      ) : !progressList.length ? (
        <Card>
          <EmptyState
            icon={TrendingUp}
            title="No progress tracked yet"
            description="Once you generate a roadmap and start completing steps, your progress will show up here."
          />
        </Card>
      ) : (
        <div className="space-y-5">
          <div className="grid sm:grid-cols-3 gap-5">
            <Card className="flex flex-col items-center text-center">
              <span className="coord-label text-muted mb-3">Overall completion</span>
              <ProgressRing percent={clampPercent(primary.progressPercent)} size={90} />
            </Card>
            <Card className="sm:col-span-2">
              <span className="coord-label text-muted">Currently tracking</span>
              <h3 className="font-display font-semibold text-ink mt-1.5 mb-1">
                {primary.roadmap?.careerPath || "Your roadmap"}
              </h3>
              <p className="text-sm text-muted">
                {primary.completedStepIds?.length || 0} steps completed · Last updated{" "}
                {formatRelative(primary.updatedAt)}
              </p>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <Card>
              <h3 className="font-display font-semibold text-ink mb-4">Progress across weekly updates</h3>
              {timelineData.length ? (
                <ProgressLineChart data={timelineData} />
              ) : (
                <p className="text-sm text-muted py-10 text-center">Add a weekly update to see your trend here.</p>
              )}
            </Card>
            <Card>
              <h3 className="font-display font-semibold text-ink mb-4">Completion by roadmap</h3>
              {completionData.length ? (
                <RoadmapCompletionChart data={completionData} />
              ) : (
                <p className="text-sm text-muted py-10 text-center">No roadmap data yet.</p>
              )}
            </Card>
          </div>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <NotebookPen size={16} className="text-primary" />
              <h3 className="font-display font-semibold text-ink">Weekly updates</h3>
            </div>

            <form onSubmit={handleAddNote} className="flex flex-col sm:flex-row items-end gap-3 mb-6">
              <div className="w-full flex-1">
                <Textarea
                  placeholder="What did you work on this week?"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <Button type="submit" icon={Send} loading={submittingNote} className="w-full sm:w-auto shrink-0">
                Add update
              </Button>
            </form>

            {primary.weeklyUpdates?.length ? (
              <div className="space-y-3">
                {[...primary.weeklyUpdates].reverse().map((u, i) => (
                  <div key={i} className="flex gap-3 border-b border-border last:border-0 pb-3 last:pb-0">
                    <span className="coord-label text-muted shrink-0 w-20">{formatDate(u.date)}</span>
                    <p className="text-sm text-ink leading-relaxed">{u.note}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted italic">No weekly updates logged yet.</p>
            )}
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProgressPage;

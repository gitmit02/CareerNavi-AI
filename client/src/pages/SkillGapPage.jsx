import { useState } from "react";
import { Search, Clock, Lightbulb } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import ReadinessGauge from "../components/skillgap/ReadinessGauge";
import { MatchedSkills, MissingSkills } from "../components/skillgap/SkillPills";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";
import { analyzeSkillGap } from "../api/skillGap.service";

const SkillGapPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [targetRole, setTargetRole] = useState(user?.careerGoal || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!targetRole.trim()) {
      toast.error("Enter a target role to analyze.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await analyzeSkillGap({ targetRole: targetRole.trim() });
      setResult(res.data);
    } catch (err) {
      toast.error(err.message || "Couldn't run the skill gap analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Skill Gap Analysis" subtitle="See how ready you are for any role — and what's missing.">
      <div className="space-y-6">
        <Card>
          <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row items-end gap-3">
            <div className="w-full flex-1">
              <Input
                label="Target role"
                placeholder="e.g. Data Analyst, Frontend Developer, Product Manager"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>
            <Button type="submit" icon={Search} loading={loading} className="w-full sm:w-auto shrink-0">
              Analyze
            </Button>
          </form>
          <p className="text-xs text-muted mt-3">
            Uses your saved skills ({user?.skills?.length || 0} listed) compared against the target role.
          </p>
        </Card>

        {loading && (
          <div className="grid lg:grid-cols-3 gap-5">
            <Skeleton className="h-56 w-full lg:col-span-1" />
            <Skeleton className="h-56 w-full lg:col-span-2" />
          </div>
        )}

        {!loading && !result && (
          <Card>
            <EmptyState
              icon={Lightbulb}
              title="No analysis yet"
              description="Enter a target role above to see your readiness score and skill gaps."
            />
          </Card>
        )}

        {!loading && result && (
          <div className="grid lg:grid-cols-3 gap-5">
            <Card className="lg:col-span-1 flex items-center justify-center">
              <ReadinessGauge score={result.readinessScore} targetRole={result.targetRole} />
            </Card>

            <div className="lg:col-span-2 space-y-5">
              <Card>
                <h3 className="font-display font-semibold text-ink mb-3">Skills you already have</h3>
                <MatchedSkills skills={result.matchedSkills} />
              </Card>
              <Card>
                <h3 className="font-display font-semibold text-ink mb-3">Skills to build</h3>
                <MissingSkills skills={result.missingSkills} />
              </Card>
              <Card>
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={15} className="text-primary" />
                  <h3 className="font-display font-semibold text-ink">Estimated time to goal</h3>
                </div>
                <p className="text-sm text-ink font-medium mb-3">{result.estimatedTimeToGoal}</p>
                <div className="pt-3 border-t border-border">
                  <p className="coord-label text-muted mb-1.5">Recommendation</p>
                  <p className="text-sm text-muted leading-relaxed">{result.recommendation}</p>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SkillGapPage;

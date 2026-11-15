import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Briefcase, MapPin, Check, RotateCcw } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { EmptyState, ErrorState } from "../components/ui/EmptyState";
import { SkeletonCard } from "../components/ui/Skeleton";
import OpportunityCard from "../components/opportunities/OpportunityCard";
import { getMatchedRoles } from "../api/opportunity.service";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

const OpportunitiesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [extraSkills, setExtraSkills] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [result, setResult] = useState(null);

  const loadRoles = useCallback(
    async (skillsInput = "") => {
      setLoading(true);
      setError(false);
      try {
        const res = await getMatchedRoles({
          skills: skillsInput.trim() || undefined,
        });
        setResult(res.data);
      } catch (err) {
        setError(true);
        toast.error(err.message || "Couldn't load matching roles.");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    loadRoles("");
  }, [loadRoles]);

  const handleSubmit = (e) => {
    e.preventDefault();
    loadRoles(extraSkills);
  };

  const handleReset = () => {
    setExtraSkills("");
    loadRoles("");
  };

  const savedSkills = user?.skills || result?.userSkills || [];

  return (
    <DashboardLayout
      title="Roles You Can Apply For (India)"
      subtitle="See every tech role that matches your skills, what skills to build next, and direct links to apply on Naukri, LinkedIn India, and Internshala."
    >
      <div className="space-y-6">
        {/* Top Skill-to-Role Matcher Input Card (No cluttered filters) */}
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <span className="coord-label text-primary-light flex items-center gap-1.5">
                <MapPin size={12} /> India Roles & Internships Matcher
              </span>
              <h2 className="font-display text-lg font-bold text-ink mt-1">
                Matched to your skills
              </h2>
            </div>
            <Link to="/profile" className="text-xs font-display font-semibold text-primary-light hover:underline">
              Edit profile skills →
            </Link>
          </div>

          {/* Saved Profile Skills Strip */}
          <div className="mb-4">
            <p className="text-xs text-muted mb-2">Your saved profile skills:</p>
            {savedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {savedSkills.map((skill) => (
                  <Badge key={skill} variant="success">
                    <Check size={11} /> {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted italic">
                No skills saved on your profile yet — enter your skills below or{" "}
                <Link to="/profile" className="text-primary-light underline">
                  add them to your profile
                </Link>
                .
              </p>
            )}
          </div>

          {/* Optional extra skills / keywords input */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-end gap-3 pt-3 border-t border-border">
            <div className="w-full flex-1">
              <Input
                label="Try adding more skills or role keywords"
                placeholder="e.g. Python, SQL, React, Java, Figma, AWS, Data Analysis..."
                value={extraSkills}
                onChange={(e) => setExtraSkills(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button type="submit" icon={Sparkles} loading={loading} className="flex-1 sm:flex-initial">
                Find Matching Roles
              </Button>
              {extraSkills.trim() && (
                <Button type="button" variant="secondary" icon={RotateCcw} onClick={handleReset}>
                  Reset
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Results Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-5">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <Card>
            <ErrorState onAction={() => loadRoles(extraSkills)} />
          </Card>
        ) : !result?.roles?.length ? (
          <Card>
            <EmptyState
              icon={Briefcase}
              title="No matching roles found"
              description="Try entering skills like Python, JavaScript, SQL, Java, C++, or Figma to see roles you can apply for."
            />
          </Card>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted">
                Showing <span className="font-display font-bold text-ink">{result.roles.length}</span> eligible tech
                roles across <span className="text-ink font-medium">India</span> ranked by skill match
              </p>
              <span className="coord-label text-muted">
                Click any portal button to open active India listings
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {result.roles.map((role) => (
                <OpportunityCard key={role._id} item={role} />
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OpportunitiesPage;

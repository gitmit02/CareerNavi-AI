import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, X } from "lucide-react";
import Logo from "../components/ui/Logo";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { parseCommaList } from "../utils/validators";
import { updateProfile } from "../api/user.service";

const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "Final Year", "Postgraduate"];

const TagInput = ({ label, values, onChange, placeholder }) => {
  const [draft, setDraft] = useState("");

  const addTags = (raw) => {
    const parsed = parseCommaList(raw);
    if (!parsed.length) return;
    const merged = Array.from(new Set([...values, ...parsed]));
    onChange(merged);
    setDraft("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTags(draft);
    }
  };

  const removeTag = (tag) => onChange(values.filter((v) => v !== tag));

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      <div className="rounded-xl border border-border bg-surface p-2 focus-within:ring-2 focus-within:ring-primary/30">
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {values.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-surface2 px-2.5 py-1 text-xs text-ink"
            >
              {tag}
              <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
                <X size={12} className="text-muted hover:text-danger" />
              </button>
            </span>
          ))}
        </div>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTags(draft)}
          placeholder={placeholder}
          className="w-full bg-transparent px-1 py-1 text-sm text-ink placeholder:text-muted focus:outline-none"
        />
      </div>
      <p className="mt-1.5 text-xs text-muted">Press Enter or comma to add</p>
    </div>
  );
};

const OnboardingPage = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [unsureGoal, setUnsureGoal] = useState(false);

  const [form, setForm] = useState({
    degree: user?.degree || "",
    year: user?.year || "",
    skills: user?.skills || [],
    interests: user?.interests || [],
    careerGoal: user?.careerGoal || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateProfile({
        ...form,
        careerGoal: unsureGoal ? "" : form.careerGoal,
      });
      await refreshUser();
      toast.success("Profile saved. Generating your dashboard…");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.message || "Couldn't save your profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="flex items-center px-4 sm:px-6 lg:px-8 py-5">
        <Logo />
      </header>

      <div className="flex-1 flex items-start sm:items-center justify-center px-4 py-6">
        <div className="w-full max-w-lg">
          <div className="mb-8">
            <span className="coord-label text-primary">Step 1 of 1</span>
            <h1 className="font-display text-2xl font-bold text-ink mt-2 mb-1.5">Tell us about you</h1>
            <p className="text-sm text-muted">
              This helps CareerNavi AI build a roadmap that actually fits — not a generic one.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Degree / Course"
                placeholder="B.Tech CSE"
                value={form.degree}
                onChange={(e) => setForm({ ...form, degree: e.target.value })}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Academic year</label>
                <select
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Select year</option>
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <TagInput
              label="Current skills"
              values={form.skills}
              onChange={(v) => setForm({ ...form, skills: v })}
              placeholder="e.g. Python, Excel, Communication"
            />

            <TagInput
              label="Interests"
              values={form.interests}
              onChange={(v) => setForm({ ...form, interests: v })}
              placeholder="e.g. Web Development, Data Science, Design"
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-ink">Career goal</label>
                <button
                  type="button"
                  onClick={() => setUnsureGoal((v) => !v)}
                  className={`flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 transition-colors ${
                    unsureGoal ? "bg-accent/20 text-accent-2" : "text-muted hover:text-ink"
                  }`}
                >
                  <Sparkles size={12} />
                  Not sure yet — let AI suggest
                </button>
              </div>
              <Input
                placeholder={unsureGoal ? "AI will suggest a path based on your skills & interests" : "e.g. Frontend Developer"}
                value={form.careerGoal}
                onChange={(e) => setForm({ ...form, careerGoal: e.target.value })}
                disabled={unsureGoal}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" icon={ArrowRight} iconPosition="right" loading={submitting}>
              Continue to dashboard
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;

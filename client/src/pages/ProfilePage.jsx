import { useState } from "react";
import { Save } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import ThemeToggle from "../components/ui/ThemeToggle";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { updateProfile } from "../api/user.service";
import { getInitials } from "../utils/formatters";
import { parseCommaList } from "../utils/validators";

const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "Final Year", "Postgraduate"];

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || "",
    degree: user?.degree || "",
    year: user?.year || "",
    skills: (user?.skills || []).join(", "),
    interests: (user?.interests || []).join(", "),
    careerGoal: user?.careerGoal || "",
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name: form.name,
        degree: form.degree,
        year: form.year,
        skills: parseCommaList(form.skills),
        interests: parseCommaList(form.interests),
        careerGoal: form.careerGoal,
      });
      await refreshUser();
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err.message || "Couldn't save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Profile" subtitle="Keep this up to date for more accurate AI guidance.">
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1 flex flex-col items-center text-center h-fit">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary via-primary-dark to-accent text-white text-2xl font-display font-bold mb-4 shadow-[0_0_24px_-4px_rgba(225,29,72,0.7)] ring-2 ring-primary-light/40">
            {getInitials(user?.name)}
          </div>
          <h3 className="font-display text-lg font-bold text-ink">{user?.name}</h3>
          <p className="text-sm text-muted mb-5">{user?.email}</p>
          <div className="w-full border-t border-border/80 pt-4">
            <p className="coord-label text-muted mb-2.5">Theme Mode</p>
            <ThemeToggle />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <form onSubmit={handleSave} className="space-y-5">
            <Input
              label="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Degree / Course"
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
            <Input
              label="Skills"
              hint="Comma-separated, e.g. Python, SQL, Communication"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
            />
            <Input
              label="Interests"
              hint="Comma-separated, e.g. Web Development, AI, Design"
              value={form.interests}
              onChange={(e) => setForm({ ...form, interests: e.target.value })}
            />
            <Input
              label="Career goal"
              value={form.careerGoal}
              onChange={(e) => setForm({ ...form, careerGoal: e.target.value })}
              placeholder="e.g. Frontend Developer"
            />

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" icon={Save} loading={saving}>
                Save changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;

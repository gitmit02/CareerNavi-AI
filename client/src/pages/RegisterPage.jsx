import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, CheckCircle2 } from "lucide-react";
import Logo from "../components/ui/Logo";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import ThemeToggle from "../components/ui/ThemeToggle";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { isValidEmail, isValidPassword } from "../utils/validators";

const RegisterPage = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!isValidEmail(form.email)) next.email = "Enter a valid email address";
    if (!isValidPassword(form.password)) next.password = "Password must be at least 6 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register(form);
      toast.success("Account created! Let's calibrate your profile.");
      navigate("/onboarding", { replace: true });
    } catch (err) {
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg bg-crimson-grid flex flex-col">
      <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-5">
        <Link to="/">
          <Logo />
        </Link>
        <ThemeToggle />
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Startup Pitch Panel */}
          <div className="hidden lg:block pr-6">
            <span className="coord-label text-primary">Get Started Free</span>
            <h1 className="font-display text-4xl font-bold text-ink tracking-tight mt-2 mb-4">
              Build your custom{" "}
              <span className="font-serif italic font-normal text-gradient-crimson">career highway</span> in minutes.
            </h1>
            <p className="text-sm text-muted leading-relaxed mb-6">
              Tell us your degree, current skills, and ambitions. Our AI generates an interactive road of milestones you
              can tick off step by step.
            </p>
            <div className="space-y-2.5 text-xs text-muted">
              {[
                "Tailored 30/60/90-day career roadmaps",
                "Real-time internship & student program matching",
                "Switch anytime between Light, Dark & Vibrant Fun modes",
              ].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-success shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Form Card */}
          <Card className="w-full max-w-md mx-auto !p-6 sm:!p-8 shadow-soft">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-ink mb-1">Create your account</h2>
              <p className="text-sm text-muted">Start navigating your career with a concrete plan.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <Input
                label="Full name"
                name="name"
                placeholder="Riya Sharma"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={errors.name}
                autoComplete="name"
              />
              <Input
                label="Email"
                type="email"
                name="email"
                placeholder="you@college.edu"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={errors.email}
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
                autoComplete="new-password"
              />
              <Button type="submit" className="w-full mt-2" size="lg" icon={UserPlus} loading={submitting}>
                Create account
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-display font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

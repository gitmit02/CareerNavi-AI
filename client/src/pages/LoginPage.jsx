import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, CheckCircle2 } from "lucide-react";
import Logo from "../components/ui/Logo";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import ThemeToggle from "../components/ui/ThemeToggle";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { isValidEmail } from "../utils/validators";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const validate = () => {
    const next = {};
    if (!isValidEmail(form.email)) next.email = "Enter a valid email address";
    if (!form.password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await login(form);
      toast.success("Welcome back!");
      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.message || "Login failed. Please check your credentials.");
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
            <span className="coord-label text-primary">CareerNavi AI Workspace</span>
            <h1 className="font-display text-4xl font-bold text-ink tracking-tight mt-2 mb-4">
              Pick up right where you left off on your{" "}
              <span className="font-serif italic font-normal text-gradient-crimson">career road.</span>
            </h1>
            <p className="text-sm text-muted leading-relaxed mb-6">
              Access your interactive milestone highway, real-time readiness diagnostics, and verified internship
              matches.
            </p>
            <div className="space-y-2.5 text-xs text-muted">
              {[
                "Interactive step-by-step road with tick-off milestones",
                "Live skill gap score against target roles",
                "24/7 AI career mentor for interview & project guidance",
              ].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-success shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Auth Card */}
          <Card className="w-full max-w-md mx-auto !p-6 sm:!p-8 shadow-soft">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-ink mb-1">Sign in to your account</h2>
              <p className="text-sm text-muted">Enter your credentials to open your workspace.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
                autoComplete="current-password"
              />
              <Button type="submit" className="w-full mt-2" size="lg" icon={LogIn} loading={submitting}>
                Sign in
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary font-display font-semibold hover:underline">
                Create one free
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

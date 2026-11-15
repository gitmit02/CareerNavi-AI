import { Link, useLocation } from "react-router-dom";
import { Map } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";

const Topbar = ({ title, subtitle }) => {
  const location = useLocation();
  const onRoadmap = location.pathname === "/roadmap";

  return (
    <div className="hidden lg:flex items-center justify-between border-b border-border bg-surface/85 backdrop-blur-xl px-8 py-4 sticky top-0 z-20">
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {!onRoadmap && (
          <Link
            to="/roadmap"
            className="inline-flex items-center gap-2 rounded-xl border border-primary/35 bg-primary/10 px-3 py-1.5 text-xs font-display font-semibold text-primary-light hover:bg-primary hover:text-white transition-all"
          >
            <Map size={14} /> Open Career Road
          </Link>
        )}
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Topbar;

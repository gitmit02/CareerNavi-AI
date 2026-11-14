import ThemeToggle from "../ui/ThemeToggle";

const Topbar = ({ title, subtitle }) => (
  <div className="hidden lg:flex items-center justify-between border-b border-border bg-surface/80 backdrop-blur px-8 py-5 sticky top-0 z-20">
    <div>
      <h1 className="font-display text-xl font-bold text-ink">{title}</h1>
      {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
    </div>
    <ThemeToggle />
  </div>
);

export default Topbar;

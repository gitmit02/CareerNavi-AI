const VARIANTS = {
  default: "bg-surface2/90 text-ink border-border/90 hover:border-primary/40",
  primary: "bg-primary/15 text-primary-light border-primary/35 shadow-[0_0_12px_-4px_rgba(225,29,72,0.4)]",
  success: "bg-success/15 text-success border-success/35 shadow-[0_0_12px_-4px_rgba(52,211,153,0.35)]",
  danger: "bg-danger/15 text-danger border-danger/35 shadow-[0_0_12px_-4px_rgba(255,77,109,0.35)]",
  accent: "bg-accent/15 text-accent border-accent/35 shadow-[0_0_12px_-4px_rgba(245,158,11,0.35)]",
};

const Badge = ({ children, variant = "default", className = "" }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium tracking-wide whitespace-nowrap transition-colors ${VARIANTS[variant]} ${className}`}
  >
    {children}
  </span>
);

export default Badge;

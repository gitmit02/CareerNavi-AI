const VARIANTS = {
  default: "bg-surface2 text-ink border-border",
  primary: "bg-primary/10 text-primary border-primary/20",
  success: "bg-success/10 text-success border-success/20",
  danger: "bg-danger/10 text-danger border-danger/20",
  accent: "bg-accent/15 text-accent-2 border-accent/25",
};

const Badge = ({ children, variant = "default", className = "" }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${VARIANTS[variant]} ${className}`}
  >
    {children}
  </span>
);

export default Badge;

import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-primary text-white hover:bg-primary-dark shadow-[0_1px_2px_rgba(0,0,0,0.2),0_6px_18px_-4px_rgba(var(--c-primary-rgb),0.45)] hover:shadow-[0_8px_24px_-4px_rgba(var(--c-primary-rgb),0.6)] hover:-translate-y-[1px]",
  secondary:
    "bg-surface2 text-ink hover:bg-border/70 border border-border shadow-sm",
  outline:
    "bg-surface/60 backdrop-blur-sm text-ink border border-border hover:border-primary/50 hover:bg-surface2",
  ghost:
    "bg-transparent text-muted hover:text-ink hover:bg-surface2",
  danger:
    "bg-danger text-white hover:opacity-90 shadow-sm",
  accent:
    "bg-accent text-white font-semibold hover:opacity-95 shadow-sm",
};

const SIZES = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
  lg: "text-sm sm:text-base px-5 py-3 gap-2",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = "left",
  className = "",
  type = "button",
  ...rest
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-display font-semibold tracking-tight rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:translate-y-0 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        Icon && iconPosition === "left" && <Icon size={16} />
      )}
      {children}
      {!loading && Icon && iconPosition === "right" && <Icon size={16} />}
    </button>
  );
};

export default Button;

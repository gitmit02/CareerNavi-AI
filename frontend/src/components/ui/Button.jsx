import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-primary text-white hover:bg-primary-dark shadow-sm disabled:hover:bg-primary",
  secondary:
    "bg-surface2 text-ink hover:bg-border border border-border",
  outline:
    "bg-transparent text-ink border border-border hover:bg-surface2",
  ghost: "bg-transparent text-muted hover:text-ink hover:bg-surface2",
  danger: "bg-danger text-white hover:opacity-90",
  accent: "bg-accent text-ink hover:opacity-90",
};

const SIZES = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
  lg: "text-base px-6 py-3 gap-2",
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
      className={`inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
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

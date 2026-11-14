const Logo = ({ className = "", showWordmark = true, size = 28 }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="16" fill="var(--c-primary)" />
      <circle
        cx="32"
        cy="32"
        r="20"
        fill="none"
        stroke="var(--c-accent)"
        strokeWidth="2.5"
        strokeDasharray="3 5"
      />
      <path d="M32 18 L38 32 L32 46 L26 32 Z" fill="var(--c-surface)" />
      <circle cx="32" cy="32" r="3.5" fill="var(--c-accent)" />
    </svg>
    {showWordmark && (
      <span className="font-display font-bold text-lg tracking-tight text-ink">
        CareerNavi <span className="text-primary">AI</span>
      </span>
    )}
  </div>
);

export default Logo;

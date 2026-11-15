import { useId } from "react";

const Logo = ({ className = "", showWordmark = true, size = 30 }) => {
  const gradId = useId();
  return (
    <div className={`flex items-center gap-2.5 group ${className}`}>
      <div className="relative flex items-center justify-center rounded-xl shadow-[0_0_20px_-4px_rgba(225,29,72,0.65)] transition-transform duration-300 group-hover:scale-105">
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--c-primary-light)" />
              <stop offset="45%" stopColor="var(--c-primary)" />
              <stop offset="100%" stopColor="#6b0f2a" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="16" fill={`url(#${gradId})`} />
          <rect
            x="1.5"
            y="1.5"
            width="61"
            height="61"
            rx="14.5"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1.5"
          />
          <circle
            cx="32"
            cy="32"
            r="20"
            fill="none"
            stroke="var(--c-accent)"
            strokeWidth="2.5"
            strokeDasharray="3 5"
          />
          <path d="M32 16 L38.5 32 L32 48 L25.5 32 Z" fill="#fff1f4" />
          <circle cx="32" cy="32" r="3.8" fill="var(--c-accent)" />
        </svg>
      </div>
      {showWordmark && (
        <span className="font-display font-bold text-lg tracking-tight text-ink flex items-center gap-1.5">
          <span>CareerNavi</span>
          <span className="rounded-md bg-gradient-to-r from-primary/25 to-accent/20 border border-primary/40 px-1.5 py-0.5 text-xs font-mono font-bold tracking-wider text-primary-light shadow-sm">
            AI
          </span>
        </span>
      )}
    </div>
  );
};

export default Logo;

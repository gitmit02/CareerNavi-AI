import { useId } from "react";

const ProgressRing = ({ percent = 0, size = 88, strokeWidth = 8, label, sublabel, color }) => {
  const gradId = useId();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center drop-shadow-[0_0_16px_rgba(225,29,72,0.3)]"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--c-primary-light)" />
            <stop offset="55%" stopColor="var(--c-primary)" />
            <stop offset="100%" stopColor="var(--c-accent)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--c-surface-2)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color || `url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-extrabold text-xl text-ink leading-none">
          {label ?? `${Math.round(clamped)}%`}
        </span>
        {sublabel && <span className="text-[10px] font-mono uppercase tracking-wider text-muted mt-1">{sublabel}</span>}
      </div>
    </div>
  );
};

export default ProgressRing;

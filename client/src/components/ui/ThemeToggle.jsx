import { Sun, Moon, Sparkles } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

const THEME_META = {
  light: {
    icon: Sun,
    label: "Light",
    activeClass: "bg-surface text-ink shadow-sm border border-border",
  },
  dark: {
    icon: Moon,
    label: "Dark",
    activeClass: "bg-primary text-white shadow-sm",
  },
  fun: {
    icon: Sparkles,
    label: "Fun",
    activeClass: "bg-gradient-to-r from-[#ff2a7a] via-[#8b5cf6] to-[#06b6d4] text-white shadow-[0_2px_12px_rgba(255,42,122,0.5)]",
  },
};

const ThemeToggle = ({ compact = false }) => {
  const { theme, setTheme, themes, cycleTheme } = useTheme();

  if (compact) {
    const meta = THEME_META[theme] || THEME_META.dark;
    const Icon = meta.icon;
    return (
      <button
        onClick={cycleTheme}
        aria-label={`Current theme: ${meta.label}. Click to switch theme.`}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-muted hover:text-ink hover:border-primary/50 transition-all"
      >
        <Icon size={16} />
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface2/80 backdrop-blur-md p-1">
      {themes.map((t) => {
        const { icon: Icon, label, activeClass } = THEME_META[t];
        const active = theme === t;
        return (
          <button
            key={t}
            onClick={() => setTheme(t)}
            aria-pressed={active}
            aria-label={`Switch to ${label} theme`}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-display font-medium transition-all ${
              active ? activeClass : "text-muted hover:text-ink"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;

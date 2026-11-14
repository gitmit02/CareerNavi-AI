import { Sun, Moon, Sparkles } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

const THEME_META = {
  light: { icon: Sun, label: "Light" },
  dark: { icon: Moon, label: "Dark" },
  fun: { icon: Sparkles, label: "Fun" },
};

const ThemeToggle = ({ compact = false }) => {
  const { theme, setTheme, themes, cycleTheme } = useTheme();

  if (compact) {
    const { icon: Icon } = THEME_META[theme];
    return (
      <button
        onClick={cycleTheme}
        aria-label={`Current theme: ${THEME_META[theme].label}. Click to switch theme.`}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted hover:text-ink hover:bg-surface2 transition-colors"
      >
        <Icon size={16} />
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-surface2 p-1">
      {themes.map((t) => {
        const { icon: Icon, label } = THEME_META[t];
        const active = theme === t;
        return (
          <button
            key={t}
            onClick={() => setTheme(t)}
            aria-pressed={active}
            aria-label={`Switch to ${label} theme`}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              active ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;

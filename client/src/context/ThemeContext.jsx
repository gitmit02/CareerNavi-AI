import { createContext, useCallback, useEffect, useState } from "react";

export const ThemeContext = createContext(null);

const THEMES = ["light", "dark", "fun"];
const STORAGE_KEY = "careernavi-theme-mode";

const getInitialTheme = () => {
  if (typeof window === "undefined") return "dark";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved && THEMES.includes(saved)) return saved;
  return "dark";
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((next) => {
    if (THEMES.includes(next)) setThemeState(next);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState((prev) => {
      const idx = THEMES.indexOf(prev);
      return THEMES[(idx + 1) % THEMES.length];
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

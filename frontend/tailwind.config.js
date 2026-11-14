/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--c-bg)",
        surface: "var(--c-surface)",
        surface2: "var(--c-surface-2)",
        border: "var(--c-border)",
        ink: "var(--c-ink)",
        muted: "var(--c-muted)",
        primary: {
          DEFAULT: "var(--c-primary)",
          dark: "var(--c-primary-dark)",
          light: "var(--c-primary-light)",
        },
        accent: "var(--c-accent)",
        accent2: "var(--c-accent-2)",
        success: "var(--c-success)",
        danger: "var(--c-danger)",
        warning: "var(--c-warning)",
      },
      fontFamily: {
        display: ["'Sora'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(20, 22, 31, 0.04), 0 8px 24px -12px rgba(20, 22, 31, 0.10)",
        card: "0 1px 2px rgba(20, 22, 31, 0.04), 0 2px 8px -2px rgba(20, 22, 31, 0.06)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "dash-move": {
          "0%": { strokeDashoffset: 0 },
          "100%": { strokeDashoffset: -40 },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.55 },
        },
        typing: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        "dash-move": "dash-move 1.2s linear infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        typing: "typing 1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

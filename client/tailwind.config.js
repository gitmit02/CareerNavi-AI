/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--c-bg-rgb) / <alpha-value>)",
        surface: "rgb(var(--c-surface-rgb) / <alpha-value>)",
        surface2: "rgb(var(--c-surface-2-rgb) / <alpha-value>)",
        border: "rgb(var(--c-border-rgb) / <alpha-value>)",
        ink: "rgb(var(--c-ink-rgb) / <alpha-value>)",
        muted: "rgb(var(--c-muted-rgb) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--c-primary-rgb) / <alpha-value>)",
          dark: "rgb(var(--c-primary-dark-rgb) / <alpha-value>)",
          light: "rgb(var(--c-primary-light-rgb) / <alpha-value>)",
        },
        accent: "rgb(var(--c-accent-rgb) / <alpha-value>)",
        "accent-2": "rgb(var(--c-accent-2-rgb) / <alpha-value>)",
        accent2: "rgb(var(--c-accent-2-rgb) / <alpha-value>)",
        success: "rgb(var(--c-success-rgb) / <alpha-value>)",
        danger: "rgb(var(--c-danger-rgb) / <alpha-value>)",
        warning: "rgb(var(--c-warning-rgb) / <alpha-value>)",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "'Plus Jakarta Sans'", "sans-serif"],
        serif: ["'Instrument Serif'", "Georgia", "serif"],
        body: ["'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        card: "var(--shadow-card)",
        crimson: "var(--shadow-glow)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(6px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "dash-move": {
          "0%": { strokeDashoffset: 0 },
          "100%": { strokeDashoffset: -48 },
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
        "fade-in": "fade-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
        "dash-move": "dash-move 1.4s linear infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        typing: "typing 1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

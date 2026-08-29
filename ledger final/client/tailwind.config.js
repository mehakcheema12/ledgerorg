/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--color-bg) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-raised": "rgb(var(--color-surface-raised) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        ink: "rgb(var(--color-text) / <alpha-value>)",
        "ink-muted": "rgb(var(--color-text-muted) / <alpha-value>)",
        text: "rgb(var(--color-text) / <alpha-value>)",
        "text-muted": "rgb(var(--color-text-muted) / <alpha-value>)",

        yellow: "rgb(var(--color-yellow) / <alpha-value>)",
        lavender: "rgb(var(--color-lavender) / <alpha-value>)",
        coral: "rgb(var(--color-coral) / <alpha-value>)",
        mint: "rgb(var(--color-mint) / <alpha-value>)",
        skyblue: "rgb(var(--color-blue) / <alpha-value>)",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'General Sans'", "system-ui", "sans-serif"],
        mono: ["'Space Mono'", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgb(0 0 0 / 0.25)",
        "soft-lg": "0 20px 60px -20px rgb(0 0 0 / 0.35)",
      },
      keyframes: {
        "flame-flicker": {
          "0%, 100%": { transform: "scale(1) rotate(0deg)" },
          "25%": { transform: "scale(1.04) rotate(-2deg)" },
          "75%": { transform: "scale(0.97) rotate(2deg)" },
        },
        "pop-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "spark-burst": {
          "0%": { transform: "scale(0.4)", opacity: "0" },
          "40%": { opacity: "1" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        flicker: "flame-flicker 2.4s ease-in-out infinite",
        "pop-in": "pop-in 0.2s ease-out",
        "spark-burst": "spark-burst 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};

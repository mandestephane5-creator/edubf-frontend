/** @type {import('tailwindcss').Config} */
function withOpacity(variableName) {
  return ({ opacityValue }) =>
    opacityValue !== undefined ? `rgb(var(${variableName}) / ${opacityValue})` : `rgb(var(${variableName}))`;
}

module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: withOpacity("--color-bg"),
        surface: withOpacity("--color-surface"),
        ink: withOpacity("--color-ink"),
        muted: withOpacity("--color-muted"),
        border: withOpacity("--color-border"),
        primary: {
          DEFAULT: withOpacity("--color-primary"),
          light: withOpacity("--color-primary-light"),
          dark: withOpacity("--color-primary-dark"),
          soft: withOpacity("--color-primary-soft"),
        },
        rose: { DEFAULT: withOpacity("--color-rose"), soft: withOpacity("--color-rose-soft") },
        emerald: { DEFAULT: withOpacity("--color-emerald"), soft: withOpacity("--color-emerald-soft") },
        amber: { DEFAULT: withOpacity("--color-amber"), soft: withOpacity("--color-amber-soft") },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(18,24,74,0.04), 0 8px 24px rgba(18,24,74,0.05)",
      },
    },
  },
  plugins: [],
};

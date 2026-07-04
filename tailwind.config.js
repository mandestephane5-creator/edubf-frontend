/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F4F6FF",
        surface: "#FFFFFF",
        ink: "#12184A",
        muted: "#5A5F8A",
        border: "#E4E8FB",
        primary: {
          DEFAULT: "#1E3AE8",
          light: "#4A63ED",
          dark: "#1730BD",
          soft: "#D6DCFB",
        },
        rose: { DEFAULT: "#C2323E", soft: "#FFD9DC" },
        emerald: { DEFAULT: "#1C8A5A", soft: "#D9F3E4" },
        amber: { DEFAULT: "#B4790A", soft: "#FCEBC9" },
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

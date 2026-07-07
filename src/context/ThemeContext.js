"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "vorelix_theme_preference";

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const initial = saved ? saved === "dark" : !!prefersDark;
    setIsDark(initial);
    document.documentElement.classList.toggle("dark", initial);
    setLoaded(true);
  }, []);

  function toggleDarkMode() {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleDarkMode, loaded }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme doit être utilisé à l'intérieur de <ThemeProvider>");
  return ctx;
}

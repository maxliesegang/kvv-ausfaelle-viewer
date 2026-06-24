import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "kvv-theme";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredOverride(): Theme | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
}

/**
 * Drives KERN's `data-kern-theme` attribute on <html>. Defaults to the OS
 * preference and follows it live, unless the user has set a manual override
 * (persisted in localStorage) via {@link toggleTheme}.
 */
export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const [override, setOverride] = useState<Theme | null>(getStoredOverride);
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemTheme(mql.matches ? "dark" : "light");
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const theme = override ?? systemTheme;

  useEffect(() => {
    document.documentElement.setAttribute("data-kern-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setOverride((current) => {
      const next: Theme = (current ?? getSystemTheme()) === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}

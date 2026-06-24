import { useEffect, useState } from "react";
import type { Theme } from "./useTheme";

export interface ChartColors {
  daily: string;
  line: string;
  timeOfDay: string;
  dayOfWeek: string;
  cause: string;
}

const TOKENS: Record<keyof ChartColors, string> = {
  daily: "--kern-color-action-default",
  line: "--kern-color-feedback-success",
  timeOfDay: "--kern-color-feedback-warning",
  dayOfWeek: "--kern-color-feedback-info",
  cause: "--kern-color-feedback-danger",
};

/** Sensible KERN-ish fallbacks used before the computed styles are read. */
const FALLBACK: ChartColors = {
  daily: "#2d3c80",
  line: "#2e7d32",
  timeOfDay: "#b45309",
  dayOfWeek: "#1565c0",
  cause: "#b3261e",
};

/**
 * Resolves KERN color tokens to concrete `rgb()` strings for Recharts. SVG
 * `fill` attributes cannot resolve `var(--kern-…)`, and `getComputedStyle` on a
 * custom property returns the unsubstituted `var()` chain — so we let the
 * browser resolve it by assigning `color: var(--token)` to a probe element and
 * reading back its *used* color. Refreshed whenever the theme changes.
 */
export function useChartColors(theme: Theme): ChartColors {
  const [colors, setColors] = useState<ChartColors>(FALLBACK);

  useEffect(() => {
    const probe = document.createElement("span");
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    document.body.appendChild(probe);

    const read = (token: string, fallback: string) => {
      probe.style.color = fallback;
      probe.style.color = `var(${token})`;
      return getComputedStyle(probe).color || fallback;
    };

    const next = {} as ChartColors;
    for (const key of Object.keys(TOKENS) as Array<keyof ChartColors>) {
      next[key] = read(TOKENS[key], FALLBACK[key]);
    }

    document.body.removeChild(probe);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setColors(next);
  }, [theme]);

  return colors;
}

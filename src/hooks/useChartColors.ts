import { useEffect, useState } from "react";
import type { Theme } from "./useTheme";

export interface ChartColors {
  daily: string;
  /** The trailing-mean line drawn over the daily bars — deliberately the plain
   * text color, so it reads as an annotation of the bars rather than a rival
   * series with its own identity. */
  dailyTrend: string;
  line: string;
  stop: string;
  hour: string;
  dayOfWeek: string;
  cause: string;
  verification: string;
}

/** Each chart carries a single series, so these hues only need to be legible on
 * their own — they are not a categorical scale and must not be read as one. */
const TOKENS: Record<keyof ChartColors, string> = {
  daily: "--kern-color-action-default",
  dailyTrend: "--kern-color-layout-text-default",
  line: "--kern-color-feedback-success",
  stop: "--kern-color-feedback-info",
  hour: "--kern-color-feedback-warning",
  dayOfWeek: "--kern-color-action-visited",
  cause: "--kern-color-feedback-danger",
  verification: "--kern-color-action-default",
};

/** Sensible KERN-ish fallbacks used before the computed styles are read, and
 * whenever a token is missing from the loaded theme. */
const FALLBACK: ChartColors = {
  daily: "#2d3c80",
  dailyTrend: "#1b1b1b",
  line: "#2e7d32",
  stop: "#1565c0",
  hour: "#b45309",
  dayOfWeek: "#5b21b6",
  cause: "#b3261e",
  verification: "#2d3c80",
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

    // The `var()` fallback matters: an unknown token would otherwise compute to
    // the inherited color rather than to ours.
    const read = (token: string, fallback: string) => {
      probe.style.color = fallback;
      probe.style.color = `var(${token}, ${fallback})`;
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

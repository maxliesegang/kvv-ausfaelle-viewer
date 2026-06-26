import type { CancellationCause, CauseFilter } from "../types";

/**
 * Cancellation cause ("Ursache") helpers — German labels, ordering and filter
 * options for the scraper's best-effort `cause` category. Mirrors the structure
 * of the time-of-day / day-of-week helpers in `dateUtils.ts`.
 *
 * Display/priority order matches the scraper's classifier (specific causes before
 * generic ones): strike → weather → technical → construction → operational →
 * unknown.
 * Extending is trivial: add the value to the scraper's enum, then here.
 */
export const CAUSE_ORDER: ReadonlyArray<CancellationCause> = [
  "strike",
  "weather",
  "technical",
  "construction",
  "operational",
  "unknown",
];

export const CAUSE_LABELS: Record<CancellationCause, string> = {
  strike: "Streik",
  weather: "Witterung",
  technical: "Technische Störung",
  construction: "Bauarbeiten",
  operational: "Betriebsbedingt",
  unknown: "Unbekannt",
};

const CAUSE_SET = new Set<CancellationCause>(CAUSE_ORDER);

/** Coerces a raw/absent `cause` value into a known category; legacy records that
 * predate the field (or carry an unrecognised value) fall back to `unknown`. The
 * former `personnel` category was merged into `operational`, so remap it. */
export function normalizeCause(value: string | undefined): CancellationCause {
  if (value === "personnel") return "operational";
  return value && CAUSE_SET.has(value as CancellationCause)
    ? (value as CancellationCause)
    : "unknown";
}

export const CAUSE_FILTER_OPTIONS: ReadonlyArray<{ value: CauseFilter; label: string }> = [
  { value: "all", label: "Alle Ursachen" },
  ...CAUSE_ORDER.map((cause) => ({ value: cause, label: CAUSE_LABELS[cause] })),
];

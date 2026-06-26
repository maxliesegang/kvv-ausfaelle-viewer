export interface RootIndex {
  years: string[];
}

export interface YearIndex {
  files: string[];
}

/** Best-effort category for why a trip was cancelled, mirroring the scraper's
 * `CancellationCause`. Older records predate this field — treat a missing value
 * as `unknown` (see `normalizeCause` in `utils/causeUtils.ts`). */
export type CancellationCause =
  | "strike"
  | "weather"
  | "technical"
  | "construction"
  | "operational"
  | "unknown";

export type CauseFilter = CancellationCause | "all";

export interface Cancellation {
  date: string;
  line: string;
  trainNumber: string;
  fromStop: string;
  toStop: string;
  fromTime?: string;
  toTime?: string;
  sourceUrl: string;
  cause?: CancellationCause;
}

export interface DailyStats {
  date: string;
  count: number;
}

export interface LineStats {
  line: string;
  count: number;
}

export interface TimeOfDayStats {
  period: string;
  count: number;
}

export interface DayOfWeekStats {
  day: string;
  count: number;
}

export interface CauseStats {
  cause: string;
  count: number;
}

export type TimeOfDayCategory =
  | "morning"
  | "late-morning"
  | "afternoon"
  | "evening"
  | "night"
  | "unknown";

export type TimeOfDayFilter = TimeOfDayCategory | "all";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

/** "weekday" and "weekend" are synthetic groupings; individual days are exact matches. */
export type DayOfWeekFilter = "all" | "weekday" | "weekend" | DayOfWeek;

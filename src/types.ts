/** One entry of the scraper's public cause ("Ursache") taxonomy, as published in
 * the root `index.json`. `id` is a stable data value; `label`/`description` are
 * German display metadata. The catalog's array order is the producer-defined
 * display order — the viewer never hard-codes this list (see `utils/causeUtils.ts`). */
export interface CauseDefinition {
  id: string;
  label: string;
  description: string;
}

/** The root discovery contract. `schemaVersion` bumps only for breaking root
 * changes; additional fields must be tolerated. Validated at load time via
 * `parseRootIndex` in `utils/rootIndex.ts` — do not assert this shape unchecked. */
export interface RootIndex {
  schemaVersion: number;
  years: string[];
  causes: CauseDefinition[];
}

export interface YearIndex {
  files: string[];
}

/** The cause filter value: a catalog cause `id`, or the "all" sentinel. Cause ids
 * are external runtime data, so this is deliberately an open string rather than a
 * closed union duplicated from the scraper. */
export type CauseFilter = string;

export interface Cancellation {
  date: string;
  line: string;
  trainNumber: string;
  fromStop: string;
  toStop: string;
  fromTime?: string;
  toTime?: string;
  sourceUrl: string;
  /** Best-effort cause category id from the scraper. External runtime data:
   * modelled as an open string, resolved against the loaded catalog. Missing on
   * legacy records that predate the field (treated as `unknown`). */
  cause?: string;
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

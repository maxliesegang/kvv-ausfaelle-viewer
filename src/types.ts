/** One entry of the scraper's public cause ("Ursache") taxonomy, as published in
 * the root `index.json`. `id` is a stable data value; `label`/`description` are
 * German display metadata. The catalog's array order is the producer-defined
 * display order — the viewer never hard-codes this list (see `utils/causeUtils.ts`). */
export interface CauseDefinition {
  id: string;
  label: string;
  description: string;
}

/** One entry of the scraper's public verification status taxonomy, as published
 * in the root `index.json`. Same shape as {@link CauseDefinition}, but its
 * `label`/`description` are English (the scraper's own wording) — the viewer
 * renders German labels for the known ids, see `utils/verificationUtils.ts`. */
export interface VerificationStatusDefinition {
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
  /** Ordered verification status taxonomy. Empty when the source publishes none
   * — the whole verification UI is then hidden rather than half-rendered. */
  verificationStatuses: VerificationStatusDefinition[];
}

/** Per-year verification roll-up published alongside the file list. The viewer
 * only reads `source` (for attribution); the tallies are recomputed from the
 * loaded records so they always match the active filters. */
export interface YearVerificationSummary {
  source?: string;
  checkedTrips?: number;
  totalTrips?: number;
  statusCounts?: Record<string, number>;
}

export interface YearIndex {
  files: string[];
  verification?: YearVerificationSummary;
}

/** The cause filter value: a catalog cause `id`, or the "all" sentinel. Cause ids
 * are external runtime data, so this is deliberately an open string rather than a
 * closed union duplicated from the scraper. */
export type CauseFilter = string;

/** Advisory evidence from an external realtime source about whether the
 * announced cancellation actually happened. Optional by contract: absent on
 * records the source never checked (the large majority) and on trips outside its
 * rolling lookback window. It never overrides the record's primary meaning —
 * that KVV announced a cancellation. Evidence counts beyond `status` are kept
 * out of the viewer's model; they are the scraper's audit trail. */
export interface Verification {
  /** A `verificationStatuses` id. External runtime data, so an open string. */
  status: string;
  /** Provenance of the check, e.g. `bahn.expert`. */
  source?: string;
  /** ISO date the check ran. */
  checkedAt?: string;
}

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
  /** Advisory realtime-verification verdict; absent on unchecked records. */
  verification?: Verification;
}

export interface DailyStats {
  date: string;
  count: number;
  /** Trailing 7-day mean of `count`, or null for the first six days of the
   * series (no full window yet). Days with no cancellations are materialized as
   * `count: 0` so both the bars and this mean read on a real calendar axis. */
  rolling: number | null;
}

export interface LineStats {
  line: string;
  count: number;
}

/** Departure-hour histogram bucket. `hour` is 0–23; `label` is the padded
 * two-digit axis tick. Records without a departure time are not counted. */
export interface HourStats {
  hour: number;
  label: string;
  count: number;
}

/** Departure-stop ranking bucket (the busiest origins of cancelled trips). */
export interface StopStats {
  stop: string;
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

export interface VerificationStats {
  status: string;
  count: number;
}

/** The verification filter value: a `VerificationGroupId` (the viewer's
 * three-way roll-up of the published statuses — see `utils/verificationUtils.ts`)
 * or the "all" sentinel. */
export type VerificationFilter = string;

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

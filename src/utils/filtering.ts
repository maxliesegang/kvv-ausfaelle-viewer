import type {
  Cancellation,
  CauseFilter,
  CauseStats,
  DailyStats,
  DayOfWeek,
  DayOfWeekFilter,
  DayOfWeekStats,
  HourStats,
  LineStats,
  StopStats,
  TimeOfDayCategory,
  TimeOfDayFilter,
  VerificationFilter,
  VerificationStats,
} from "../types";
import {
  addDays,
  DAY_OF_WEEK_CHART_ORDER,
  DAY_OF_WEEK_LABELS,
  getDayOfWeek,
  getHour,
  getTimeOfDayCategory,
  matchesDayOfWeekFilter,
} from "./dateUtils";
import { resolveCauseId, resolveCauseLabel, toCauseStats } from "./causeUtils";
import type { Catalogs } from "./catalogs";
import {
  getVerificationGroupLabel,
  resolveVerificationGroup,
  resolveVerificationLabel,
  resolveVerificationStatus,
  toVerificationStats,
  toVerificationSummary,
  type VerificationGroupId,
  type VerificationSummary,
} from "./verificationUtils";

export interface CancellationFilters {
  search: string;
  dateFrom: string;
  dateTo: string;
  timeOfDay: TimeOfDayFilter;
  dayOfWeek: DayOfWeekFilter;
  cause: CauseFilter;
  verification: VerificationFilter;
}

interface IndexedCancellation {
  item: Cancellation;
  searchText: string;
  timeOfDay: TimeOfDayCategory;
  /** Departure hour 0–23, or null when the record carries no usable time. */
  hour: number | null;
  dayOfWeek: DayOfWeek;
  /** Resolved cause key: a catalog id, or a raw id absent from the catalog. */
  cause: string;
  /** Resolved verification status key; `unchecked` when the record has no
   * verdict, which is the normal case for most records. Kept alongside the group
   * because the chart aggregates and the summary tile need to tell a checked
   * record apart from an unchecked one, which the group alone cannot. */
  verification: string;
  /** The group the status rolls up into — what the filter matches on. */
  verificationGroup: VerificationGroupId;
}

export const DEFAULT_CANCELLATION_FILTERS: Readonly<CancellationFilters> = {
  search: "",
  dateFrom: "",
  dateTo: "",
  timeOfDay: "all",
  dayOfWeek: "all",
  cause: "all",
  verification: "all",
};


export interface CancellationsView {
  filtered: Cancellation[];
  dailyStats: DailyStats[];
  lineStats: LineStats[];
  /** Busiest departure stops, longest bar first, capped at {@link TOP_STOPS}. */
  stopStats: StopStats[];
  /** Departure-hour histogram; empty when no record in the selection has a time. */
  hourStats: HourStats[];
  dayOfWeekStats: DayOfWeekStats[];
  causeStats: CauseStats[];
  verificationStats: VerificationStats[];
  /** Checked/confirmed tallies of the filtered set, for the summary tile. */
  verificationSummary: VerificationSummary;
  hasActiveFilters: boolean;
}

function buildSearchText(
  item: Cancellation,
  causeLabel: string,
  verificationLabels: string[]
): string {
  return [
    item.line,
    item.trainNumber,
    item.fromStop,
    item.toStop,
    causeLabel,
    // Both the group and the precise status, so a search matches whichever
    // wording the reader has in mind (the precise one is on the table tooltip
    // and in the CSV, so it is visible vocabulary too).
    ...verificationLabels,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function indexCancellations(
  data: Cancellation[],
  catalogs: Catalogs
): IndexedCancellation[] {
  return data.map((item) => {
    const cause = resolveCauseId(item.cause);
    const verification = resolveVerificationStatus(item.verification);
    const verificationGroup = resolveVerificationGroup(verification);
    return {
      item,
      searchText: buildSearchText(item, resolveCauseLabel(catalogs.causes, cause), [
        getVerificationGroupLabel(verificationGroup),
        resolveVerificationLabel(catalogs.verification, verification),
      ]),
      timeOfDay: getTimeOfDayCategory(item.fromTime),
      hour: getHour(item.fromTime),
      dayOfWeek: getDayOfWeek(item.date),
      cause,
      verification,
      verificationGroup,
    };
  });
}

/** Window of the trailing mean drawn on top of the daily bars. Seven days so a
 * full week is averaged and the strong weekday/weekend swing cancels out. */
const ROLLING_WINDOW = 7;

/** Longest continuous daily axis we will materialize. A year selection spans at
 * most ~366 days; the cap only guards against a nonsense date range in the data. */
const MAX_DAILY_POINTS = 800;

/**
 * Builds the daily series over a *continuous* calendar between the first and
 * last day of the selection: days with no cancellation are real zeros (nothing
 * was announced), and skipping them would both distort the bar chart's rhythm
 * and make the trailing mean average the wrong days. Each point also carries the
 * trailing {@link ROLLING_WINDOW}-day mean, null until the window is full.
 */
function toDailyStats(counts: Map<string, number>): DailyStats[] {
  if (counts.size === 0) return [];

  const dates = [...counts.keys()].sort((a, b) => a.localeCompare(b));
  const first = dates[0];
  const last = dates[dates.length - 1];

  const series: DailyStats[] = [];
  let cursor = first;
  while (cursor <= last && series.length < MAX_DAILY_POINTS) {
    series.push({ date: cursor, count: counts.get(cursor) ?? 0, rolling: null });
    cursor = addDays(cursor, 1);
  }

  let windowSum = 0;
  for (let i = 0; i < series.length; i += 1) {
    windowSum += series[i].count;
    if (i >= ROLLING_WINDOW) windowSum -= series[i - ROLLING_WINDOW].count;
    if (i >= ROLLING_WINDOW - 1) {
      series[i].rolling = Math.round((windowSum / ROLLING_WINDOW) * 10) / 10;
    }
  }

  return series;
}

/** How many departure stops the ranking chart shows. Beyond this the bars get
 * unreadably thin and the tail is a long list of one-off stops. */
const TOP_STOPS = 12;

function toStopStats(counts: Map<string, number>): StopStats[] {
  return [...counts.entries()]
    .map(([stop, count]) => ({ stop, count }))
    .sort((a, b) => b.count - a.count || a.stop.localeCompare(b.stop))
    .slice(0, TOP_STOPS);
}

/** Full 0–23 histogram, so the empty night hours stay visible as gaps rather
 * than collapsing the axis. Returns `[]` when nothing in the selection has a
 * departure time, which hides the chart instead of drawing a flat zero row. */
function toHourStats(counts: Map<number, number>): HourStats[] {
  if (counts.size === 0) return [];
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: `${hour}`.padStart(2, "0"),
    count: counts.get(hour) ?? 0,
  }));
}

function toLineStats(counts: Map<string, number>): LineStats[] {
  return [...counts.entries()]
    .map(([line, count]) => ({ line, count }))
    .sort((a, b) => b.count - a.count);
}

function toDayOfWeekStats(counts: Map<DayOfWeek, number>): DayOfWeekStats[] {
  return DAY_OF_WEEK_CHART_ORDER
    .map((dow) => ({
      day: DAY_OF_WEEK_LABELS[dow],
      count: counts.get(dow) ?? 0,
    }))
    .filter((item) => item.count > 0);
}

/** Active date bounds (0–2). */
export function getDateFilterCount(filters: CancellationFilters): number {
  return (filters.dateFrom ? 1 : 0) + (filters.dateTo ? 1 : 0);
}

/** Active filters living in the "Zeit" expander — date bounds, time-of-day and
 * weekday — which drives that toggle's badge. The year is data scope (always
 * set), so it doesn't count. */
export function getZeitFilterCount(filters: CancellationFilters): number {
  return (
    getDateFilterCount(filters) +
    (filters.timeOfDay !== "all" ? 1 : 0) +
    (filters.dayOfWeek !== "all" ? 1 : 0)
  );
}

/** Active non-date filters (search, cause, verification, time-of-day, weekday).
 * Time-of-day and weekday live in the "Zeit" expander but still count here
 * toward the total. */
export function getAdvancedFilterCount(filters: CancellationFilters): number {
  return [
    Boolean(filters.search.trim()),
    filters.timeOfDay !== "all",
    filters.dayOfWeek !== "all",
    filters.cause !== "all",
    filters.verification !== "all",
  ].filter(Boolean).length;
}

/** Total active filters — drives the filter panel's reset label and
 * `hasActiveFilters`. The reset clears everything, so date and advanced filters
 * both count. */
export function getActiveFilterCount(filters: CancellationFilters): number {
  return getDateFilterCount(filters) + getAdvancedFilterCount(filters);
}

export function buildCancellationsView(
  indexedData: IndexedCancellation[],
  filters: CancellationFilters,
  catalogs: Catalogs
): CancellationsView {
  const normalizedSearch = filters.search.trim().toLowerCase();
  const filtered: Cancellation[] = [];
  const dateCounts = new Map<string, number>();
  const lineCounts = new Map<string, number>();
  const stopCounts = new Map<string, number>();
  const hourCounts = new Map<number, number>();
  const dayOfWeekCounts = new Map<DayOfWeek, number>();
  const causeCounts = new Map<string, number>();
  const verificationCounts = new Map<string, number>();

  for (const {
    item,
    searchText,
    timeOfDay,
    hour,
    dayOfWeek,
    cause,
    verification,
    verificationGroup,
  } of indexedData) {
    if (filters.dateFrom && item.date < filters.dateFrom) continue;
    if (filters.dateTo && item.date > filters.dateTo) continue;
    if (normalizedSearch && !searchText.includes(normalizedSearch)) continue;
    if (filters.timeOfDay !== "all" && timeOfDay !== filters.timeOfDay) continue;
    if (!matchesDayOfWeekFilter(dayOfWeek, filters.dayOfWeek)) continue;
    if (filters.cause !== "all" && cause !== filters.cause) continue;
    if (filters.verification !== "all" && verificationGroup !== filters.verification) continue;

    filtered.push(item);
    dateCounts.set(item.date, (dateCounts.get(item.date) ?? 0) + 1);
    lineCounts.set(item.line, (lineCounts.get(item.line) ?? 0) + 1);
    if (item.fromStop) stopCounts.set(item.fromStop, (stopCounts.get(item.fromStop) ?? 0) + 1);
    if (hour !== null) hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1);
    dayOfWeekCounts.set(dayOfWeek, (dayOfWeekCounts.get(dayOfWeek) ?? 0) + 1);
    causeCounts.set(cause, (causeCounts.get(cause) ?? 0) + 1);
    verificationCounts.set(verification, (verificationCounts.get(verification) ?? 0) + 1);
  }

  return {
    filtered,
    dailyStats: toDailyStats(dateCounts),
    lineStats: toLineStats(lineCounts),
    stopStats: toStopStats(stopCounts),
    hourStats: toHourStats(hourCounts),
    dayOfWeekStats: toDayOfWeekStats(dayOfWeekCounts),
    causeStats: toCauseStats(causeCounts, catalogs.causes),
    verificationStats: toVerificationStats(verificationCounts, catalogs.verification),
    verificationSummary: toVerificationSummary(verificationCounts, catalogs.verification),
    hasActiveFilters: getActiveFilterCount(filters) > 0,
  };
}

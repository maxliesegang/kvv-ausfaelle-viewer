import type {
  Cancellation,
  CancellationCause,
  CauseFilter,
  CauseStats,
  DailyStats,
  DayOfWeek,
  DayOfWeekFilter,
  DayOfWeekStats,
  LineStats,
  TimeOfDayCategory,
  TimeOfDayFilter,
  TimeOfDayStats,
} from "../types";
import {
  DAY_OF_WEEK_CHART_ORDER,
  DAY_OF_WEEK_LABELS,
  getDayOfWeek,
  getTimeOfDayCategory,
  matchesDayOfWeekFilter,
  TIME_OF_DAY_CHART_ORDER,
  TIME_OF_DAY_LABELS,
} from "./dateUtils";
import { CAUSE_LABELS, CAUSE_ORDER, normalizeCause } from "./causeUtils";

export interface CancellationFilters {
  search: string;
  dateFrom: string;
  dateTo: string;
  timeOfDay: TimeOfDayFilter;
  dayOfWeek: DayOfWeekFilter;
  cause: CauseFilter;
}

interface IndexedCancellation {
  item: Cancellation;
  searchText: string;
  timeOfDay: TimeOfDayCategory;
  dayOfWeek: DayOfWeek;
  cause: CancellationCause;
}

export const DEFAULT_CANCELLATION_FILTERS: Readonly<CancellationFilters> = {
  search: "",
  dateFrom: "",
  dateTo: "",
  timeOfDay: "all",
  dayOfWeek: "all",
  cause: "all",
};


export interface CancellationsView {
  filtered: Cancellation[];
  dailyStats: DailyStats[];
  lineStats: LineStats[];
  timeOfDayStats: TimeOfDayStats[];
  dayOfWeekStats: DayOfWeekStats[];
  causeStats: CauseStats[];
  hasActiveFilters: boolean;
}

function buildSearchText(item: Cancellation): string {
  return [item.line, item.trainNumber, item.fromStop, item.toStop]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function indexCancellations(data: Cancellation[]): IndexedCancellation[] {
  return data.map((item) => ({
    item,
    searchText: buildSearchText(item),
    timeOfDay: getTimeOfDayCategory(item.fromTime),
    dayOfWeek: getDayOfWeek(item.date),
    cause: normalizeCause(item.cause),
  }));
}

function toDailyStats(counts: Map<string, number>): DailyStats[] {
  return [...counts.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function toLineStats(counts: Map<string, number>): LineStats[] {
  return [...counts.entries()]
    .map(([line, count]) => ({ line, count }))
    .sort((a, b) => b.count - a.count);
}

function toTimeOfDayStats(counts: Map<TimeOfDayCategory, number>): TimeOfDayStats[] {
  return TIME_OF_DAY_CHART_ORDER
    .map((category) => ({
      period: TIME_OF_DAY_LABELS[category],
      count: counts.get(category) ?? 0,
    }))
    .filter((item) => item.count > 0);
}

function toDayOfWeekStats(counts: Map<DayOfWeek, number>): DayOfWeekStats[] {
  return DAY_OF_WEEK_CHART_ORDER
    .map((dow) => ({
      day: DAY_OF_WEEK_LABELS[dow],
      count: counts.get(dow) ?? 0,
    }))
    .filter((item) => item.count > 0);
}

function toCauseStats(counts: Map<CancellationCause, number>): CauseStats[] {
  return CAUSE_ORDER
    .map((cause) => ({
      cause: CAUSE_LABELS[cause],
      count: counts.get(cause) ?? 0,
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

/** Active non-date filters (search, cause, time-of-day, weekday). Time-of-day
 * and weekday live in the "Zeit" expander but still count here toward the
 * total. */
export function getAdvancedFilterCount(filters: CancellationFilters): number {
  return [
    Boolean(filters.search.trim()),
    filters.timeOfDay !== "all",
    filters.dayOfWeek !== "all",
    filters.cause !== "all",
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
  filters: CancellationFilters
): CancellationsView {
  const normalizedSearch = filters.search.trim().toLowerCase();
  const filtered: Cancellation[] = [];
  const dateCounts = new Map<string, number>();
  const lineCounts = new Map<string, number>();
  const timeOfDayCounts = new Map<TimeOfDayCategory, number>();
  const dayOfWeekCounts = new Map<DayOfWeek, number>();
  const causeCounts = new Map<CancellationCause, number>();

  for (const { item, searchText, timeOfDay, dayOfWeek, cause } of indexedData) {
    if (filters.dateFrom && item.date < filters.dateFrom) continue;
    if (filters.dateTo && item.date > filters.dateTo) continue;
    if (normalizedSearch && !searchText.includes(normalizedSearch)) continue;
    if (filters.timeOfDay !== "all" && timeOfDay !== filters.timeOfDay) continue;
    if (!matchesDayOfWeekFilter(dayOfWeek, filters.dayOfWeek)) continue;
    if (filters.cause !== "all" && cause !== filters.cause) continue;

    filtered.push(item);
    dateCounts.set(item.date, (dateCounts.get(item.date) ?? 0) + 1);
    lineCounts.set(item.line, (lineCounts.get(item.line) ?? 0) + 1);
    timeOfDayCounts.set(timeOfDay, (timeOfDayCounts.get(timeOfDay) ?? 0) + 1);
    dayOfWeekCounts.set(dayOfWeek, (dayOfWeekCounts.get(dayOfWeek) ?? 0) + 1);
    causeCounts.set(cause, (causeCounts.get(cause) ?? 0) + 1);
  }

  return {
    filtered,
    dailyStats: toDailyStats(dateCounts),
    lineStats: toLineStats(lineCounts),
    timeOfDayStats: toTimeOfDayStats(timeOfDayCounts),
    dayOfWeekStats: toDayOfWeekStats(dayOfWeekCounts),
    causeStats: toCauseStats(causeCounts),
    hasActiveFilters: getActiveFilterCount(filters) > 0,
  };
}

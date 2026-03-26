import type {
  Cancellation,
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

export interface CancellationFilters {
  text: string;
  dateFrom: string;
  dateTo: string;
  timeOfDay: TimeOfDayFilter;
  dayOfWeek: DayOfWeekFilter;
}

interface IndexedCancellation {
  item: Cancellation;
  searchText: string;
  timeOfDay: TimeOfDayCategory;
  dayOfWeek: DayOfWeek;
}

export const DEFAULT_CANCELLATION_FILTERS: Readonly<CancellationFilters> = {
  text: "",
  dateFrom: "",
  dateTo: "",
  timeOfDay: "all",
  dayOfWeek: "all",
};

export interface CancellationsView {
  filtered: Cancellation[];
  dailyStats: DailyStats[];
  lineStats: LineStats[];
  timeOfDayStats: TimeOfDayStats[];
  dayOfWeekStats: DayOfWeekStats[];
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

export function getActiveFilterCount(filters: CancellationFilters): number {
  return [
    Boolean(filters.text.trim()),
    Boolean(filters.dateFrom),
    Boolean(filters.dateTo),
    filters.timeOfDay !== "all",
    filters.dayOfWeek !== "all",
  ].filter(Boolean).length;
}

export function buildCancellationsView(
  indexedData: IndexedCancellation[],
  filters: CancellationFilters
): CancellationsView {
  const normalizedText = filters.text.trim().toLowerCase();
  const filtered: Cancellation[] = [];
  const dateCounts = new Map<string, number>();
  const lineCounts = new Map<string, number>();
  const timeOfDayCounts = new Map<TimeOfDayCategory, number>();
  const dayOfWeekCounts = new Map<DayOfWeek, number>();

  for (const { item, searchText, timeOfDay, dayOfWeek } of indexedData) {
    if (filters.dateFrom && item.date < filters.dateFrom) continue;
    if (filters.dateTo && item.date > filters.dateTo) continue;
    if (normalizedText && !searchText.includes(normalizedText)) continue;
    if (filters.timeOfDay !== "all" && timeOfDay !== filters.timeOfDay) continue;
    if (!matchesDayOfWeekFilter(dayOfWeek, filters.dayOfWeek)) continue;

    filtered.push(item);
    dateCounts.set(item.date, (dateCounts.get(item.date) ?? 0) + 1);
    lineCounts.set(item.line, (lineCounts.get(item.line) ?? 0) + 1);
    timeOfDayCounts.set(timeOfDay, (timeOfDayCounts.get(timeOfDay) ?? 0) + 1);
    dayOfWeekCounts.set(dayOfWeek, (dayOfWeekCounts.get(dayOfWeek) ?? 0) + 1);
  }

  return {
    filtered,
    dailyStats: toDailyStats(dateCounts),
    lineStats: toLineStats(lineCounts),
    timeOfDayStats: toTimeOfDayStats(timeOfDayCounts),
    dayOfWeekStats: toDayOfWeekStats(dayOfWeekCounts),
    hasActiveFilters: getActiveFilterCount(filters) > 0,
  };
}

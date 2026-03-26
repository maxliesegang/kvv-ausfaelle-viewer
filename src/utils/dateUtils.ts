import type { DayOfWeek, DayOfWeekFilter, TimeOfDayCategory, TimeOfDayFilter } from "../types";

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface DatePreset {
  from: string;
  to: string;
}

export interface DatePresets {
  last7: DatePreset;
  last30: DatePreset;
  thisMonth: DatePreset;
}

export function getDatePresets(): DatePresets {
  const today = new Date();
  const last7Days = new Date(today);
  last7Days.setDate(today.getDate() - 7);
  const last30Days = new Date(today);
  last30Days.setDate(today.getDate() - 30);
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  return {
    last7: { from: formatDate(last7Days), to: formatDate(today) },
    last30: { from: formatDate(last30Days), to: formatDate(today) },
    thisMonth: { from: formatDate(thisMonthStart), to: formatDate(today) },
  };
}

// ─── Tageszeit ───────────────────────────────────────────────────────────────

export const TIME_OF_DAY_OPTIONS: ReadonlyArray<{
  value: TimeOfDayFilter;
  label: string;
}> = [
  { value: "all", label: "Alle Zeiten" },
  { value: "morning", label: "Morgens (05–09)" },
  { value: "late-morning", label: "Vormittags (09–12)" },
  { value: "afternoon", label: "Nachmittags (12–17)" },
  { value: "evening", label: "Abends (17–20)" },
  { value: "night", label: "Nachts (20–05)" },
];

const TIME_OF_DAY_FILTER_SET = new Set<TimeOfDayFilter>(
  TIME_OF_DAY_OPTIONS.map((option) => option.value)
);

export const TIME_OF_DAY_CHART_ORDER: ReadonlyArray<TimeOfDayCategory> = [
  "morning",
  "late-morning",
  "afternoon",
  "evening",
  "night",
  "unknown",
];

export const TIME_OF_DAY_LABELS: Record<TimeOfDayCategory, string> = {
  morning: "Morgens",
  "late-morning": "Vormittags",
  afternoon: "Nachmittags",
  evening: "Abends",
  night: "Nachts",
  unknown: "Unbekannt",
};

export function isTimeOfDayFilter(value: string): value is TimeOfDayFilter {
  return TIME_OF_DAY_FILTER_SET.has(value as TimeOfDayFilter);
}

export function getTimeOfDayCategory(time?: string): TimeOfDayCategory {
  if (!time) return "unknown";
  const [hourPart] = time.split(":");
  const hour = Number.parseInt(hourPart, 10);
  if (Number.isNaN(hour)) return "unknown";

  if (hour >= 5 && hour < 9) return "morning"; // 05:00-08:59
  if (hour >= 9 && hour < 12) return "late-morning"; // 09:00-11:59
  if (hour >= 12 && hour < 17) return "afternoon"; // 12:00-16:59
  if (hour >= 17 && hour < 20) return "evening"; // 17:00-19:59
  if (hour >= 20 || hour < 5) return "night"; // 20:00-04:59
  return "unknown";
}

// ─── Wochentag ───────────────────────────────────────────────────────────────

// Index matches Date.getDay() — Sonntag = 0
const DAY_OF_WEEK_BY_INDEX: DayOfWeek[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

/** Parses a YYYY-MM-DD date string and returns the local day of week. */
export function getDayOfWeek(date: string): DayOfWeek {
  const [year, month, day] = date.split("-").map(Number);
  return DAY_OF_WEEK_BY_INDEX[new Date(year, month - 1, day).getDay()];
}

const WEEKDAY_SET = new Set<DayOfWeek>(["monday", "tuesday", "wednesday", "thursday", "friday"]);
const WEEKEND_SET = new Set<DayOfWeek>(["saturday", "sunday"]);

export function matchesDayOfWeekFilter(day: DayOfWeek, filter: DayOfWeekFilter): boolean {
  if (filter === "all") return true;
  if (filter === "weekday") return WEEKDAY_SET.has(day);
  if (filter === "weekend") return WEEKEND_SET.has(day);
  return day === filter;
}

export const DAY_OF_WEEK_CHART_ORDER: ReadonlyArray<DayOfWeek> = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  monday: "Mo",
  tuesday: "Di",
  wednesday: "Mi",
  thursday: "Do",
  friday: "Fr",
  saturday: "Sa",
  sunday: "So",
};

export const DAY_OF_WEEK_OPTIONS: ReadonlyArray<{
  value: DayOfWeekFilter;
  label: string;
}> = [
  { value: "all", label: "Alle Tage" },
  { value: "weekday", label: "Werktage (Mo–Fr)" },
  { value: "weekend", label: "Wochenende (Sa–So)" },
  { value: "monday", label: "Montag" },
  { value: "tuesday", label: "Dienstag" },
  { value: "wednesday", label: "Mittwoch" },
  { value: "thursday", label: "Donnerstag" },
  { value: "friday", label: "Freitag" },
  { value: "saturday", label: "Samstag" },
  { value: "sunday", label: "Sonntag" },
];

const DAY_OF_WEEK_FILTER_SET = new Set<DayOfWeekFilter>(
  DAY_OF_WEEK_OPTIONS.map((o) => o.value)
);

export function isDayOfWeekFilter(value: string): value is DayOfWeekFilter {
  return DAY_OF_WEEK_FILTER_SET.has(value as DayOfWeekFilter);
}

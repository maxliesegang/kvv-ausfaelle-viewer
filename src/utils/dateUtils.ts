import type { TimeOfDayCategory, TimeOfDayFilter } from "../types";

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

export const TIME_OF_DAY_OPTIONS: ReadonlyArray<{
  value: TimeOfDayFilter;
  label: string;
}> = [
  { value: "all", label: "All times" },
  { value: "morning", label: "Morning (05–09)" },
  { value: "late-morning", label: "Late morning (09–12)" },
  { value: "afternoon", label: "Afternoon (12–17)" },
  { value: "evening", label: "Evening (17–20)" },
  { value: "night", label: "Night (20–05)" },
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
  morning: "Morning",
  "late-morning": "Late morning",
  afternoon: "Afternoon",
  evening: "Evening",
  night: "Night",
  unknown: "Unknown",
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

import type { Cancellation } from "../types";
import { getTimeOfDayCategory } from "./dateUtils";

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

export function fileToLabel(file: string): string {
  // e.g. "S1-S11.json" -> "S1–S11"; "S5.json" -> "S5"
  return file.replace(".json", "").replace("-", "–");
}

export function groupByDate(data: Cancellation[]): DailyStats[] {
  const map = new Map<string, number>();
  for (const item of data) {
    map.set(item.date, (map.get(item.date) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function groupByLine(data: Cancellation[]): LineStats[] {
  const map = new Map<string, number>();
  for (const item of data) {
    map.set(item.line, (map.get(item.line) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([line, count]) => ({ line, count }))
    .sort((a, b) => b.count - a.count); // Sort by count descending
}

export function groupByTimeOfDay(data: Cancellation[]): TimeOfDayStats[] {
  const map = new Map<string, number>();
  const order = ["morning", "late-morning", "afternoon", "evening", "night", "unknown"];

  for (const item of data) {
    const category = getTimeOfDayCategory(item.fromTime);
    map.set(category, (map.get(category) ?? 0) + 1);
  }

  return order
    .map((category) => ({
      period: category
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      count: map.get(category) ?? 0,
    }))
    .filter((item) => item.count > 0);
}

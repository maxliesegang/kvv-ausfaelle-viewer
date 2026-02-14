export interface RootIndex {
  years: string[];
}

export interface YearIndex {
  files: string[];
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

export type TimeOfDayCategory =
  | "morning"
  | "late-morning"
  | "afternoon"
  | "evening"
  | "night"
  | "unknown";

export type TimeOfDayFilter = TimeOfDayCategory | "all";

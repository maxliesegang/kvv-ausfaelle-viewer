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

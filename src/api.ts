import type { RootIndex, YearIndex, Cancellation } from "./types";

const DATA_BASE_URL =
  "https://maxliesegang.github.io/kvv-ausfaelle-scraper";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${DATA_BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function fetchRootIndex(): Promise<RootIndex> {
  return get<RootIndex>("/index.json");
}

export async function fetchYearIndex(year: string): Promise<YearIndex> {
  return get<YearIndex>(`/${year}/index.json`);
}

export async function fetchLineData(
  year: string,
  file: string
): Promise<Cancellation[]> {
  return get<Cancellation[]>(`/${year}/${file}`);
}
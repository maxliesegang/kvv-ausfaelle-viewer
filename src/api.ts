import type { RootIndex, YearIndex, Cancellation } from "./types";

const DATA_BASE_URL = (
  import.meta.env.VITE_DATA_BASE_URL ??
  "https://maxliesegang.github.io/kvv-ausfaelle-scraper"
).replace(/\/$/, "");

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${DATA_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
    },
    signal,
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function fetchRootIndex(signal?: AbortSignal): Promise<RootIndex> {
  return get<RootIndex>("/index.json", signal);
}

export async function fetchYearIndex(
  year: string,
  signal?: AbortSignal
): Promise<YearIndex> {
  return get<YearIndex>(`/${year}/index.json`, signal);
}

export async function fetchLineData(
  year: string,
  file: string,
  signal?: AbortSignal
): Promise<Cancellation[]> {
  return get<Cancellation[]>(`/${year}/${file}`, signal);
}

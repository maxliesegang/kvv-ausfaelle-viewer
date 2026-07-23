import type { RootIndex, YearIndex, Cancellation } from "./types";
import { parseRootIndex } from "./utils/rootIndex";

const DATA_BASE_URL = (
  import.meta.env.VITE_DATA_BASE_URL ??
  "https://maxliesegang.github.io/kvv-ausfaelle-scraper"
).replace(/\/$/, "");

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
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
  const raw = await fetchJson<unknown>("/index.json", signal);
  return parseRootIndex(raw);
}

export async function fetchYearIndex(
  year: string,
  signal?: AbortSignal
): Promise<YearIndex> {
  return fetchJson<YearIndex>(`/${year}/index.json`, signal);
}

export async function fetchLineData(
  year: string,
  file: string,
  signal?: AbortSignal
): Promise<Cancellation[]> {
  return fetchJson<Cancellation[]>(`/${year}/${file}`, signal);
}

/** Fetches the archived KVV notice text for a cancellation. The scraper stores
 * one plain-text file per notice at `<year>/articles/<noticeId>.txt` (see the
 * scraper's `docs/AGENTS.md` output contract). Resolves to `null` when no text
 * has been archived yet (HTTP 404) — a normal state, distinct from a real fetch
 * failure, which throws. */
export async function fetchNoticeText(
  year: string,
  noticeId: string,
  signal?: AbortSignal
): Promise<string | null> {
  const res = await fetch(
    `${DATA_BASE_URL}/${year}/articles/${encodeURIComponent(noticeId)}.txt`,
    { headers: { Accept: "text/plain" }, signal }
  );
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch notice ${noticeId}: ${res.status}`);
  }
  return res.text();
}

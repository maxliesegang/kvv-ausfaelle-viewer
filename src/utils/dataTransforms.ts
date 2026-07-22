export function lineFileToLabel(file: string): string {
  // e.g. "S1-S11.json" -> "S1–S11"; "S5.json" -> "S5"
  return file.replace(/\.json$/i, "").replace(/-/g, "–");
}

/** KVV verkehrsmeldungen URLs carry the notice id in the
 * `tx_ixkvvticker_list[detailID]` query param; it doubles as the filename of
 * the archived notice text. Returns null when the URL has no such id. */
export function extractNoticeId(sourceUrl: string): string | null {
  try {
    return new URL(sourceUrl).searchParams.get("tx_ixkvvticker_list[detailID]");
  } catch {
    return null;
  }
}

/** Archived notice files start with a `Quelle:`/`Stand:` metadata block and a
 * `====` divider before the body; strip it so the dialog shows just the notice. */
export function cleanNoticeText(raw: string): string {
  const divider = raw.match(/^={5,}\s*$/m);
  const body = divider?.index !== undefined ? raw.slice(divider.index + divider[0].length) : raw;
  return body.trim();
}

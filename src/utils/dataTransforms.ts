export function fileToLabel(file: string): string {
  // e.g. "S1-S11.json" -> "S1–S11"; "S5.json" -> "S5"
  return file.replace(/\.json$/i, "").replace(/-/g, "–");
}

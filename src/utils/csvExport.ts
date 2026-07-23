import type { Cancellation } from "../types";
import { resolveRawCauseLabel, type CauseCatalog } from "./causeUtils";

const CSV_HEADERS = [
  "Datum",
  "Linie",
  "Zug",
  "Abfahrt Haltestelle",
  "Abfahrt Zeit",
  "Ankunft Haltestelle",
  "Ankunft Zeit",
  "Ursache",
  "Quelle",
];

function toCsvRow(cancellation: Cancellation, catalog: CauseCatalog): string[] {
  return [
    cancellation.date,
    cancellation.line,
    cancellation.trainNumber,
    cancellation.fromStop,
    cancellation.fromTime ?? "",
    cancellation.toStop,
    cancellation.toTime ?? "",
    resolveRawCauseLabel(catalog, cancellation.cause),
    cancellation.sourceUrl,
  ];
}

function escapeCsvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function buildCsv(data: Cancellation[], catalog: CauseCatalog): string {
  const rows = [CSV_HEADERS, ...data.map((row) => toCsvRow(row, catalog))];
  // UTF-8 BOM ensures Excel opens the file with correct encoding
  return "\uFEFF" + rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}

export function exportCancellationsCsv(
  data: Cancellation[],
  filename: string,
  catalog: CauseCatalog
): void {
  const csv = buildCsv(data, catalog);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

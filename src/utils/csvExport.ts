import type { Cancellation } from "../types";
import { CAUSE_LABELS, normalizeCause } from "./causeUtils";

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

function toCsvRow(cancellation: Cancellation): string[] {
  return [
    cancellation.date,
    cancellation.line,
    cancellation.trainNumber,
    cancellation.fromStop,
    cancellation.fromTime ?? "",
    cancellation.toStop,
    cancellation.toTime ?? "",
    CAUSE_LABELS[normalizeCause(cancellation.cause)],
    cancellation.sourceUrl,
  ];
}

function escapeCsvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function buildCsv(data: Cancellation[]): string {
  const rows = [CSV_HEADERS, ...data.map(toCsvRow)];
  // UTF-8 BOM ensures Excel opens the file with correct encoding
  return "\uFEFF" + rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}

export function exportCancellationsCsv(data: Cancellation[], filename: string): void {
  const csv = buildCsv(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

import type { Cancellation } from "../types";
import { resolveRawCauseLabel } from "./causeUtils";
import type { Catalogs } from "./catalogs";
import {
  getVerificationGroupLabel,
  resolveVerificationGroup,
  resolveVerificationLabel,
  resolveVerificationStatus,
} from "./verificationUtils";

const CSV_HEADERS = [
  "Datum",
  "Linie",
  "Zug",
  "Abfahrt Haltestelle",
  "Abfahrt Zeit",
  "Ankunft Haltestelle",
  "Ankunft Zeit",
  "Ursache",
  "Prüfung",
  "Prüfergebnis",
  "Quelle",
];

function toCsvRow(cancellation: Cancellation, catalogs: Catalogs): string[] {
  // The export carries both vocabularies: the grouped verdict the UI shows, and
  // the precise published status behind it.
  const status = resolveVerificationStatus(cancellation.verification);
  return [
    cancellation.date,
    cancellation.line,
    cancellation.trainNumber,
    cancellation.fromStop,
    cancellation.fromTime ?? "",
    cancellation.toStop,
    cancellation.toTime ?? "",
    resolveRawCauseLabel(catalogs.causes, cancellation.cause),
    getVerificationGroupLabel(resolveVerificationGroup(status)),
    resolveVerificationLabel(catalogs.verification, status),
    cancellation.sourceUrl,
  ];
}

function escapeCsvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function buildCsv(data: Cancellation[], catalogs: Catalogs): string {
  const rows = [CSV_HEADERS, ...data.map((row) => toCsvRow(row, catalogs))];
  // UTF-8 BOM ensures Excel opens the file with correct encoding
  return "\uFEFF" + rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}

export function exportCancellationsCsv(
  data: Cancellation[],
  filename: string,
  catalogs: Catalogs
): void {
  const csv = buildCsv(data, catalogs);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

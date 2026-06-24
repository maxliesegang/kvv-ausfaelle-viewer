import { useMemo } from "react";
import {
  KernAccordion,
  KernAlert,
  KernButton,
  KernLink,
  KernTable,
  type KernTableColumn,
  type KernTableRow,
  type KernTableTransformedCellValue,
} from "@kern-ux-annex/kern-react-kit";
import type { Cancellation } from "../types";
import { CAUSE_LABELS, normalizeCause } from "../utils/causeUtils";
import { exportCancellationsCsv } from "../utils/csvExport";

interface CancellationsTableProps {
  data: Cancellation[];
  loading: boolean;
  hasActiveFilters: boolean;
  selectedYear: string | null;
}

/** KernTable cell values must be primitives; rich cells are produced via a
 * column `valueFormatter`. Stop + time are packed with this separator and
 * unpacked back into a two-line cell in {@link renderStop}. */
const STOP_TIME_SEP = "␟";

function renderStop(value: KernTableTransformedCellValue) {
  const [stop, time] = String(value).split(STOP_TIME_SEP);
  return (
    <span className="cell-stack">
      <span>{stop}</span>
      {time && <span className="cell-time">{time}</span>}
    </span>
  );
}

const COLUMNS: KernTableColumn[] = [
  {
    id: "date",
    label: "Datum",
    valueFormatter: (value) => <span className="cell-date">{String(value)}</span>,
  },
  {
    id: "line",
    label: "Linie",
    valueFormatter: (value) => <span className="cell-line">{String(value)}</span>,
  },
  { id: "trainNumber", label: "Zug" },
  { id: "from", label: "Von", valueFormatter: renderStop },
  { id: "to", label: "Nach", valueFormatter: renderStop },
  { id: "cause", label: "Ursache" },
  {
    id: "source",
    label: "Quelle",
    valueFormatter: (url) => (
      <KernLink
        href={String(url)}
        target="_blank"
        rel="noreferrer"
        label="KVV"
        icon="open-in-new"
        small
      />
    ),
  },
];

function buildFilename(selectedYear: string | null, hasActiveFilters: boolean): string {
  const year = selectedYear ? `-${selectedYear}` : "";
  const suffix = hasActiveFilters ? "-gefiltert" : "";
  return `kvv-ausfaelle${year}${suffix}.csv`;
}

function packStop(stop: string, time: string | undefined): string {
  return time ? `${stop}${STOP_TIME_SEP}${time}` : stop;
}

export function CancellationsTable({
  data,
  loading,
  hasActiveFilters,
  selectedYear,
}: CancellationsTableProps) {
  const handleExport = () => {
    exportCancellationsCsv(data, buildFilename(selectedYear, hasActiveFilters));
  };

  const rows: KernTableRow[] = useMemo(
    () =>
      data.map((item) => ({
        date: item.date,
        line: item.line,
        trainNumber: item.trainNumber,
        from: packStop(item.fromStop, item.fromTime),
        to: packStop(item.toStop, item.toTime),
        cause: CAUSE_LABELS[normalizeCause(item.cause)],
        source: item.sourceUrl,
      })),
    [data]
  );

  const count = data.length.toLocaleString("de-DE");
  const title = loading
    ? "Ausfälle im Detail"
    : `Ausfälle im Detail (${count}${hasActiveFilters ? " · gefiltert" : ""})`;

  const body = (
    <div className="table-body">
      <div className="table-toolbar">
        <KernButton
          label="CSV exportieren"
          variant="secondary"
          icon="download"
          iconPosition="left"
          onClick={handleExport}
          disabled={loading || data.length === 0}
          title={
            data.length === 0
              ? "Keine Daten zum Exportieren"
              : `${count} Zeilen als CSV exportieren`
          }
        />
      </div>
      {data.length === 0 && !loading ? (
        <KernAlert title="Keine Einträge" variant="info">
          Für die aktuellen Filter wurden keine Ausfälle gefunden.
        </KernAlert>
      ) : (
        <KernTable columns={COLUMNS} rows={rows} striped responsive small />
      )}
    </div>
  );

  return <KernAccordion variant="single" items={[{ id: "detail-table", title, body }]} />;
}

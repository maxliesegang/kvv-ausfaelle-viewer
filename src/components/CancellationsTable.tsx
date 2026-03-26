import type { Cancellation } from "../types";
import { exportCancellationsCsv } from "../utils/csvExport";

interface CancellationsTableProps {
  data: Cancellation[];
  loading: boolean;
  selectedLinesCount: number;
  hasActiveFilters: boolean;
  selectedYear: string | null;
}

function buildFilename(selectedYear: string | null, hasActiveFilters: boolean): string {
  const year = selectedYear ? `-${selectedYear}` : "";
  const suffix = hasActiveFilters ? "-gefiltert" : "";
  return `kvv-ausfaelle${year}${suffix}.csv`;
}

export function CancellationsTable({
  data,
  loading,
  selectedLinesCount,
  hasActiveFilters,
  selectedYear,
}: CancellationsTableProps) {
  const handleExport = () => {
    exportCancellationsCsv(data, buildFilename(selectedYear, hasActiveFilters));
  };

  return (
    <section className="table-section">
      <div className="table-toolbar">
        <div className="table-toolbar-info">
          {!loading && (
            <>
              <span className="table-count">
                {data.length.toLocaleString("de-DE")}
              </span>
              <span className="table-meta">
                Ausfall{data.length !== 1 ? "fälle" : ""} von{" "}
                {selectedLinesCount} Linie{selectedLinesCount !== 1 ? "n" : ""}
                {hasActiveFilters && " · gefiltert"}
              </span>
            </>
          )}
        </div>
        <button
          type="button"
          className="export-btn"
          onClick={handleExport}
          disabled={loading || data.length === 0}
          title={
            data.length === 0
              ? "Keine Daten zum Exportieren"
              : `${data.length.toLocaleString("de-DE")} Zeilen als CSV exportieren`
          }
        >
          CSV exportieren
        </button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Datum</th>
              <th>Linie</th>
              <th>Zug</th>
              <th>Von</th>
              <th>Nach</th>
              <th>Quelle</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={getCancellationRowKey(item)}>
                <td>{item.date}</td>
                <td>{item.line}</td>
                <td>{item.trainNumber}</td>
                <td>
                  <div>{item.fromStop}</div>
                  <div className="time">{item.fromTime}</div>
                </td>
                <td>
                  <div>{item.toStop}</div>
                  <div className="time">{item.toTime}</div>
                </td>
                <td>
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                    KVV
                  </a>
                </td>
              </tr>
            ))}
            {data.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="empty">
                  Keine Einträge für die aktuellen Filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function getCancellationRowKey(item: Cancellation): string {
  return [
    item.date,
    item.line,
    item.trainNumber,
    item.fromStop,
    item.toStop,
    item.sourceUrl,
  ].join("|");
}

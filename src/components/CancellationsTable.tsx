import type { Cancellation } from "../types";

interface CancellationsTableProps {
  data: Cancellation[];
  loading: boolean;
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

export function CancellationsTable({ data, loading }: CancellationsTableProps) {
  return (
    <section className="table-section">
      <h2>Details</h2>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Line</th>
              <th>Train</th>
              <th>From</th>
              <th>To</th>
              <th>Source</th>
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
                    KVV detail
                  </a>
                </td>
              </tr>
            ))}
            {data.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="empty">
                  No data for current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

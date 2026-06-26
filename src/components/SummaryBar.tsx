import type { DailyStats, LineStats } from "../types";
import { formatShortDate } from "../utils/dateUtils";

interface SummaryBarProps {
  total: number;
  lineStats: LineStats[];
  dailyStats: DailyStats[];
}

function maxBy<T>(items: T[], value: (item: T) => number): T | undefined {
  if (items.length === 0) return undefined;
  return items.reduce((best, item) => (value(item) > value(best) ? item : best));
}

/**
 * Compact result readout that trails on the right of the control row: the
 * emphasized total over a muted "·"-joined line of supporting facts. Stacked
 * into two short lines so it stays narrow (saving horizontal space) while
 * fitting within the row's existing height.
 */
export function SummaryBar({ total, lineStats, dailyStats }: SummaryBarProps) {
  const peakDay = maxBy(dailyStats, (d) => d.count);
  const topLine = maxBy(lineStats, (l) => l.count);

  const meta = [
    `${lineStats.length} Linien`,
    topLine ? topLine.line : null,
    peakDay ? formatShortDate(peakDay.date) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="summary" aria-label="Ergebnis der Auswahl">
      <span className="summary__headline">
        <span className="summary__value">{total.toLocaleString("de-DE")}</span>
        <span className="summary__unit">{total === 1 ? "Ausfall" : "Ausfälle"}</span>
      </span>
      {total > 0 && (
        <span
          className="summary__meta"
          title="Linien · stärkste Linie · Spitzentag"
        >
          {meta}
        </span>
      )}
    </div>
  );
}

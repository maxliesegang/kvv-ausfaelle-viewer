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
 * The result readout: a legible strip of stat tiles at the top of the canvas —
 * the answer for a casual visitor. The total leads (large, brand-colored),
 * followed by supporting facts (affected lines, strongest line, peak day), each
 * a value over a muted label. Wraps on narrow viewports.
 */
export function SummaryBar({ total, lineStats, dailyStats }: SummaryBarProps) {
  const peakDay = maxBy(dailyStats, (d) => d.count);
  const topLine = maxBy(lineStats, (l) => l.count);

  return (
    <div className="summary" aria-label="Ergebnis der Auswahl">
      <div className="summary__stat summary__stat--primary">
        <span className="summary__value">{total.toLocaleString("de-DE")}</span>
        <span className="summary__label">{total === 1 ? "Ausfall" : "Ausfälle"}</span>
      </div>

      <div className="summary__stat">
        <span className="summary__value">{lineStats.length}</span>
        <span className="summary__label">Betroffene Linien</span>
      </div>

      {topLine && (
        <div className="summary__stat">
          <span className="summary__value">{topLine.line}</span>
          <span className="summary__label">
            Stärkste Linie · {topLine.count.toLocaleString("de-DE")}
          </span>
        </div>
      )}

      {peakDay && (
        <div className="summary__stat">
          <span className="summary__value">{formatShortDate(peakDay.date)}</span>
          <span className="summary__label">
            Spitzentag · {peakDay.count.toLocaleString("de-DE")}
          </span>
        </div>
      )}
    </div>
  );
}

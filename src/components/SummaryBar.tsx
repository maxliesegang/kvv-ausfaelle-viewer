import { KernText } from "@kern-ux-annex/kern-react-kit";
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
 * Compact live result readout shown inline on the right of the sticky toolbar:
 * the emphasized total for the current selection plus a few muted supporting
 * stats. Kept on the toolbar line to save vertical space.
 */
export function SummaryBar({ total, lineStats, dailyStats }: SummaryBarProps) {
  const peakDay = maxBy(dailyStats, (d) => d.count);
  const topLine = maxBy(lineStats, (l) => l.count);

  const stats = [
    `${lineStats.length} Linie${lineStats.length === 1 ? "" : "n"}`,
    topLine ? `Stärkste Linie ${topLine.line}` : null,
    peakDay ? `Stärkster Tag ${formatShortDate(peakDay.date)}` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="result" aria-label="Ergebnis der Auswahl">
      <span className="result__headline">
        <span className="result__value">{total.toLocaleString("de-DE")}</span>
        <KernText type="body" muted component="span" className="result__unit">
          {total === 1 ? "Ausfall" : "Ausfälle"}
        </KernText>
      </span>
      {total > 0 && (
        <KernText type="body" size="small" muted component="span" className="result__stats">
          {stats.join(" · ")}
        </KernText>
      )}
    </div>
  );
}

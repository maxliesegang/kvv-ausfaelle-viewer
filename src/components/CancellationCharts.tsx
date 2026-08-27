import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DataKey } from "recharts/types/util/types";
import type {
  CauseStats,
  DailyStats,
  DayOfWeekStats,
  HourStats,
  LineStats,
  StopStats,
  VerificationStats,
} from "../types";
import type { Theme } from "../hooks/useTheme";
import { useChartColors } from "../hooks/useChartColors";
import { formatShortDate } from "../utils/dateUtils";
import { ChartCard } from "./ChartCard";

interface CancellationChartsProps {
  dailyStats: DailyStats[];
  lineStats: LineStats[];
  stopStats: StopStats[];
  hourStats: HourStats[];
  dayOfWeekStats: DayOfWeekStats[];
  causeStats: CauseStats[];
  verificationStats: VerificationStats[];
  /** Provenance of the realtime checks, e.g. `bahn.expert`; null when unknown.
   * Only attribution — the "Nach Prüfung" card is switched by whether
   * `verificationStats` has anything to show. */
  verificationSource: string | null;
  theme: Theme;
}

const AXIS_TICK = { fontSize: 11 };
const LEGEND_STYLE = { fontSize: 12 };

/** Longest category label the horizontal charts render before eliding. Stop
 * names in particular ("Karlsruhe Albtalbahnhof") would otherwise either wrap
 * out of the reserved axis width or push the plot area to nothing. */
const MAX_CATEGORY_LABEL = 22;

function truncateLabel(value: unknown): string {
  const text = String(value ?? "");
  return text.length > MAX_CATEGORY_LABEL
    ? `${text.slice(0, MAX_CATEGORY_LABEL - 1)}…`
    : text;
}

interface BreakdownChartProps<T extends { count: number }> {
  title: string;
  description: string;
  data: T[];
  /** Field holding the category label (the non-value axis). */
  categoryKey: DataKey<T>;
  color: string;
  /** Render as horizontal bars so longer German category labels fit. */
  horizontal?: boolean;
  /** Width reserved for the category axis labels when `horizontal`. */
  categoryWidth?: number;
  /** Recharts tick interval on the category axis: 0 labels every category
   * (the default, right for a handful of them), 1 every other one. */
  categoryInterval?: number;
  /** Elide over-long category labels (stop names). */
  truncateCategories?: boolean;
}

/** A single breakdown bar chart in the responsive grid. Horizontal and vertical
 * layouts share everything but axis orientation, bar corner radii, and which
 * grid lines show — so they live in one parameterized component. */
function BreakdownChart<T extends { count: number }>({
  title,
  description,
  data,
  categoryKey,
  color,
  horizontal = false,
  categoryWidth = 48,
  categoryInterval = 0,
  truncateCategories = false,
}: BreakdownChartProps<T>) {
  const chartHeight = horizontal ? Math.max(260, data.length * 24) : 260;
  const tickFormatter = truncateCategories ? truncateLabel : undefined;
  const valueAxis = horizontal ? (
    <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
  ) : (
    <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
  );
  const categoryAxis = horizontal ? (
    <YAxis dataKey={categoryKey} type="category" width={categoryWidth} interval={categoryInterval} tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={tickFormatter} />
  ) : (
    <XAxis dataKey={categoryKey} interval={categoryInterval} tick={AXIS_TICK} tickLine={false} tickFormatter={tickFormatter} />
  );

  return (
    <ChartCard title={title} description={description}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={data}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={horizontal ? { top: 4, right: 12, bottom: 0, left: 0 } : { top: 4, right: 8, bottom: 0, left: -16 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={horizontal} horizontal={!horizontal} />
          {valueAxis}
          {categoryAxis}
          <Tooltip cursor={{ fillOpacity: 0.08 }} />
          <Bar dataKey="count" name="Ausfälle" fill={color} radius={horizontal ? [0, 3, 3, 0] : [3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export default function CancellationCharts({
  dailyStats,
  lineStats,
  stopStats,
  hourStats,
  dayOfWeekStats,
  causeStats,
  verificationStats,
  verificationSource,
  theme,
}: CancellationChartsProps) {
  const colors = useChartColors(theme);
  const hasData = dailyStats.length > 0;

  if (!hasData) {
    return (
      <ChartCard
        title="Auswertung"
        description="Wählen Sie ein Jahr und mindestens eine Linie, um Diagramme zu sehen."
      >
        <div className="chart-empty">Keine Daten für die aktuelle Auswahl.</div>
      </ChartCard>
    );
  }

  return (
    <section className="charts-section">
      <ChartCard
        title="Ausfälle pro Tag"
        description="Verlauf über die Zeit, mit dem gleitenden 7-Tage-Mittel — es glättet den starken Wochenrhythmus und zeigt den Trend"
      >
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={dailyStats} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatShortDate}
              tick={AXIS_TICK}
              tickLine={false}
              minTickGap={28}
            />
            <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              cursor={{ fillOpacity: 0.08 }}
              labelFormatter={(label) =>
                typeof label === "string" ? formatShortDate(label) : label
              }
            />
            <Legend wrapperStyle={LEGEND_STYLE} />
            <Bar dataKey="count" name="Ausfälle" fill={colors.daily} radius={[3, 3, 0, 0]} />
            {/* Null until the 7-day window is full, so the line starts a week in
                rather than being faked from a partial window. */}
            <Line
              type="monotone"
              dataKey="rolling"
              name="7-Tage-Mittel"
              stroke={colors.dailyTrend}
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="charts-row">
        <BreakdownChart
          title="Nach Linie"
          description="Am stärksten betroffen"
          data={lineStats}
          categoryKey="line"
          color={colors.line}
          horizontal
        />
        <BreakdownChart
          title="Nach Ursache"
          description="Grund des Ausfalls (Schätzung)"
          data={causeStats}
          categoryKey="cause"
          color={colors.cause}
          horizontal
          categoryWidth={108}
        />
        {hourStats.length > 0 && (
          <BreakdownChart
            title="Nach Abfahrtsstunde"
            description="Geplante Abfahrtszeit, Stunde für Stunde"
            data={hourStats}
            categoryKey="label"
            color={colors.hour}
            categoryInterval={1}
          />
        )}
        {stopStats.length > 0 && (
          <BreakdownChart
            title="Nach Starthaltestelle"
            description="Häufigste Abfahrtsorte ausgefallener Fahrten"
            data={stopStats}
            categoryKey="stop"
            color={colors.stop}
            horizontal
            categoryWidth={140}
            truncateCategories
          />
        )}
        <BreakdownChart
          title="Nach Wochentag"
          description="An welchen Tagen"
          data={dayOfWeekStats}
          categoryKey="day"
          color={colors.dayOfWeek}
        />
        {verificationStats.length > 0 && (
          <BreakdownChart
            title="Nach Prüfung"
            description={
              verificationSource
                ? `Abgleich mit Echtzeitdaten von ${verificationSource}`
                : "Abgleich mit Echtzeitdaten"
            }
            data={verificationStats}
            categoryKey="status"
            color={colors.verification}
            horizontal
            categoryWidth={124}
          />
        )}
      </div>
    </section>
  );
}

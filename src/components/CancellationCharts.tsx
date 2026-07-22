import {
  Bar,
  BarChart,
  CartesianGrid,
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
  LineStats,
  TimeOfDayStats,
} from "../types";
import type { Theme } from "../hooks/useTheme";
import { useChartColors } from "../hooks/useChartColors";
import { formatShortDate } from "../utils/dateUtils";
import { ChartCard } from "./ChartCard";

interface CancellationChartsProps {
  dailyStats: DailyStats[];
  lineStats: LineStats[];
  timeOfDayStats: TimeOfDayStats[];
  dayOfWeekStats: DayOfWeekStats[];
  causeStats: CauseStats[];
  theme: Theme;
}

const AXIS_TICK = { fontSize: 11 };

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
}: BreakdownChartProps<T>) {
  const chartHeight = horizontal ? Math.max(260, data.length * 24) : 260;
  const valueAxis = horizontal ? (
    <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
  ) : (
    <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
  );
  const categoryAxis = horizontal ? (
    <YAxis dataKey={categoryKey} type="category" width={categoryWidth} interval={0} tick={AXIS_TICK} tickLine={false} axisLine={false} />
  ) : (
    <XAxis dataKey={categoryKey} interval={0} tick={AXIS_TICK} tickLine={false} />
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
  timeOfDayStats,
  dayOfWeekStats,
  causeStats,
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
      <ChartCard title="Ausfälle pro Tag" description="Verlauf über die Zeit">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyStats} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
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
            <Bar dataKey="count" name="Ausfälle" fill={colors.daily} radius={[3, 3, 0, 0]} />
          </BarChart>
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
        <BreakdownChart
          title="Nach Tageszeit"
          description="Wann Züge ausfallen"
          data={timeOfDayStats}
          categoryKey="period"
          color={colors.timeOfDay}
          horizontal
          categoryWidth={84}
        />
        <BreakdownChart
          title="Nach Wochentag"
          description="An welchen Tagen"
          data={dayOfWeekStats}
          categoryKey="day"
          color={colors.dayOfWeek}
        />
      </div>
    </section>
  );
}

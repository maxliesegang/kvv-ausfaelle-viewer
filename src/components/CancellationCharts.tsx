import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyStats, DayOfWeekStats, LineStats, TimeOfDayStats } from "../types";
import { ChartCard } from "./ChartCard";

interface CancellationChartsProps {
  dailyStats: DailyStats[];
  lineStats: LineStats[];
  timeOfDayStats: TimeOfDayStats[];
  dayOfWeekStats: DayOfWeekStats[];
}

/** Formats "YYYY-MM-DD" as "5. Jan" for compact axis labels. */
function formatDateTick(dateStr: string): string {
  const [, monthStr, dayStr] = dateStr.split("-");
  const months = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  return `${parseInt(dayStr, 10)}. ${months[parseInt(monthStr, 10) - 1]}`;
}

export default function CancellationCharts({
  dailyStats,
  lineStats,
  timeOfDayStats,
  dayOfWeekStats,
}: CancellationChartsProps) {
  return (
    <section className="charts-section">
      {/* Zeitverlauf — profitiert am meisten von voller Breite */}
      <ChartCard
        title="Ausfälle pro Tag"
        description="Zeitlicher Verlauf der betriebsbedingten Fahrtausfälle"
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dailyStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatDateTick} />
            <YAxis />
            <Tooltip
              labelFormatter={(label) =>
                typeof label === "string" ? formatDateTick(label) : label
              }
            />
            <Bar dataKey="count" name="Ausfälle" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Analyse-Diagramme */}
      <div className="charts-row">
        <ChartCard title="Nach Linie" description="Betroffene Linien im Vergleich">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={lineStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="line" type="category" width={55} />
              <Tooltip />
              <Bar dataKey="count" name="Ausfälle" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Nach Tageszeit" description="Zu welcher Uhrzeit fallen Züge aus">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={timeOfDayStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" name="Ausfälle" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Nach Wochentag" description="An welchen Tagen fallen die meisten Züge aus">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dayOfWeekStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" name="Ausfälle" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
}

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyStats, LineStats, TimeOfDayStats } from "../types";
import { ChartCard } from "./ChartCard";

interface CancellationChartsProps {
  dailyStats: DailyStats[];
  lineStats: LineStats[];
  timeOfDayStats: TimeOfDayStats[];
}

export default function CancellationCharts({
  dailyStats,
  lineStats,
  timeOfDayStats,
}: CancellationChartsProps) {
  return (
    <section className="charts-grid">
      <ChartCard
        title="Cancellations per day"
        description="Timeline of cancellations"
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Cancellations by line"
        description="Which lines are most affected"
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={lineStats} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="line" type="category" width={60} />
            <Tooltip />
            <Bar dataKey="count" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Cancellations by time of day"
        description="When do cancellations occur"
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={timeOfDayStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </section>
  );
}

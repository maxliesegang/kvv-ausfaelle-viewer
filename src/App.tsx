import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useKVVData } from "./hooks/useKVVData";
import { groupByDate, groupByLine, groupByTimeOfDay } from "./utils/dataTransforms";
import { getTimeOfDayCategory } from "./utils/dateUtils";
import { Header } from "./components/Header";
import { YearSelector } from "./components/YearSelector";
import { LinesSelector } from "./components/LinesSelector";
import { FiltersSection } from "./components/FiltersSection";
import { ResultsSummary } from "./components/ResultsSummary";
import { ChartCard } from "./components/ChartCard";
import { CancellationsTable } from "./components/CancellationsTable";
import "./App.css";

function App() {
  const {
    loading,
    error,
    years,
    selectedYear,
    setSelectedYear,
    lineFiles,
    selectedFiles,
    setSelectedFiles,
    rawData,
  } = useKVVData();

  const [textFilter, setTextFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [timeOfDay, setTimeOfDay] = useState<string>("all");

  const hasActiveFilters = !!(textFilter || dateFrom || dateTo || timeOfDay !== "all");

  const filtered = useMemo(() => {
    return rawData.filter((item) => {
      if (dateFrom && item.date < dateFrom) return false;
      if (dateTo && item.date > dateTo) return false;

      if (textFilter.trim()) {
        const t = textFilter.toLowerCase();
        const haystack = [
          item.line,
          item.trainNumber,
          item.fromStop,
          item.toStop,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(t)) return false;
      }

      if (timeOfDay !== "all") {
        const category = getTimeOfDayCategory(item.fromTime);
        if (category !== timeOfDay) return false;
      }

      return true;
    });
  }, [rawData, textFilter, dateFrom, dateTo, timeOfDay]);

  const dailyStats = useMemo(() => groupByDate(filtered), [filtered]);
  const lineStats = useMemo(() => groupByLine(filtered), [filtered]);
  const timeOfDayStats = useMemo(() => groupByTimeOfDay(filtered), [filtered]);

  const handleClearFilters = () => {
    setTextFilter("");
    setDateFrom("");
    setDateTo("");
    setTimeOfDay("all");
  };

  return (
    <div className="app">
      <Header />

      <section className="controls">
        <div className="primary-controls">
          <YearSelector
            years={years}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
          <LinesSelector
            lineFiles={lineFiles}
            selectedFiles={selectedFiles}
            onSelectionChange={setSelectedFiles}
          />
        </div>

        <FiltersSection
          textFilter={textFilter}
          dateFrom={dateFrom}
          dateTo={dateTo}
          timeOfDay={timeOfDay}
          onTextFilterChange={setTextFilter}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onTimeOfDayChange={setTimeOfDay}
          onClearFilters={handleClearFilters}
        />
      </section>

      {error && <div className="error">Error: {error}</div>}
      {loading && <div className="loading">Loading…</div>}

      {!loading && !error && (
        <ResultsSummary
          count={filtered.length}
          selectedLinesCount={selectedFiles.length}
          hasActiveFilters={hasActiveFilters}
        />
      )}

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

      <CancellationsTable data={filtered} loading={loading} />

      <footer className="footer">
        Data from{" "}
        <a
          href="https://maxliesegang.github.io/kvv-ausfaelle-scraper/"
          target="_blank"
          rel="noreferrer"
        >
          kvv-ausfaelle-scraper
        </a>
        .
      </footer>
    </div>
  );
}

export default App;

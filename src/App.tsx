import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { ChartCard } from "./components/ChartCard";
import { CancellationsTable } from "./components/CancellationsTable";
import { FiltersSection } from "./components/FiltersSection";
import { Header } from "./components/Header";
import { LinesSelector } from "./components/LinesSelector";
import { ResultsSummary } from "./components/ResultsSummary";
import { YearSelector } from "./components/YearSelector";
import { useKVVData } from "./hooks/useKVVData";
import {
  buildCancellationsView,
  DEFAULT_CANCELLATION_FILTERS,
  indexCancellations,
  type CancellationFilters,
} from "./utils/filtering";
import "./App.css";

const CancellationCharts = lazy(() => import("./components/CancellationCharts"));

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

  const [filters, setFilters] = useState<CancellationFilters>({
    ...DEFAULT_CANCELLATION_FILTERS,
  });

  const indexedData = useMemo(() => indexCancellations(rawData), [rawData]);

  const cancellationsView = useMemo(
    () => buildCancellationsView(indexedData, filters),
    [filters, indexedData]
  );

  const handleTextFilterChange = useCallback((text: string) => {
    setFilters((currentFilters) => ({ ...currentFilters, text }));
  }, []);

  const handleDateFromChange = useCallback((dateFrom: string) => {
    setFilters((currentFilters) => ({ ...currentFilters, dateFrom }));
  }, []);

  const handleDateToChange = useCallback((dateTo: string) => {
    setFilters((currentFilters) => ({ ...currentFilters, dateTo }));
  }, []);

  const handleTimeOfDayChange = useCallback((timeOfDay: CancellationFilters["timeOfDay"]) => {
    setFilters((currentFilters) => ({ ...currentFilters, timeOfDay }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ ...DEFAULT_CANCELLATION_FILTERS });
  }, []);

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
          textFilter={filters.text}
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          timeOfDay={filters.timeOfDay}
          onTextFilterChange={handleTextFilterChange}
          onDateFromChange={handleDateFromChange}
          onDateToChange={handleDateToChange}
          onTimeOfDayChange={handleTimeOfDayChange}
          onClearFilters={handleClearFilters}
        />
      </section>

      {error && <div className="error">Error: {error}</div>}
      {loading && <div className="loading">Loading…</div>}

      {!loading && !error && (
        <ResultsSummary
          count={cancellationsView.filtered.length}
          selectedLinesCount={selectedFiles.length}
          hasActiveFilters={cancellationsView.hasActiveFilters}
        />
      )}

      {!error && (
        <Suspense
          fallback={
            <ChartCard title="Loading charts" description="Preparing visualizations">
              <div className="loading">Loading chart module…</div>
            </ChartCard>
          }
        >
          <CancellationCharts
            dailyStats={cancellationsView.dailyStats}
            lineStats={cancellationsView.lineStats}
            timeOfDayStats={cancellationsView.timeOfDayStats}
          />
        </Suspense>
      )}

      <CancellationsTable data={cancellationsView.filtered} loading={loading} />

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

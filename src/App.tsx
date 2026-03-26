import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { ChartCard } from "./components/ChartCard";
import { CancellationsTable } from "./components/CancellationsTable";
import { FiltersSection } from "./components/FiltersSection";
import { LinesSelector } from "./components/LinesSelector";
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

  const [filters, setFilters] = useState<CancellationFilters>(DEFAULT_CANCELLATION_FILTERS);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const indexedData = useMemo(() => indexCancellations(rawData), [rawData]);
  const cancellationsView = useMemo(
    () => buildCancellationsView(indexedData, filters),
    [filters, indexedData]
  );

  const handleFiltersChange = useCallback((patch: Partial<CancellationFilters>) => {
    setFilters((f) => ({ ...f, ...patch }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_CANCELLATION_FILTERS);
  }, []);

  return (
    <div className="app">
      <aside className={`sidebar${sidebarOpen ? " sidebar--open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="sidebar-brand-name">KVV Ausfälle</span>
            <span className="sidebar-brand-sub">Fahrtausfälle-Browser</span>
          </div>
          <button
            type="button"
            className="mobile-toggle"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((o) => !o)}
          >
            {sidebarOpen ? "Schließen" : "Auswahl & Filter"}
          </button>
        </div>

        <div className="sidebar-body">
          <div className="sidebar-section">
            <YearSelector
              years={years}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
          </div>

          <div className="sidebar-section">
            <LinesSelector
              lineFiles={lineFiles}
              selectedFiles={selectedFiles}
              onSelectionChange={setSelectedFiles}
            />
          </div>

          <div className="sidebar-section">
            <FiltersSection
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          <div className="sidebar-footer">
            Daten:{" "}
            <a
              href="https://maxliesegang.github.io/kvv-ausfaelle-scraper/"
              target="_blank"
              rel="noreferrer"
            >
              kvv-ausfaelle-scraper
            </a>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {error && <div className="error">Fehler: {error}</div>}
        {loading && <div className="loading">Wird geladen…</div>}

        {!error && (
          <Suspense
            fallback={
              <ChartCard title="Diagramme werden geladen…">
                <div className="loading">Wird vorbereitet…</div>
              </ChartCard>
            }
          >
            <CancellationCharts
              dailyStats={cancellationsView.dailyStats}
              lineStats={cancellationsView.lineStats}
              timeOfDayStats={cancellationsView.timeOfDayStats}
              dayOfWeekStats={cancellationsView.dayOfWeekStats}
            />
          </Suspense>
        )}

        <CancellationsTable
          data={cancellationsView.filtered}
          loading={loading}
          selectedLinesCount={selectedFiles.length}
          hasActiveFilters={cancellationsView.hasActiveFilters}
          selectedYear={selectedYear}
        />
      </main>
    </div>
  );
}

export default App;

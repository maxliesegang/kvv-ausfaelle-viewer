import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import {
  KernAlert,
  KernContainer,
  KernLink,
  KernLoader,
  KernText,
} from "@kern-ux-annex/kern-react-kit";
import { AppHeader } from "./components/AppHeader";
import { ChartCard } from "./components/ChartCard";
import { CancellationsTable } from "./components/CancellationsTable";
import { ControlBar } from "./components/ControlBar";
import { useKVVData } from "./hooks/useKVVData";
import { useTheme } from "./hooks/useTheme";
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

  const { theme, toggleTheme } = useTheme();
  const [filters, setFilters] = useState<CancellationFilters>(DEFAULT_CANCELLATION_FILTERS);

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
    <div className="page">
      <AppHeader theme={theme} onToggleTheme={toggleTheme} />

      <main className="page__main">
        <KernContainer>
          <div className="page__alert">
            <KernAlert title="Kein offizielles Angebot" variant="info">
              Diese Anwendung ist kein offizielles Angebot des KVV. Die Daten werden automatisiert
              ausgelesen und können unvollständig oder fehlerhaft sein.
            </KernAlert>
          </div>

          {error && (
            <div className="page__alert">
              <KernAlert title="Daten konnten nicht geladen werden" variant="danger">
                {error}
              </KernAlert>
            </div>
          )}

          <ControlBar
            years={years}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            lineFiles={lineFiles}
            selectedFiles={selectedFiles}
            onSelectionChange={setSelectedFiles}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            loading={loading}
            total={cancellationsView.filtered.length}
            lineStats={cancellationsView.lineStats}
            dailyStats={cancellationsView.dailyStats}
          />

          <div className="canvas">
            {loading ? (
              <div className="canvas__loading">
                <KernLoader />
              </div>
            ) : (
              <>
                {!error && (
                  <Suspense
                    fallback={
                      <ChartCard title="Diagramme werden geladen…">
                        <KernLoader />
                      </ChartCard>
                    }
                  >
                    <CancellationCharts
                      dailyStats={cancellationsView.dailyStats}
                      lineStats={cancellationsView.lineStats}
                      timeOfDayStats={cancellationsView.timeOfDayStats}
                      dayOfWeekStats={cancellationsView.dayOfWeekStats}
                      causeStats={cancellationsView.causeStats}
                      theme={theme}
                    />
                  </Suspense>
                )}

                <CancellationsTable
                  data={cancellationsView.filtered}
                  loading={loading}
                  hasActiveFilters={cancellationsView.hasActiveFilters}
                  selectedYear={selectedYear}
                />
              </>
            )}
          </div>
        </KernContainer>
      </main>

      <footer className="page__footer">
        <KernContainer>
          <div className="page__footer-inner">
            <KernText type="body" size="small" muted component="span">
              Datenquelle:{" "}
            </KernText>
            <KernLink
              href="https://maxliesegang.github.io/kvv-ausfaelle-scraper/"
              target="_blank"
              rel="noreferrer"
              label="kvv-ausfaelle-scraper"
              icon="open-in-new"
              small
            />
          </div>
        </KernContainer>
      </footer>
    </div>
  );
}

export default App;

interface ResultsSummaryProps {
  count: number;
  selectedLinesCount: number;
  hasActiveFilters: boolean;
}

export function ResultsSummary({ count, selectedLinesCount, hasActiveFilters }: ResultsSummaryProps) {
  return (
    <div className="results-summary">
      <h2>{count.toLocaleString("de-DE")} cancellations</h2>
      <p>
        Showing data from {selectedLinesCount} line{selectedLinesCount !== 1 ? "s" : ""}
        {hasActiveFilters && " with active filters"}
      </p>
    </div>
  );
}

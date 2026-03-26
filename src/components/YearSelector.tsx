interface YearSelectorProps {
  years: string[];
  selectedYear: string | null;
  onYearChange: (year: string | null) => void;
}

export function YearSelector({ years, selectedYear, onYearChange }: YearSelectorProps) {
  return (
    <div className="year-selector">
      <span className="control-label">Jahr</span>
      <select
        id="year-select"
        value={selectedYear ?? ""}
        onChange={(e) => onYearChange(e.target.value || null)}
      >
        <option value="">– Auswählen –</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}

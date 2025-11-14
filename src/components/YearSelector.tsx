interface YearSelectorProps {
  years: string[];
  selectedYear: string | null;
  onYearChange: (year: string | null) => void;
}

export function YearSelector({ years, selectedYear, onYearChange }: YearSelectorProps) {
  return (
    <div className="year-selector">
      <label>Year</label>
      <select
        value={selectedYear ?? ""}
        onChange={(e) => onYearChange(e.target.value || null)}
      >
        <option value="">– Select –</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}

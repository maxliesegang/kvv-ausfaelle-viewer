import { KernSelect } from "@kern-ux-annex/kern-react-kit";

interface YearSelectorProps {
  years: string[];
  selectedYear: string | null;
  onYearChange: (year: string | null) => void;
}

export function YearSelector({ years, selectedYear, onYearChange }: YearSelectorProps) {
  return (
    <KernSelect
      id="year-select"
      label="Jahr"
      required
      value={selectedYear ?? ""}
      onChange={(e) => onYearChange(e.target.value || null)}
    >
      <option value="">– Auswählen –</option>
      {years.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </KernSelect>
  );
}

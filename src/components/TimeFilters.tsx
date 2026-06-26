import { KernButton } from "@kern-ux-annex/kern-react-kit";
import { DAY_OF_WEEK_OPTIONS, TIME_OF_DAY_OPTIONS, getDatePresets } from "../utils/dateUtils";
import type { CancellationFilters } from "../utils/filtering";
import { FilterSelect } from "./FilterSelect";
import { YearSelector } from "./YearSelector";

interface TimeFiltersProps {
  years: string[];
  selectedYear: string | null;
  onYearChange: (year: string | null) => void;
  filters: CancellationFilters;
  onFiltersChange: (patch: Partial<CancellationFilters>) => void;
}

const DATE_PRESET_LABELS = { last7: "7 Tage", last30: "30 Tage", thisMonth: "Dieser Monat" } as const;

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

/** One labelled native date input (Von/Bis). Native `<input type="date">` is kept
 * over KERN's `KernInputDate` whose 3-field change contract doesn't fit the
 * ISO-string filter. */
function DateField({ label, value, onChange }: DateFieldProps) {
  return (
    <label className="kern-date-field">
      <span className="kern-date-field__label">{label}</span>
      <input
        type="date"
        className="kern-date-input"
        value={value}
        aria-label={`${label} Datum`}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

/** The "Zeit" expander panel: every time dimension in one place — the data-scope
 * year, the Von/Bis date range (with quick presets), the time-of-day bucket and
 * the weekday. Surfaced as a single toggle so the whole temporal scope is one
 * click away, separate from the always-visible search/cause filters. */
export function TimeFilters({
  years,
  selectedYear,
  onYearChange,
  filters,
  onFiltersChange,
}: TimeFiltersProps) {
  const presets = getDatePresets();

  const activeDatePreset = (Object.keys(presets) as Array<keyof typeof presets>).find(
    (key) => presets[key].from === filters.dateFrom && presets[key].to === filters.dateTo
  );

  const applyDatePreset = (key: keyof typeof presets) => {
    if (activeDatePreset === key) {
      onFiltersChange({ dateFrom: "", dateTo: "" });
    } else {
      onFiltersChange({ dateFrom: presets[key].from, dateTo: presets[key].to });
    }
  };

  return (
    <div className="time-filters">
      <div className="time-filters__row">
        <YearSelector years={years} selectedYear={selectedYear} onYearChange={onYearChange} />

        <FilterSelect
          id="time-of-day-filter"
          label="Tageszeit"
          value={filters.timeOfDay}
          options={TIME_OF_DAY_OPTIONS}
          onChange={(timeOfDay) => onFiltersChange({ timeOfDay })}
        />

        <FilterSelect
          id="day-of-week-filter"
          label="Wochentag"
          value={filters.dayOfWeek}
          options={DAY_OF_WEEK_OPTIONS}
          onChange={(dayOfWeek) => onFiltersChange({ dayOfWeek })}
        />
      </div>

      <div className="btn-row">
        {(Object.keys(DATE_PRESET_LABELS) as Array<keyof typeof DATE_PRESET_LABELS>).map((key) => (
          <KernButton
            key={key}
            label={DATE_PRESET_LABELS[key]}
            variant={activeDatePreset === key ? "primary" : "tertiary"}
            aria-pressed={activeDatePreset === key}
            onClick={() => applyDatePreset(key)}
          />
        ))}
      </div>

      <div className="date-range">
        <DateField
          label="Von"
          value={filters.dateFrom}
          onChange={(dateFrom) => onFiltersChange({ dateFrom })}
        />
        <DateField
          label="Bis"
          value={filters.dateTo}
          onChange={(dateTo) => onFiltersChange({ dateTo })}
        />
      </div>
    </div>
  );
}

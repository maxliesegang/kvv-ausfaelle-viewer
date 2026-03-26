import type { DayOfWeek, DayOfWeekFilter, TimeOfDayFilter } from "../types";
import {
  DAY_OF_WEEK_LABELS,
  DAY_OF_WEEK_OPTIONS,
  getDatePresets,
  TIME_OF_DAY_OPTIONS,
} from "../utils/dateUtils";
import {
  getActiveFilterCount,
  type CancellationFilters,
} from "../utils/filtering";

interface FiltersSectionProps {
  filters: CancellationFilters;
  onFiltersChange: (patch: Partial<CancellationFilters>) => void;
  onClearFilters: () => void;
}

const TIME_CHIP_LABELS: Partial<Record<TimeOfDayFilter, string>> & Record<"all", string> = {
  all: "Alle",
  morning: "05–09",
  "late-morning": "09–12",
  afternoon: "12–17",
  evening: "17–20",
  night: "20–05",
};

const DOW_GROUP_OPTIONS = DAY_OF_WEEK_OPTIONS.slice(0, 3);
const DOW_DAY_OPTIONS = DAY_OF_WEEK_OPTIONS.slice(3);

const DATE_PRESET_LABELS = { last7: "7 Tage", last30: "30 Tage", thisMonth: "Dieser Monat" } as const;

export function FiltersSection({
  filters,
  onFiltersChange,
  onClearFilters,
}: FiltersSectionProps) {
  const activeFilterCount = getActiveFilterCount(filters);
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

  const handleTimeClick = (value: TimeOfDayFilter) => {
    onFiltersChange({ timeOfDay: filters.timeOfDay === value ? "all" : value });
  };

  const handleDayClick = (value: DayOfWeekFilter) => {
    onFiltersChange({ dayOfWeek: filters.dayOfWeek === value ? "all" : value });
  };

  return (
    <div className="filters-section">
      <div className="filters-header">
        <span className="control-label">Filter</span>
        {activeFilterCount > 0 && (
          <span className="filter-badge">{activeFilterCount}</span>
        )}
      </div>

      <div className="filter-fields">
        <div className="filter-field">
          <label htmlFor="search-filter">Suche</label>
          <input
            id="search-filter"
            type="text"
            value={filters.text}
            onChange={(e) => onFiltersChange({ text: e.target.value })}
            placeholder="Linie, Zug oder Haltestelle…"
          />
        </div>

        <div className="filter-field">
          <div className="filter-field-header">
            <label>Zeitraum</label>
            {(filters.dateFrom || filters.dateTo) && (
              <button
                type="button"
                className="filter-clear-inline"
                onClick={() => onFiltersChange({ dateFrom: "", dateTo: "" })}
                aria-label="Zeitraum löschen"
                title="Zeitraum löschen"
              >
                ×
              </button>
            )}
          </div>
          <div className="date-presets">
            {(Object.keys(DATE_PRESET_LABELS) as Array<keyof typeof DATE_PRESET_LABELS>).map((key) => (
              <button
                key={key}
                type="button"
                className={`preset-btn${activeDatePreset === key ? " preset-btn--active" : ""}`}
                onClick={() => applyDatePreset(key)}
              >
                {DATE_PRESET_LABELS[key]}
              </button>
            ))}
          </div>
          <div className="date-inputs">
            <div className="date-input-row">
              <span>Von</span>
              <input
                type="date"
                value={filters.dateFrom}
                aria-label="Von Datum"
                onChange={(e) => onFiltersChange({ dateFrom: e.target.value })}
              />
            </div>
            <div className="date-input-row">
              <span>Bis</span>
              <input
                type="date"
                value={filters.dateTo}
                aria-label="Bis Datum"
                onChange={(e) => onFiltersChange({ dateTo: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="filter-field">
          <label>Tageszeit</label>
          <div className="filter-chips filter-chips--grid3">
            {TIME_OF_DAY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`filter-chip${filters.timeOfDay === opt.value ? " filter-chip--active" : ""}`}
                title={opt.label}
                onClick={() => handleTimeClick(opt.value)}
              >
                {TIME_CHIP_LABELS[opt.value] ?? opt.value}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-field">
          <label>Wochentag</label>
          <div className="filter-chips">
            {DOW_GROUP_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`filter-chip${filters.dayOfWeek === opt.value ? " filter-chip--active" : ""}`}
                onClick={() => handleDayClick(opt.value)}
              >
                {opt.value === "all" ? "Alle" : opt.value === "weekday" ? "Werktage" : "Wochenende"}
              </button>
            ))}
          </div>
          <div className="filter-chips filter-chips--days">
            {DOW_DAY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`filter-chip filter-chip--day${filters.dayOfWeek === opt.value ? " filter-chip--active" : ""}`}
                title={opt.label}
                onClick={() => handleDayClick(opt.value)}
              >
                {DAY_OF_WEEK_LABELS[opt.value as DayOfWeek]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button type="button" className="clear-filters-btn" onClick={onClearFilters}>
          Filter zurücksetzen
        </button>
      )}
    </div>
  );
}

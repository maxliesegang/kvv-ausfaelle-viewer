import { useState } from "react";
import type { TimeOfDayFilter } from "../types";
import {
  getDatePresets,
  isTimeOfDayFilter,
  TIME_OF_DAY_OPTIONS,
} from "../utils/dateUtils";
import {
  getActiveFilterCount,
  type CancellationFilters,
} from "../utils/filtering";

interface FiltersSectionProps {
  textFilter: string;
  dateFrom: string;
  dateTo: string;
  timeOfDay: TimeOfDayFilter;
  onTextFilterChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onTimeOfDayChange: (value: TimeOfDayFilter) => void;
  onClearFilters: () => void;
}

export function FiltersSection({
  textFilter,
  dateFrom,
  dateTo,
  timeOfDay,
  onTextFilterChange,
  onDateFromChange,
  onDateToChange,
  onTimeOfDayChange,
  onClearFilters,
}: FiltersSectionProps) {
  const [showFilters, setShowFilters] = useState(false);

  const filters: CancellationFilters = {
    text: textFilter,
    dateFrom,
    dateTo,
    timeOfDay,
  };
  const activeFilterCount = getActiveFilterCount(filters);
  const filtersActive = activeFilterCount > 0;

  const applyDatePreset = (presetKey: keyof ReturnType<typeof getDatePresets>) => {
    const preset = getDatePresets()[presetKey];
    onDateFromChange(preset.from);
    onDateToChange(preset.to);
  };

  return (
    <div className="filters-section">
      <button
        type="button"
        className="filters-toggle"
        aria-expanded={showFilters}
        aria-controls="filter-panel"
        onClick={() => setShowFilters((current) => !current)}
      >
        <span>Filters</span>
        {filtersActive && <span className="filter-badge">{activeFilterCount}</span>}
        <span className="toggle-icon">{showFilters ? "▼" : "▶"}</span>
      </button>

      {showFilters && (
        <div id="filter-panel" className="filters-content">
          <div className="filter-grid">
            <label htmlFor="search-filter">
              Search
              <input
                id="search-filter"
                type="text"
                value={textFilter}
                onChange={(event) => onTextFilterChange(event.target.value)}
                placeholder="Line, train, or stop name..."
              />
            </label>

            <label htmlFor="date-from-filter">
              Date from
              <input
                id="date-from-filter"
                type="date"
                value={dateFrom}
                onChange={(event) => onDateFromChange(event.target.value)}
              />
            </label>

            <label htmlFor="date-to-filter">
              Date to
              <input
                id="date-to-filter"
                type="date"
                value={dateTo}
                onChange={(event) => onDateToChange(event.target.value)}
              />
            </label>

            <label htmlFor="time-of-day-filter">
              Time of day
              <select
                id="time-of-day-filter"
                value={timeOfDay}
                onChange={(event) => {
                  const selectedValue = event.target.value;
                  if (isTimeOfDayFilter(selectedValue)) {
                    onTimeOfDayChange(selectedValue);
                  }
                }}
              >
                {TIME_OF_DAY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="date-presets">
            <span className="presets-label">Quick select:</span>
            <button
              type="button"
              className="preset-btn"
              onClick={() => applyDatePreset("last7")}
            >
              Last 7 days
            </button>
            <button
              type="button"
              className="preset-btn"
              onClick={() => applyDatePreset("last30")}
            >
              Last 30 days
            </button>
            <button
              type="button"
              className="preset-btn"
              onClick={() => applyDatePreset("thisMonth")}
            >
              This month
            </button>
            <button
              type="button"
              className="preset-btn"
              onClick={() => {
                onDateFromChange("");
                onDateToChange("");
              }}
            >
              Clear dates
            </button>
          </div>

          {filtersActive && (
            <button
              type="button"
              className="clear-filters-btn"
              onClick={onClearFilters}
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

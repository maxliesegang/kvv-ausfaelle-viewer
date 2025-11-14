import { useState } from "react";
import { getDatePresets } from "../utils/dateUtils";

interface FiltersSectionProps {
  textFilter: string;
  dateFrom: string;
  dateTo: string;
  timeOfDay: string;
  onTextFilterChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onTimeOfDayChange: (value: string) => void;
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
  const hasActiveFilters = textFilter || dateFrom || dateTo || timeOfDay !== "all";
  const activeFilterCount = [textFilter, dateFrom, dateTo, timeOfDay !== "all"].filter(Boolean).length;

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
        onClick={() => setShowFilters(!showFilters)}
      >
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="filter-badge">{activeFilterCount}</span>
        )}
        <span className="toggle-icon">{showFilters ? "▼" : "▶"}</span>
      </button>

      {showFilters && (
        <div className="filters-content">
          <div className="filter-grid">
            <label>
              Search
              <input
                type="text"
                value={textFilter}
                onChange={(e) => onTextFilterChange(e.target.value)}
                placeholder="Line, train, or stop name..."
              />
            </label>

            <label>
              Date from
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
              />
            </label>

            <label>
              Date to
              <input
                type="date"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
              />
            </label>

            <label>
              Time of day
              <select
                value={timeOfDay}
                onChange={(e) => onTimeOfDayChange(e.target.value)}
              >
                <option value="all">All times</option>
                <option value="morning">Morning (05–09)</option>
                <option value="late-morning">Late morning (09–12)</option>
                <option value="afternoon">Afternoon (12–17)</option>
                <option value="evening">Evening (17–20)</option>
                <option value="night">Night (20–05)</option>
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

          {hasActiveFilters && (
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

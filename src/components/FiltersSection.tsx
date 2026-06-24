import { KernButton, KernInput, KernSelect } from "@kern-ux-annex/kern-react-kit";
import type { CauseFilter, DayOfWeekFilter, TimeOfDayFilter } from "../types";
import { DAY_OF_WEEK_OPTIONS, TIME_OF_DAY_OPTIONS } from "../utils/dateUtils";
import { CAUSE_FILTER_OPTIONS } from "../utils/causeUtils";
import {
  getActiveFilterCount,
  type CancellationFilters,
} from "../utils/filtering";

interface FiltersSectionProps {
  filters: CancellationFilters;
  onFiltersChange: (patch: Partial<CancellationFilters>) => void;
  onClearFilters: () => void;
}

/** The filter panel revealed by the toolbar's "Filter" toggle: search, cause,
 * time-of-day and weekday. The date range has its own "Zeitraum" toggle/panel
 * (see {@link DateRangeFilter}). Search lives here too — one filter among
 * others, not a prominent always-on field. The reset clears every filter,
 * including the date range. */
export function FiltersSection({
  filters,
  onFiltersChange,
  onClearFilters,
}: FiltersSectionProps) {
  const activeFilterCount = getActiveFilterCount(filters);

  return (
    <div className="filters">
      <div className="filters__field--wide">
        <KernInput
          id="search-filter"
          type="search"
          label="Suche"
          required
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
          placeholder="Linie, Zug oder Haltestelle…"
        />
      </div>

      <KernSelect
        id="cause-filter"
        label="Ursache"
        required
        value={filters.cause}
        onChange={(e) => onFiltersChange({ cause: e.target.value as CauseFilter })}
      >
        {CAUSE_FILTER_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </KernSelect>

      <KernSelect
        id="time-of-day-filter"
        label="Tageszeit"
        required
        value={filters.timeOfDay}
        onChange={(e) => onFiltersChange({ timeOfDay: e.target.value as TimeOfDayFilter })}
      >
        {TIME_OF_DAY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </KernSelect>

      <KernSelect
        id="day-of-week-filter"
        label="Wochentag"
        required
        value={filters.dayOfWeek}
        onChange={(e) => onFiltersChange({ dayOfWeek: e.target.value as DayOfWeekFilter })}
      >
        {DAY_OF_WEEK_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </KernSelect>

      {activeFilterCount > 0 && (
        <div className="filters__reset">
          <KernButton
            label={`Filter zurücksetzen (${activeFilterCount})`}
            variant="secondary"
            icon="close"
            iconPosition="left"
            onClick={onClearFilters}
          />
        </div>
      )}
    </div>
  );
}

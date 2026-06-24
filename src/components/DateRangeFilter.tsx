import { KernButton } from "@kern-ux-annex/kern-react-kit";
import { getDatePresets } from "../utils/dateUtils";
import type { CancellationFilters } from "../utils/filtering";

interface DateRangeFilterProps {
  filters: CancellationFilters;
  onFiltersChange: (patch: Partial<CancellationFilters>) => void;
}

const DATE_PRESET_LABELS = { last7: "7 Tage", last30: "30 Tage", thisMonth: "Dieser Monat" } as const;

/** The "Zeitraum" panel: quick presets plus an exact Von/Bis range. Surfaced as
 * its own toolbar toggle so the common task of narrowing the period is one click
 * away, separate from the other filters. */
export function DateRangeFilter({ filters, onFiltersChange }: DateRangeFilterProps) {
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
    <div className="date-filter">
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
        <label className="kern-date-field">
          <span className="kern-date-field__label">Von</span>
          <input
            type="date"
            className="kern-date-input"
            value={filters.dateFrom}
            aria-label="Von Datum"
            onChange={(e) => onFiltersChange({ dateFrom: e.target.value })}
          />
        </label>
        <label className="kern-date-field">
          <span className="kern-date-field__label">Bis</span>
          <input
            type="date"
            className="kern-date-input"
            value={filters.dateTo}
            aria-label="Bis Datum"
            onChange={(e) => onFiltersChange({ dateTo: e.target.value })}
          />
        </label>
      </div>
    </div>
  );
}

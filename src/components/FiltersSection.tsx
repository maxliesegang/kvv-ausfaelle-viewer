import { useMemo } from "react";
import { KernInput } from "@kern-ux-annex/kern-react-kit";
import { getCauseOptions, type CauseCatalog } from "../utils/causeUtils";
import { type CancellationFilters } from "../utils/filtering";
import { FilterSelect } from "./FilterSelect";

interface FiltersSectionProps {
  filters: CancellationFilters;
  causeCatalog: CauseCatalog;
  onFiltersChange: (patch: Partial<CancellationFilters>) => void;
}

/** The always-visible inline filters on the control line: the text search and
 * the cause select. Cause options come from the loaded catalog. The time
 * dimensions (year, period, time-of-day, weekday) live in the "Zeit" expander
 * ({@link TimeFilters}); reset is in {@link ControlBar}. */
export function FiltersSection({ filters, causeCatalog, onFiltersChange }: FiltersSectionProps) {
  const causeOptions = useMemo(() => getCauseOptions(causeCatalog), [causeCatalog]);

  return (
    <div className="filter-rail">
      <div className="filter-rail__search">
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

      <FilterSelect
        id="cause-filter"
        label="Ursache"
        value={filters.cause}
        options={causeOptions}
        onChange={(cause) => onFiltersChange({ cause })}
      />
    </div>
  );
}

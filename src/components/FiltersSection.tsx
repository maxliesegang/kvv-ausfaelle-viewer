import { useMemo } from "react";
import { KernInput } from "@kern-ux-annex/kern-react-kit";
import { getCauseOptions } from "../utils/causeUtils";
import type { Catalogs } from "../utils/catalogs";
import { getVerificationOptions } from "../utils/verificationUtils";
import { type CancellationFilters } from "../utils/filtering";
import { FilterSelect } from "./FilterSelect";

interface FiltersSectionProps {
  filters: CancellationFilters;
  catalogs: Catalogs;
  onFiltersChange: (patch: Partial<CancellationFilters>) => void;
}

/** The always-visible inline filters on the control line: the text search, the
 * cause select and — only when the data source publishes a verification
 * taxonomy — the "Prüfung" select. Options come from the loaded catalogs. The
 * time dimensions (year, period, time-of-day, weekday) live in the "Zeit"
 * expander ({@link TimeFilters}); reset is in {@link ControlBar}. */
export function FiltersSection({ filters, catalogs, onFiltersChange }: FiltersSectionProps) {
  const causeOptions = useMemo(() => getCauseOptions(catalogs.causes), [catalogs.causes]);
  const verificationOptions = useMemo(() => getVerificationOptions(), []);

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

      {catalogs.verification.available && (
        <FilterSelect
          id="verification-filter"
          label="Prüfung"
          value={filters.verification}
          options={verificationOptions}
          onChange={(verification) => onFiltersChange({ verification })}
        />
      )}
    </div>
  );
}

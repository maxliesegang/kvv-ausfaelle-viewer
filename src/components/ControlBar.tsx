import { useState } from "react";
import { KernBadge, KernButton } from "@kern-ux-annex/kern-react-kit";
import type { DailyStats, LineStats } from "../types";
import type { LineFile } from "../hooks/useKVVData";
import { DateRangeFilter } from "./DateRangeFilter";
import { FiltersSection } from "./FiltersSection";
import { LinesSelector } from "./LinesSelector";
import { SummaryBar } from "./SummaryBar";
import { YearSelector } from "./YearSelector";
import {
  getAdvancedFilterCount,
  getDateFilterCount,
  type CancellationFilters,
} from "../utils/filtering";

type Panel = "lines" | "zeitraum" | "filters";

interface PanelToggleProps {
  panel: Panel;
  label: string;
  open: boolean;
  onToggle: () => void;
  /** Active-filter count shown as a badge; omitted or 0 hides it. */
  badge?: number;
  disabled?: boolean;
}

/** A disclosure toggle in the toolbar row: a button whose arrow + variant
 * reflect its open state, with an optional active-count badge. */
function PanelToggle({ panel, label, open, onToggle, badge, disabled }: PanelToggleProps) {
  return (
    <div className="toolbar__toggle">
      <KernButton
        label={label}
        variant={open ? "primary" : "tertiary"}
        icon={open ? "arrow-up" : "arrow-down"}
        iconPosition="right"
        aria-expanded={open}
        aria-controls={`panel-${panel}`}
        disabled={disabled}
        onClick={onToggle}
      />
      {badge ? <KernBadge label={String(badge)} variant="info" /> : null}
    </div>
  );
}

interface ControlBarProps {
  years: string[];
  selectedYear: string | null;
  onYearChange: (year: string | null) => void;
  lineFiles: LineFile[];
  selectedFiles: string[];
  onSelectionChange: (files: string[]) => void;
  filters: CancellationFilters;
  onFiltersChange: (patch: Partial<CancellationFilters>) => void;
  onClearFilters: () => void;
  loading: boolean;
  total: number;
  lineStats: LineStats[];
  dailyStats: DailyStats[];
}

/**
 * Sticky toolbar: primary scope (year, lines) and the advanced-filter toggle on
 * the left, the live result readout on the right of the same row (saves vertical
 * space). The line picker and filters open in disclosure panels — opening one
 * closes the other — keeping the casual view minimal.
 */
export function ControlBar({
  years,
  selectedYear,
  onYearChange,
  lineFiles,
  selectedFiles,
  onSelectionChange,
  filters,
  onFiltersChange,
  onClearFilters,
  loading,
  total,
  lineStats,
  dailyStats,
}: ControlBarProps) {
  const [openPanel, setOpenPanel] = useState<Panel | null>(null);

  // Each toggle carries its own active-count badge. The date range gets its own
  // "Zeitraum" toggle, so the "Filter" badge counts only the advanced filters.
  const toggle = (panel: Panel) => setOpenPanel((current) => (current === panel ? null : panel));

  return (
    <div className="toolbar">
      <div className="toolbar__row">
        <div className="toolbar__controls">
          <div className="toolbar__year">
            <YearSelector years={years} selectedYear={selectedYear} onYearChange={onYearChange} />
          </div>

          <PanelToggle
            panel="lines"
            label={`Linien (${selectedFiles.length}/${lineFiles.length})`}
            open={openPanel === "lines"}
            onToggle={() => toggle("lines")}
            disabled={lineFiles.length === 0}
          />

          <PanelToggle
            panel="zeitraum"
            label="Zeitraum"
            open={openPanel === "zeitraum"}
            onToggle={() => toggle("zeitraum")}
            badge={getDateFilterCount(filters)}
          />

          <PanelToggle
            panel="filters"
            label="Filter"
            open={openPanel === "filters"}
            onToggle={() => toggle("filters")}
            badge={getAdvancedFilterCount(filters)}
          />
        </div>

        {!loading && <SummaryBar total={total} lineStats={lineStats} dailyStats={dailyStats} />}
      </div>

      {openPanel === "lines" && (
        <div className="toolbar__panel" id="panel-lines">
          <LinesSelector
            lineFiles={lineFiles}
            selectedFiles={selectedFiles}
            onSelectionChange={onSelectionChange}
          />
        </div>
      )}

      {openPanel === "zeitraum" && (
        <div className="toolbar__panel" id="panel-zeitraum">
          <DateRangeFilter filters={filters} onFiltersChange={onFiltersChange} />
        </div>
      )}

      {openPanel === "filters" && (
        <div className="toolbar__panel" id="panel-filters">
          <FiltersSection
            filters={filters}
            onFiltersChange={onFiltersChange}
            onClearFilters={onClearFilters}
          />
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { KernBadge, KernButton } from "@kern-ux-annex/kern-react-kit";
import type { DailyStats, LineStats } from "../types";
import type { LineFile } from "../hooks/useKVVData";
import { FiltersSection } from "./FiltersSection";
import { LinesSelector } from "./LinesSelector";
import { SummaryBar } from "./SummaryBar";
import { TimeFilters } from "./TimeFilters";
import {
  getActiveFilterCount,
  getZeitFilterCount,
  type CancellationFilters,
} from "../utils/filtering";

type Panel = "lines" | "zeit";

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
 * Sticky toolbar. A single control line carries the always-visible inline
 * filters (search + cause), then the two disclosure expanders (Linien, and Zeit
 * — which groups year + period + time-of-day + weekday; opening one closes the
 * other), the inline reset, and a compact result readout ({@link SummaryBar})
 * trailing on the right — all flowing and wrapping together. Each expander's
 * panel drops in directly below the line.
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

  // Linien and Zeit (year + period + time-of-day + weekday) expand; search and
  // cause are always shown inline. Each expander carries its own active count.
  const toggle = (panel: Panel) => setOpenPanel((current) => (current === panel ? null : panel));

  const activeFilterCount = getActiveFilterCount(filters);

  return (
    <div className="toolbar">
      <div className="toolbar__controls">
        {/* Zone 1 — the always-visible filters (search grows to fill). */}
        <FiltersSection filters={filters} onFiltersChange={onFiltersChange} />

        <span className="toolbar__sep" aria-hidden="true" />

        {/* Zone 2 — disclosure expanders + reset. */}
        <div className="toolbar__group">
          <PanelToggle
            panel="lines"
            label={`Linien (${selectedFiles.length}/${lineFiles.length})`}
            open={openPanel === "lines"}
            onToggle={() => toggle("lines")}
            disabled={lineFiles.length === 0}
          />

          <PanelToggle
            panel="zeit"
            label="Zeit"
            open={openPanel === "zeit"}
            onToggle={() => toggle("zeit")}
            badge={getZeitFilterCount(filters)}
          />

          {activeFilterCount > 0 && (
            <KernButton
              className="toolbar__reset"
              label={`Zurücksetzen (${activeFilterCount})`}
              variant="tertiary"
              icon="close"
              iconPosition="left"
              onClick={onClearFilters}
            />
          )}
        </div>

        {/* Zone 3 — the result readout, trailing on the right. */}
        {!loading && (
          <>
            <span className="toolbar__sep" aria-hidden="true" />
            <div className="toolbar__summary">
              <SummaryBar total={total} lineStats={lineStats} dailyStats={dailyStats} />
            </div>
          </>
        )}
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

      {openPanel === "zeit" && (
        <div className="toolbar__panel" id="panel-zeit">
          <TimeFilters
            years={years}
            selectedYear={selectedYear}
            onYearChange={onYearChange}
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
        </div>
      )}
    </div>
  );
}

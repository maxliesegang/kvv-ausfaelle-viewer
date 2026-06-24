# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # Type-check (tsc -b) then build for production
npm run lint     # Run ESLint over the repo
npm run preview  # Serve the production build locally
npm run deploy   # Build + publish dist/ to GitHub Pages (gh-pages)
```

There is no test runner configured. Production builds also run automatically on push to `main` via `.github/workflows` (GitHub Pages).

Set `VITE_DATA_BASE_URL` to point the app at a different data source during development (defaults to the hosted scraper output).

## Architecture

A single-page React 19 + TypeScript + Vite app that visualizes KVV train cancellation data. It is purely client-side: there is no backend. All data is fetched as static JSON from an external scraper site (`kvv-ausfaelle-scraper`) and processed in the browser. Deployed to GitHub Pages, so `vite.config.ts` sets `base` to `/kvv-ausfaelle-viewer/`.

### Data flow

1. **`src/api.ts`** — thin fetch wrappers against `VITE_DATA_BASE_URL`. The remote data is a hierarchy: a root `index.json` lists `years`, each `<year>/index.json` lists per-line JSON `files`, and each `<year>/<file>` is an array of `Cancellation` records.

2. **`src/hooks/useKVVData.ts`** — the central state machine. Three chained effects load root index → year index → selected line files, each guarded by `AbortController` and (for the data load) a `requestId` ref to ignore stale responses. Loaded line files are memoized in a `Map` ref cache keyed by `year/file`. Selecting a year defaults to selecting all of its line files. Output is `rawData`: the combined, date/time-sorted `Cancellation[]`.

3. **`src/utils/filtering.ts`** — the compute core. `indexCancellations` pre-derives per-row search text, time-of-day category, day-of-week, and normalized `cause` once; `buildCancellationsView` then does a single pass to produce the filtered list **and** all chart aggregates (daily / by-line / time-of-day / day-of-week / by-cause stats) together. `App.tsx` wires these via `useMemo` so indexing only reruns when `rawData` changes and the view only reruns when filters change. The toolbar badge counts are split so each toggle owns its own: `getDateFilterCount` (date bounds, 0–2 — drives the "Zeitraum" badge), `getAdvancedFilterCount` (search/cause/time-of-day/weekday — drives the "Filter" badge), and `getActiveFilterCount` (their sum — drives the filter panel's reset label and `hasActiveFilters`). The panel's reset restores `DEFAULT_CANCELLATION_FILTERS`, clearing every filter incl. the date range.

4. **`src/utils/dateUtils.ts`** — defines the time-of-day buckets and day-of-week categories, their display labels, chart ordering, and the `matchesDayOfWeekFilter` logic (note `weekday`/`weekend` are synthetic groupings, individual days are exact matches — see `src/types.ts`).

5. **`src/utils/causeUtils.ts`** — the cancellation **cause** ("Ursache") taxonomy: the scraper's best-effort `cause` category (`strike → weather → technical → personnel → construction → unknown`), with German labels, chart/priority ordering, filter options, and `normalizeCause` (legacy records that predate the field, or carry an unknown value, fall back to `unknown`). Mirrors the structure of `dateUtils.ts`.

6. **`src/utils/dataTransforms.ts`** — small pure helpers (e.g. `lineFileToLabel`, which turns a line file name like `S1-S11.json` into a display label). **`src/utils/csvExport.ts`** — builds and triggers a client-side CSV download of the currently filtered rows (UTF-8 BOM so Excel decodes German characters, incl. the localized Ursache column), wired to the "CSV exportieren" button in `CancellationsTable.tsx`.

### UI

`App.tsx` holds the only page state (`filters`) plus the `useKVVData`/`useTheme` hooks; everything in `src/components/` is presentational and driven by props. Charts (`CancellationCharts`, using Recharts) are `React.lazy`-loaded and Suspense-wrapped to keep the initial bundle small. UI copy is in German.

The design language is **KERN UX** (German public-sector design system) via its official React components, `@kern-ux-annex/kern-react-kit`. The kit's self-contained CSS bundle (reset, design tokens, light/dark themes, embedded Fira Sans, *and* component styles) is imported once in `src/main.tsx` (`@kern-ux-annex/kern-react-kit/kern-react-kit.css`); the separate `@kern-ux/native` package is **not** used. Custom CSS uses the kit's current token taxonomy — `--kern-color-layout-text-default`/`-muted` for text, `--kern-color-layout-border`, `--kern-color-layout-background-hued` for raised surfaces, `--kern-color-action-default`/`-on-default` for the brand accent, and `--kern-metric-border-radius-*` for radii (the older `--kern-color-decorative-*` / `*-background-default-surface` names from `@kern-ux/native` do not exist here).

**Page anatomy** (`App.tsx`): a **toolbar + canvas** layout. A KERN-styled header band (`AppHeader` — *not* the federal `KernKopfzeile`, which would falsely imply an official government site) with the "KVV" mark, title and theme toggle; then inside a `KernContainer`: a sticky **`ControlBar`** toolbar (`position: sticky; top: 0`) over a single full-width **canvas** column (`SummaryBar` hero → charts → collapsible table); and a footer with the data-source link. Everything wraps/stacks on mobile.

- **Progressive disclosure** is the organizing principle: the casual answer is always visible (the inline result readout + the breakdown charts), while power controls recede. `ControlBar` is one sticky row — primary scope and three disclosure toggles on the **left** (`YearSelector`, "Linien (n/m)", "Zeitraum", "Filter"), and the live result readout (`SummaryBar`) on the **right** of the same row to save vertical space. Each toggle opens a panel below the row, and opening one closes the others (`useState<"lines"|"zeitraum"|"filters"|null>`): `LinesSelector`, `DateRangeFilter` (presets + Von/Bis), and `FiltersSection` (search, Ursache, Tageszeit, Wochentag) respectively. The "Zeitraum" and "Filter" toggles each carry their own `KernBadge` active-count (date bounds vs. the rest — together they equal `getActiveFilterCount`). Note: search is intentionally **not** a prominent always-on field — it is just one filter in the Filter panel. The detail table (`CancellationsTable`) uses a `KernAccordion` (collapsed by default; the count + "gefiltert" go in the accordion title, CSV export sits in its body). No custom popovers — disclosure is plain controlled state + conditional render.
- `SummaryBar` (formerly `StatTiles`) is a compact inline readout rendered inside `ControlBar`: the emphasized total plus muted supporting stats (Linien / Stärkste Linie / Stärkster Tag), hidden while `loading`.
- Controls are KERN components: `KernSelect` (year, cause, time-of-day, day-of-week filters), `KernCheckbox` in a grid (line selection), `KernInput` (search, inside the filter panel), `KernButton` (date presets — active = `primary`/inactive = `tertiary`; toolbar toggles use `arrow-up`/`arrow-down` + `aria-expanded`), `KernAccordion` (detail table), `KernCard` (chart panels — note its `title` prop is **required**), `KernTable`, `KernBadge`, `KernAlert`, `KernLoader`, `KernLink`, `KernHeading`, `KernText`, `KernContainer`. KERN form controls append a "- Optional" suffix to the label unless `required` is set; since these filters always carry a value, they pass `required` to drop that marker (do **not** CSS-hide `.kern-label__optional`).
- **`KernCard` quirk**: the card is `display:flex; align-items:flex-start`, so its body sizes to the *title width* and block content (charts/tables) collapses. `App.css` overrides `.kern-card { align-items: stretch }` + `.kern-card__container { width: 100% }` so content fills the card — without this, Recharts measures 0 width and renders nothing.
- **Chart colors**: SVG `fill` can't resolve `var(--kern-…)`, and `getComputedStyle` returns the unsubstituted `var()` chain. `src/hooks/useChartColors.ts` resolves KERN tokens to concrete `rgb()` by assigning `color: var(--token)` to a probe element and reading its used color; re-resolved on theme change (hence `CancellationCharts` takes a `theme` prop). One color per chart (daily / line / cause / time-of-day / day-of-week). `CancellationCharts` shows the daily trend large, then four breakdowns in a responsive `.charts-row` grid; "Nach Linie" and "Nach Ursache" are horizontal bar charts so the longer German category labels fit.
- `KernTable` is data-driven and **rejects object cell values at runtime** — rich cells (the two-line Von/Nach stops, the "KVV" source link) are produced via column `valueFormatter`s in `CancellationsTable.tsx`; stop+time are packed with a separator and unpacked there.
- The date-range inputs stay native `<input type="date">` (KERN's `KernInputDate` is a 3-field fieldset whose change contract doesn't match the ISO-string filter logic), styled with KERN form tokens in `App.css`.
- `src/App.css` is **layout-only** (page/grid/card-fill/chart/table layout); it and `src/index.css` use KERN `--kern-*` tokens (note KERN's default text color is `--kern-color-layout-background-inverted`). There is no custom color palette.
- Theming: `src/hooks/useTheme.ts` sets `data-kern-theme="light|dark"` on `<html>`, defaulting to the OS preference and following it live, with a manual toggle button (persisted in `localStorage`) in the header.

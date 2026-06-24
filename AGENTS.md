# AGENTS.md

Repository-wide guidance for AI agents working in `kvv-ausfaelle-viewer`.

## Scope Model

Use the most specific `AGENTS.md` available for the file you are editing.

- Root rules here apply everywhere.
- Nested `AGENTS.md` files override/add guidance for their subtree.

## Project Snapshot

- **Purpose:** Client-side React app for visualizing KVV train cancellation data.
- **Stack:** React 19, TypeScript, Vite, Recharts, KERN UX design system (`@kern-ux-annex/kern-react-kit`), layout-only custom CSS.
- **Runtime:** Static GitHub Pages site; no backend in this repository.
- **Data source:** Static JSON from `kvv-ausfaelle-scraper`, configured via `VITE_DATA_BASE_URL`.
- **Package manager:** npm with `package-lock.json`.
- **Node:** `^20.19.0 || >=22.12.0`; npm `>=10`.

## Commands

```bash
npm ci           # Install dependencies from package-lock.json
npm run dev      # Start Vite dev server
npm run build    # Type-check with tsc -b, then build production assets
npm run lint     # Run ESLint
npm run preview  # Serve the production build locally
npm run deploy   # Build and publish dist/ to GitHub Pages
```

There is no test runner configured. For meaningful source changes, run at least
`npm run lint` and `npm run build`.

## Architecture

- `src/api.ts`: fetch wrappers for the scraper JSON hierarchy.
- `src/hooks/useKVVData.ts`: central loading state, caching, abort handling, and stale-response guards.
- `src/hooks/useTheme.ts`: light/dark theme state (OS default + manual toggle, persisted in `localStorage`), sets `data-kern-theme` on `<html>`.
- `src/hooks/useChartColors.ts`: resolves KERN CSS tokens to concrete `rgb()` for Recharts (re-resolved on theme change).
- `src/utils/filtering.ts`: indexing, filtering, and chart aggregate computation (incl. `cause`); `getDateFilterCount` / `getAdvancedFilterCount` / `getActiveFilterCount` for the toolbar filter badges and reset label.
- `src/utils/dateUtils.ts`: time-of-day and day-of-week bucket definitions.
- `src/utils/causeUtils.ts`: cancellation cause ("Ursache") taxonomy — labels, ordering, filter options, `normalizeCause`.
- `src/utils/dataTransforms.ts`: small pure helpers (e.g. line-file labels).
- `src/utils/csvExport.ts`: client-side CSV export of the filtered rows.
- `src/App.tsx`: top-level UI state for filters and the `useKVVData`/`useTheme` hooks.
- `src/components/`: presentational components driven by props — `AppHeader`, `ControlBar` (sticky toolbar + Linien/Zeitraum/Filter disclosure panels + inline result readout), `DateRangeFilter`, `FiltersSection`, `LinesSelector`, `SummaryBar` (inline result readout), charts, `CancellationsTable` (KernAccordion).

The app fetches a root `index.json`, then a selected year's `index.json`, then
line-specific cancellation files. Loaded files are cached in memory by
`year/file`.

## UI & Styling

- All UI is built from KERN UX React components; the kit's self-contained CSS
  (tokens, light/dark themes, fonts, component styles) is imported once in
  `src/main.tsx`. Use only the current `--kern-*` token taxonomy.
- **Layout = toolbar + canvas with progressive disclosure**: a sticky `ControlBar`
  (year, plus Linien / Zeitraum / Filter disclosure toggles, with the live result
  readout inline on the right) over a single-column canvas (charts →
  collapsed-by-default `KernAccordion` table). Keep the casual answer visible and
  tuck power controls behind toolbar disclosure panels / the table collapse — don't
  reintroduce an always-on sidebar of every control, and don't make search a
  prominent always-on field.
- KERN form controls show a "- Optional" label suffix unless `required` is set —
  pass `required` on always-valued filter controls rather than CSS-hiding it.
- `src/App.css` is **layout-only** — there is no custom color palette. Drive
  colors and spacing from KERN tokens.
- UI copy is in German.

## Implementation Notes

1. Keep changes small and local; follow the existing component and utility split.
2. Preserve the static-site deployment model. `vite.config.ts` uses the
   `/kvv-ausfaelle-viewer/` base path for GitHub Pages.
3. Do not manually edit generated artifacts in `dist/` or dependencies in
   `node_modules/`.
4. Keep UI copy in German unless a task explicitly asks otherwise.
5. Prefer typed transformations in `src/utils/` over duplicating data-shaping
   logic inside components.
6. Be careful with async data loading in `useKVVData.ts`: preserve
   `AbortController`, request-id stale response checks, and cache behavior.
7. When changing chart/filter behavior, update the relevant TypeScript types in
   `src/types.ts` and keep chart ordering/labels centralized in utilities.

## Environment

Set `VITE_DATA_BASE_URL` during development to point at an alternate scraper
output. If it is unset, the app uses the hosted scraper data.

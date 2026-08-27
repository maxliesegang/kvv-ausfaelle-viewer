# AGENTS.md

Repository-wide guidance for AI agents working in `kvv-ausfaelle-viewer`.
Architecture detail lives in [CLAUDE.md](CLAUDE.md) — read it before non-trivial changes; keep both files in sync when structure or conventions change.

Use the most specific `AGENTS.md` for the file you are editing: root rules apply everywhere, nested files override/add for their subtree.

## Project snapshot

- **Purpose:** client-side React app visualizing KVV train cancellation data.
- **Stack:** React 19, TypeScript, Vite, Recharts, KERN UX (`@kern-ux-annex/kern-react-kit`), layout-only custom CSS.
- **Runtime:** static GitHub Pages site; no backend in this repo. Data is static JSON from `kvv-ausfaelle-scraper` via `VITE_DATA_BASE_URL` (unset → hosted scraper output).
- **Tooling:** npm + `package-lock.json`; Node `^20.19.0 || >=22.12.0`, npm `>=10`.

## Commands

```bash
npm ci           # Install from package-lock.json
npm run dev      # Vite dev server
npm run build    # tsc -b, then production build
npm run lint     # ESLint
npm run preview  # Serve the production build
npm run deploy   # Build + publish dist/ to GitHub Pages
```

No test runner. Run at least `npm run lint` and `npm run build` for meaningful source changes.

## Layout

- `src/api.ts` — fetch wrappers over the scraper JSON hierarchy (root index → year index → line files → archived notices).
- `src/utils/rootIndex.ts` — runtime validation of the root discovery contract; never `as RootIndex`.
- `src/hooks/` — `useKVVData` (loading, caching, abort + stale-response guards), `useTheme`, `useChartColors`.
- `src/utils/` — `filtering` (indexing, filtering, all chart aggregates, filter counts), `dateUtils`, `taxonomy` (shared ordering/label rules), `causeUtils`, `verificationUtils`, `catalogs`, `dataTransforms`, `csvExport`.
- `src/App.tsx` — the only page state (filters) plus the data/theme hooks.
- `src/components/` — presentational, prop-driven: `AppHeader`, `ControlBar`, `FiltersSection`, `FilterSelect`, `YearSelector`, `TimeFilters`, `LinesSelector`, `SummaryBar`, `CancellationCharts`/`ChartCard`, `CancellationsTable`, `NoticeDialog`.

## Rules

1. Keep changes small and local; follow the existing component/utility split, and prefer typed transformations in `src/utils/` over data shaping inside components.
2. Preserve the static-site model (`vite.config.ts` base `/kvv-ausfaelle-viewer/`). Never edit `dist/` or `node_modules/`.
3. UI copy is German. Keep it so unless a task says otherwise.
4. **Taxonomies come from the producer.** No hard-coded cause list, label map or ordering — extend the scraper catalog instead. Unknown/drifted ids stay visible (`Unbekannt (<id>)`), never silently collapsed. Verification is the one exception: German display text is hard-coded because the scraper publishes it in English.
5. Verification verdicts are advisory and are shown **grouped** (`confirmed` / `contradicted` / `inconclusive`) on every surface; a new scraper status must fall back to `inconclusive`, never to a claim. The whole verification UI hides when the source publishes no taxonomy.
6. Be careful in `useKVVData.ts`: preserve `AbortController`, `requestId` stale checks, and the file cache.
7. Keep the toolbar + canvas layout with progressive disclosure — don't reintroduce an always-on sidebar of every control.
8. All UI is KERN components with `--kern-*` tokens; `src/App.css` is layout-only and there is no custom color palette. Pass `required` on always-valued form controls instead of CSS-hiding the "- Optional" suffix.
9. When changing chart/filter behavior, update `src/types.ts` and keep ordering/labels centralized in `src/utils/`.

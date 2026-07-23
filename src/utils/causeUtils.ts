import type { CauseStats, CauseDefinition } from "../types";

/**
 * Cancellation cause ("Ursache") helpers, driven entirely by the taxonomy the
 * scraper publishes in the root `index.json` — there is intentionally no
 * hard-coded cause list, label map, or ordering here. Adding a cause in the
 * scraper is picked up automatically.
 *
 * Resolution rules for a raw record `cause`:
 *  - missing / blank        → the catalog's guaranteed `unknown` id;
 *  - id present in catalog  → that id, with its published German label;
 *  - id absent from catalog → kept as its own visible category, labelled
 *    `Unbekannt (<id>)` so producer/consumer drift stays diagnosable.
 *
 * Display order is the catalog's own order; any unexpected raw ids observed in
 * the loaded data are appended in stable lexical order immediately before
 * `unknown`.
 */

/** The catalog's guaranteed fallback category (validated to exist exactly once
 * in `parseRootIndex`). Also the resolved key for missing/blank causes. */
export const UNKNOWN_CAUSE_ID = "unknown";

/** Label used when no catalog is loaded yet (defensive; in practice the catalog
 * loads before any cancellation data). */
const UNKNOWN_FALLBACK_LABEL = "Unbekannt";

export interface CauseCatalog {
  /** Producer-defined display order from the root index. */
  readonly definitions: readonly CauseDefinition[];
  /** id → German label, for O(1) lookups. */
  readonly labelById: ReadonlyMap<string, string>;
}

/** Builds the in-memory catalog from validated root-index definitions. */
export function buildCauseCatalog(
  definitions: readonly CauseDefinition[]
): CauseCatalog {
  return {
    definitions,
    labelById: new Map(definitions.map((def) => [def.id, def.label])),
  };
}

/** The catalog before the root index has loaded (or after a load error). Every
 * helper treats it the same as a loaded catalog with no categories, so consumers
 * never juggle a nullable catalog — `loading` already models the pending state. */
export const EMPTY_CAUSE_CATALOG: CauseCatalog = buildCauseCatalog([]);

/** Resolves a raw/absent record `cause` into a stable category key. Blank/missing
 * values collapse to {@link UNKNOWN_CAUSE_ID}; any non-empty value is kept
 * verbatim (trimmed) so an id absent from the catalog remains its own category. */
export function resolveCauseId(raw: string | undefined): string {
  const trimmed = raw?.trim();
  return trimmed ? trimmed : UNKNOWN_CAUSE_ID;
}

/** German display label for a resolved cause key: the catalog's label for known
 * ids, `Unbekannt` for the fallback, and `Unbekannt (<id>)` for a drifted id
 * absent from the catalog. */
export function resolveCauseLabel(catalog: CauseCatalog, id: string): string {
  const label = catalog.labelById.get(id);
  if (label) return label;
  return id === UNKNOWN_CAUSE_ID
    ? UNKNOWN_FALLBACK_LABEL
    : `${UNKNOWN_FALLBACK_LABEL} (${id})`;
}

/** Resolves a raw/absent record `cause` straight to its display label — the
 * common case for read-only consumers (table, CSV) that don't need the key. */
export function resolveRawCauseLabel(catalog: CauseCatalog, raw: string | undefined): string {
  return resolveCauseLabel(catalog, resolveCauseId(raw));
}

/** Options for the cause filter select: "Alle Ursachen" plus every catalog
 * category, in catalog order. */
export function getCauseOptions(
  catalog: CauseCatalog
): ReadonlyArray<{ value: string; label: string }> {
  return [
    { value: "all", label: "Alle Ursachen" },
    ...catalog.definitions.map((def) => ({ value: def.id, label: def.label })),
  ];
}

/** Ordered, labelled cause aggregates for the chart. Catalog order drives the
 * layout; unexpected ids present in `counts` are inserted, in stable lexical
 * order, immediately before `unknown`. Zero-count categories are dropped. */
export function toCauseStats(
  counts: ReadonlyMap<string, number>,
  catalog: CauseCatalog
): CauseStats[] {
  const catalogIds = catalog.definitions.map((def) => def.id);
  const known = new Set(catalogIds);

  const extras = [...counts.keys()]
    .filter((id) => !known.has(id) && id !== UNKNOWN_CAUSE_ID)
    .sort((a, b) => a.localeCompare(b));

  // Catalog order, with the drifted extras spliced in just before `unknown`.
  const order: string[] = [];
  let extrasPlaced = false;
  for (const id of catalogIds) {
    if (id === UNKNOWN_CAUSE_ID) {
      order.push(...extras);
      extrasPlaced = true;
    }
    order.push(id);
  }
  // Fallback for a catalog without `unknown` (the empty pre-load catalog, or an
  // otherwise malformed one): trail the extras then the unknown bucket.
  if (!extrasPlaced) {
    order.push(...extras);
    if (counts.has(UNKNOWN_CAUSE_ID)) order.push(UNKNOWN_CAUSE_ID);
  }

  return order
    .map((id) => ({ cause: resolveCauseLabel(catalog, id), count: counts.get(id) ?? 0 }))
    .filter((entry) => entry.count > 0);
}

/**
 * Shared plumbing for the two producer-published taxonomies the viewer consumes
 * — causes (`utils/causeUtils.ts`) and verification statuses
 * (`utils/verificationUtils.ts`). Both arrive as an ordered `{ id, label,
 * description }[]` in the root `index.json`, both need an id → label lookup, and
 * both display observed ids in producer order with a designated fallback bucket
 * last. That common shape lives here so neither layer re-implements it.
 */

/** The shape every published taxonomy entry shares. */
export interface TaxonomyDefinition {
  id: string;
  label: string;
  description: string;
}

/** id → label lookup for O(1) resolution. */
export function buildLabelMap(
  definitions: readonly TaxonomyDefinition[]
): ReadonlyMap<string, string> {
  return new Map(definitions.map((def) => [def.id, def.label]));
}

/**
 * Display order for a set of observed ids: the catalog's own order, with any
 * observed id absent from the catalog spliced in — in stable lexical order —
 * immediately before `fallbackId`. Drifted producer ids therefore stay visible
 * next to the fallback bucket instead of being silently collapsed into it.
 *
 * When the catalog does not contain `fallbackId` (an empty pre-load catalog, or
 * a malformed one), the extras and the fallback trail the list instead.
 */
export function orderTaxonomyIds(
  catalogIds: readonly string[],
  observedIds: Iterable<string>,
  fallbackId: string
): string[] {
  const known = new Set(catalogIds);
  const extras = [...new Set(observedIds)]
    .filter((id) => !known.has(id) && id !== fallbackId)
    .sort((a, b) => a.localeCompare(b));

  const order: string[] = [];
  let extrasPlaced = false;
  for (const id of catalogIds) {
    if (id === fallbackId) {
      order.push(...extras);
      extrasPlaced = true;
    }
    order.push(id);
  }
  if (!extrasPlaced) {
    order.push(...extras, fallbackId);
  }
  return order;
}

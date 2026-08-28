import type {
  Verification,
  VerificationStats,
  VerificationStatusDefinition,
} from "../types";
import { buildLabelMap } from "./taxonomy";

/**
 * The realtime-**verification** ("Prüfung") layer: the scraper compares an
 * announced cancellation against an external realtime source and stores an
 * advisory verdict. Only a minority of trips are checked, so "not checked" is
 * the normal state, not a defect, and a verdict never overrides the record's
 * primary meaning — that KVV announced a cancellation.
 *
 * The scraper's five statuses answer *its* question ("what did the source
 * see?"). The viewer asks the reader's question — "was the announcement
 * right?" — which has only three answers, so every surface (filter, chart,
 * table, summary tile) speaks in {@link VERIFICATION_GROUPS}: the evidence
 * **supports** the notice, **contradicts** it, or **says nothing**. The precise
 * status survives as the table cell's tooltip and its own CSV column.
 *
 * `no-data` sits in the inconclusive group on purpose: the source explicitly
 * holds no information for those trips, which is epistemically the same as never
 * having looked. Grouping it with the confirmed rows would let ~28 rows read as
 * "bestätigt" on the strength of an assumption rather than evidence.
 *
 * German display text is hard-coded here — the one place in the viewer where
 * taxonomy wording is not taken from the producer — because the scraper
 * publishes this taxonomy in English while the UI is German. It degrades rather
 * than breaking: an unmapped status falls back to the published label, and an
 * unmapped status groups as inconclusive, so a new verdict never silently
 * counts as confirmation or contradiction.
 */

/** Synthetic bucket for records the source never checked. Not part of the
 * published taxonomy — `parseRootIndex` rejects a published status using this
 * id so the two can never collide. */
export const UNCHECKED_STATUS_ID = "unchecked";

const UNKNOWN_FALLBACK_LABEL = "Unbekannt";

const GERMAN_AGREEMENT_LABELS: Readonly<Record<string, string>> = {
  "single-source": "Einzelquelle",
  corroborated: "Quellen stimmen überein",
  conflicting: "Quellen widersprechen sich",
};

/** What the evidence says about the announcement. The filter, chart, table
 * column and summary tile are all expressed in these. */
export type VerificationGroupId = "confirmed" | "contradicted" | "inconclusive";

export interface VerificationGroupDefinition {
  id: VerificationGroupId;
  label: string;
  description: string;
}

/** Display order: the two groups that say something, then the one that doesn't. */
export const VERIFICATION_GROUPS: readonly VerificationGroupDefinition[] = [
  {
    id: "confirmed",
    label: "Ausfall bestätigt",
    description:
      "Die Echtzeitdaten bestätigen, dass die Fahrt ganz oder teilweise nicht gefahren ist.",
  },
  {
    id: "contradicted",
    label: "Fuhr trotz Meldung",
    description:
      "Die Echtzeitdaten zeigen die Fahrt auf der gemeldeten Strecke — der angekündigte Ausfall scheint nicht eingetreten zu sein.",
  },
  {
    id: "inconclusive",
    label: "Kein Befund",
    description:
      "Die Fahrt wurde nicht geprüft, oder die Quelle hält keine Informationen zu ihr. Die Meldung wird dadurch weder bestätigt noch widerlegt.",
  },
];

const GROUP_BY_ID = new Map(VERIFICATION_GROUPS.map((group) => [group.id, group]));

/** Which group each published status falls into. Anything unmapped — a status
 * the scraper adds later — is inconclusive by design. */
const GROUP_BY_STATUS: Readonly<Record<string, VerificationGroupId>> = {
  cancelled: "confirmed",
  partial: "confirmed",
  ran: "contradicted",
  "no-data": "inconclusive",
  unresolved: "inconclusive",
  [UNCHECKED_STATUS_ID]: "inconclusive",
};

/** German wording for the statuses the scraper publishes in English, used for
 * the table tooltip and the CSV's detail column. */
const GERMAN_STATUS_TEXT: Readonly<Record<string, { label: string; description: string }>> = {
  cancelled: {
    label: "Bestätigt ausgefallen",
    description:
      "Die Quelle bestätigt, dass der gemeldete Abschnitt nicht gefahren ist.",
  },
  partial: {
    label: "Teilweise ausgefallen",
    description:
      "Nur ein Teil des gemeldeten Abschnitts ist ausgefallen bzw. wurde beobachtet.",
  },
  ran: {
    label: "Gefahren",
    description:
      "Die Quelle hat das Fahrzeug auf dem gesamten gemeldeten Abschnitt beobachtet, ohne Ausfallkennzeichnung.",
  },
  "no-data": {
    label: "Keine Daten",
    description:
      "Die Quelle kennt die Fahrt, hat für den gemeldeten Abschnitt aber weder Ausfallkennzeichnung noch Echtzeitdaten.",
  },
  unresolved: {
    label: "Ungeklärt",
    description: "In der Quelle war keine passende Fahrt auffindbar.",
  },
};

/** The synthetic "not checked" entry, appended to every loaded catalog so it
 * resolves like any other status. */
const UNCHECKED_DEFINITION: VerificationStatusDefinition = {
  id: UNCHECKED_STATUS_ID,
  label: "Nicht geprüft",
  description:
    "Diese Fahrt wurde nicht mit Echtzeitdaten abgeglichen — es liegt kein Prüfergebnis vor.",
};

export interface VerificationCatalog {
  /** Producer order from the root index, with `unchecked` appended last. */
  readonly definitions: readonly VerificationStatusDefinition[];
  /** status id → German label (published label for unmapped ids). */
  readonly labelById: ReadonlyMap<string, string>;
  /** status id → German description, for the table cell's tooltip. */
  readonly descriptionById: ReadonlyMap<string, string>;
  /** False when the source publishes no taxonomy — the verification UI (filter,
   * chart, table column, summary tile) is then hidden entirely rather than
   * rendered as an empty shell. */
  readonly available: boolean;
}

/** Builds the in-memory catalog from validated root-index definitions,
 * translating the known ids and appending the synthetic `unchecked` bucket. */
export function buildVerificationCatalog(
  definitions: readonly VerificationStatusDefinition[]
): VerificationCatalog {
  const localized = definitions.map((def) => ({ ...def, ...GERMAN_STATUS_TEXT[def.id] }));
  const all = [...localized, UNCHECKED_DEFINITION];

  return {
    definitions: all,
    labelById: buildLabelMap(all),
    descriptionById: new Map(all.map((def) => [def.id, def.description])),
    available: definitions.length > 0,
  };
}

/** The catalog before the root index has loaded, after a load error, or when the
 * source publishes no verification taxonomy at all. */
export const EMPTY_VERIFICATION_CATALOG: VerificationCatalog = buildVerificationCatalog([]);

/** Returns the distinct sources represented by a verification result. */
export function getVerificationSourceNames(
  verification: Verification | undefined
): string[] {
  const checkSources = Object.keys(verification?.checks ?? {}).filter((source) => source.trim());
  const selectedSource = verification?.source?.trim();
  const sources = [
    ...checkSources,
    ...(selectedSource && selectedSource !== "multiple" ? [selectedSource] : []),
  ];
  return [...new Set(sources)].sort((a, b) => a.localeCompare(b));
}

/** Formats year-index source metadata for German UI attribution. */
export function formatVerificationSourceLabel(
  source: string | null,
  sources: readonly string[]
): string | null {
  const names = [...new Set(sources.map((value) => value.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
  if (names.length > 0) return names.join(" und ");
  if (!source) return null;
  return source === "multiple" ? "mehreren Quellen" : source;
}

/** German label for the scraper's multi-source agreement marker. */
export function resolveVerificationAgreementLabel(
  agreement: string | undefined
): string | null {
  if (!agreement) return null;
  return GERMAN_AGREEMENT_LABELS[agreement] ?? agreement;
}

/** Resolves a record's verdict into a stable status key. A missing verdict or a
 * blank status collapses to {@link UNCHECKED_STATUS_ID}; any non-empty status is
 * kept verbatim (trimmed) so an id absent from the catalog stays diagnosable. */
export function resolveVerificationStatus(
  verification: { status?: string } | undefined
): string {
  const trimmed = verification?.status?.trim();
  return trimmed ? trimmed : UNCHECKED_STATUS_ID;
}

/** German label for a resolved status key (tooltip / CSV detail column). */
export function resolveVerificationLabel(catalog: VerificationCatalog, id: string): string {
  const label = catalog.labelById.get(id);
  if (label) return label;
  return id === UNCHECKED_STATUS_ID
    ? UNCHECKED_DEFINITION.label
    : `${UNKNOWN_FALLBACK_LABEL} (${id})`;
}

/** Explanatory text for a resolved status key. Empty for a drifted id the
 * catalog cannot describe. */
export function resolveVerificationDescription(
  catalog: VerificationCatalog,
  id: string
): string {
  return catalog.descriptionById.get(id) ?? "";
}

/** Precise result per provider, for audit-friendly tooltips and CSV exports. */
export function formatVerificationCheckDetails(
  catalog: VerificationCatalog,
  verification: Verification | undefined
): string | null {
  const checks = Object.entries(verification?.checks ?? {}).filter(
    ([source, evidence]) => source.trim() && evidence && typeof evidence.status === "string"
  );
  if (checks.length === 0) return null;

  return checks
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([source, evidence]) => {
      const status = resolveVerificationStatus(evidence);
      return `${source}: ${resolveVerificationLabel(catalog, status)}`;
    })
    .join("; ");
}

/** The group a resolved status belongs to. Unknown statuses are inconclusive. */
export function resolveVerificationGroup(statusId: string): VerificationGroupId {
  return GROUP_BY_STATUS[statusId] ?? "inconclusive";
}

export function getVerificationGroupLabel(id: VerificationGroupId): string {
  return GROUP_BY_ID.get(id)?.label ?? id;
}

/** Options for the "Prüfung" filter select: "Alle Prüfergebnisse" plus the three
 * groups in display order. */
export function getVerificationOptions(): ReadonlyArray<{ value: string; label: string }> {
  return [
    { value: "all", label: "Alle Prüfergebnisse" },
    ...VERIFICATION_GROUPS.map((group) => ({ value: group.id, label: group.label })),
  ];
}

/** Rolls per-status counts up into per-group counts. */
function toGroupCounts(
  statusCounts: ReadonlyMap<string, number>
): Map<VerificationGroupId, number> {
  const grouped = new Map<VerificationGroupId, number>();
  for (const [status, count] of statusCounts) {
    const group = resolveVerificationGroup(status);
    grouped.set(group, (grouped.get(group) ?? 0) + count);
  }
  return grouped;
}

/** Grouped, labelled aggregates for the chart, in group display order with
 * empty groups dropped.
 *
 * Empty when the source publishes no taxonomy, and also when nothing in the
 * current selection carries a verdict — a lone "Kein Befund" bar states nothing,
 * so the caller hides the chart instead of drawing it. */
export function toVerificationStats(
  statusCounts: ReadonlyMap<string, number>,
  catalog: VerificationCatalog
): VerificationStats[] {
  if (!catalog.available || toVerificationSummary(statusCounts, catalog).checked === 0) {
    return [];
  }

  const grouped = toGroupCounts(statusCounts);
  return VERIFICATION_GROUPS.map((group) => ({
    status: group.label,
    count: grouped.get(group.id) ?? 0,
  })).filter((entry) => entry.count > 0);
}

/** How much of the current selection carries a verdict, for the summary tile.
 * `checked` counts every record the source actually answered on; `confirmed`
 * those whose evidence supports the announcement. Both are zero when the source
 * publishes no taxonomy, which is what hides the tile. */
export interface VerificationSummary {
  checked: number;
  confirmed: number;
}

export function toVerificationSummary(
  statusCounts: ReadonlyMap<string, number>,
  catalog: VerificationCatalog
): VerificationSummary {
  if (!catalog.available) return { checked: 0, confirmed: 0 };

  let checked = 0;
  for (const [status, count] of statusCounts) {
    if (status !== UNCHECKED_STATUS_ID) checked += count;
  }
  return { checked, confirmed: toGroupCounts(statusCounts).get("confirmed") ?? 0 };
}

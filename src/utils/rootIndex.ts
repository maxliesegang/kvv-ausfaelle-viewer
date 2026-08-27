import type { CauseDefinition, RootIndex, VerificationStatusDefinition } from "../types";
import { UNKNOWN_CAUSE_ID } from "./causeUtils";
import type { TaxonomyDefinition } from "./taxonomy";
import { UNCHECKED_STATUS_ID } from "./verificationUtils";

/** The only root-contract version this build understands. A different value is a
 * breaking change and surfaces as a load error rather than being misread. */
const SUPPORTED_SCHEMA_VERSION = 1;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Shared shape check for a published taxonomy array (causes, verification
 * statuses): a non-empty array of `{ id, label, description }` with unique,
 * non-empty ids. `kind` names the taxonomy in the German error messages; the
 * per-taxonomy rules (a required `unknown` cause, a reserved status id) are
 * layered on by the callers.
 */
function parseDefinitions(value: unknown, kind: string): TaxonomyDefinition[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`Die ${kind} der Datenquelle fehlen oder sind leer.`);
  }

  const seen = new Set<string>();

  return value.map((entry, index): TaxonomyDefinition => {
    const position = index + 1;
    if (typeof entry !== "object" || entry === null) {
      throw new Error(`${kind}-Eintrag #${position} hat ein ungültiges Format.`);
    }

    const { id, label, description } = entry as Record<string, unknown>;
    if (!isNonEmptyString(id) || !isNonEmptyString(label) || !isNonEmptyString(description)) {
      throw new Error(
        `${kind}-Eintrag #${position} ist unvollständig (id, label und description sind erforderlich).`
      );
    }

    const normalizedId = id.trim();
    if (seen.has(normalizedId)) {
      throw new Error(`Doppelte Kennung "${normalizedId}" in den ${kind} der Datenquelle.`);
    }
    seen.add(normalizedId);

    return { id: normalizedId, label, description };
  });
}

function parseCauses(value: unknown): CauseDefinition[] {
  const causes = parseDefinitions(value, "Ursachen-Kategorien");

  const unknownCount = causes.filter((cause) => cause.id === UNKNOWN_CAUSE_ID).length;
  if (unknownCount !== 1) {
    throw new Error(
      `Die Ursachen-Kategorien müssen genau eine "${UNKNOWN_CAUSE_ID}"-Kategorie enthalten (gefunden: ${unknownCount}).`
    );
  }

  return causes;
}

/**
 * The verification status taxonomy. Unlike `causes` this is **optional**: a
 * source that publishes none (or an older cached root) simply yields an empty
 * list, and the viewer hides the whole verification UI. When present it must be
 * well-formed, and it must not claim the `unchecked` id, which the viewer
 * reserves for its own synthetic "not checked" bucket.
 */
function parseVerificationStatuses(value: unknown): VerificationStatusDefinition[] {
  if (value === undefined || value === null) return [];

  const statuses = parseDefinitions(value, "Prüfstatus-Kategorien");

  if (statuses.some((status) => status.id === UNCHECKED_STATUS_ID)) {
    throw new Error(
      `Die Prüfstatus-Kategorien dürfen die reservierte Kennung "${UNCHECKED_STATUS_ID}" nicht verwenden.`
    );
  }

  return statuses;
}

/**
 * Validates a fetched root index before the app trusts it. Enforces the supported
 * schema version, a well-formed cause taxonomy (non-empty, unique non-empty
 * ids/labels/descriptions, exactly one `unknown`) and — when published — a
 * well-formed verification status taxonomy. Unknown extra fields are tolerated.
 * Throws an `Error` with a German, user-facing message on any breach.
 */
export function parseRootIndex(raw: unknown): RootIndex {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Die Datenquelle hat ein ungültiges Format zurückgegeben.");
  }

  const { schemaVersion, years, causes, verificationStatuses } = raw as Record<string, unknown>;

  if (typeof schemaVersion !== "number") {
    throw new Error("Die Datenquelle meldet keine gültige Schema-Version.");
  }
  if (schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    throw new Error(
      `Nicht unterstützte Datenversion (Schema-Version ${schemaVersion}). Bitte laden Sie die Seite neu oder aktualisieren Sie die Anwendung.`
    );
  }

  if (!Array.isArray(years) || !years.every((year) => typeof year === "string")) {
    throw new Error("Die Datenquelle enthält keine gültige Jahresliste.");
  }

  return {
    schemaVersion,
    years: [...years],
    causes: parseCauses(causes),
    verificationStatuses: parseVerificationStatuses(verificationStatuses),
  };
}

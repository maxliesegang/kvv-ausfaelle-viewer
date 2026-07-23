import type { CauseDefinition, RootIndex } from "../types";
import { UNKNOWN_CAUSE_ID } from "./causeUtils";

/** The only root-contract version this build understands. A different value is a
 * breaking change and surfaces as a load error rather than being misread. */
const SUPPORTED_SCHEMA_VERSION = 1;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseCauses(value: unknown): CauseDefinition[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("Die Ursachen-Kategorien der Datenquelle fehlen oder sind leer.");
  }

  const seen = new Set<string>();
  let unknownCount = 0;

  const causes = value.map((entry, index): CauseDefinition => {
    const position = index + 1;
    if (typeof entry !== "object" || entry === null) {
      throw new Error(`Ursachen-Kategorie #${position} hat ein ungültiges Format.`);
    }

    const { id, label, description } = entry as Record<string, unknown>;
    if (!isNonEmptyString(id) || !isNonEmptyString(label) || !isNonEmptyString(description)) {
      throw new Error(
        `Ursachen-Kategorie #${position} ist unvollständig (id, label und description sind erforderlich).`
      );
    }

    const normalizedId = id.trim();
    if (seen.has(normalizedId)) {
      throw new Error(`Doppelte Ursachen-Kennung "${normalizedId}" in der Datenquelle.`);
    }
    seen.add(normalizedId);
    if (normalizedId === UNKNOWN_CAUSE_ID) unknownCount += 1;

    return { id: normalizedId, label, description };
  });

  if (unknownCount !== 1) {
    throw new Error(
      `Die Ursachen-Kategorien müssen genau eine "${UNKNOWN_CAUSE_ID}"-Kategorie enthalten (gefunden: ${unknownCount}).`
    );
  }

  return causes;
}

/**
 * Validates a fetched root index before the app trusts it. Enforces the supported
 * schema version and a well-formed cause taxonomy (non-empty, unique non-empty
 * ids/labels/descriptions, exactly one `unknown`). Unknown extra fields are
 * tolerated. Throws an `Error` with a German, user-facing message on any breach.
 */
export function parseRootIndex(raw: unknown): RootIndex {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Die Datenquelle hat ein ungültiges Format zurückgegeben.");
  }

  const { schemaVersion, years, causes } = raw as Record<string, unknown>;

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
  };
}

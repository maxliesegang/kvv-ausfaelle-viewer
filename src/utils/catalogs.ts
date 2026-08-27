import type { RootIndex } from "../types";
import { buildCauseCatalog, EMPTY_CAUSE_CATALOG, type CauseCatalog } from "./causeUtils";
import {
  buildVerificationCatalog,
  EMPTY_VERIFICATION_CATALOG,
  type VerificationCatalog,
} from "./verificationUtils";

/** The producer-published taxonomies the viewer resolves records against,
 * bundled so filtering, the table, the CSV export and the controls thread one
 * value instead of one prop per taxonomy. Loaded once in `useKVVData`. */
export interface Catalogs {
  causes: CauseCatalog;
  verification: VerificationCatalog;
}

/** Before the root index has loaded, or after a load error. Both catalogs behave
 * like loaded-but-empty ones, so consumers never juggle a nullable value. */
export const EMPTY_CATALOGS: Catalogs = {
  causes: EMPTY_CAUSE_CATALOG,
  verification: EMPTY_VERIFICATION_CATALOG,
};

export function buildCatalogs(root: RootIndex): Catalogs {
  return {
    causes: buildCauseCatalog(root.causes),
    verification: buildVerificationCatalog(root.verificationStatuses),
  };
}

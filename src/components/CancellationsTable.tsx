import { useMemo, useState } from "react";
import {
  KernAccordion,
  KernAlert,
  KernButton,
  KernLink,
  KernTable,
  type KernTableColumn,
  type KernTableRow,
  type KernTableTransformedCellValue,
} from "@kern-ux-annex/kern-react-kit";
import type { Cancellation } from "../types";
import { resolveRawCauseLabel } from "../utils/causeUtils";
import type { Catalogs } from "../utils/catalogs";
import {
  getVerificationGroupLabel,
  formatVerificationCheckDetails,
  getVerificationSourceNames,
  resolveVerificationDescription,
  resolveVerificationAgreementLabel,
  resolveVerificationGroup,
  resolveVerificationLabel,
  resolveVerificationStatus,
} from "../utils/verificationUtils";
import { exportCancellationsCsv } from "../utils/csvExport";
import { extractNoticeId } from "../utils/dataTransforms";
import { NoticeDialog, type NoticeRef } from "./NoticeDialog";

interface CancellationsTableProps {
  data: Cancellation[];
  loading: boolean;
  hasActiveFilters: boolean;
  selectedYear: string | null;
  catalogs: Catalogs;
}

/** KernTable cell values must be primitives; rich cells are produced via a
 * column `valueFormatter`. Stop + time are packed with this separator and
 * unpacked back into a two-line cell in {@link renderStop}. */
const STOP_TIME_SEP = "␟";

/** Same trick for the verification cell: the group id travels with the group
 * label and the precise-status tooltip, so the formatter can key the dot's
 * modifier class off the group. */
const STATUS_SEP = "␞";

function renderStop(value: KernTableTransformedCellValue) {
  const [stop, time] = String(value).split(STOP_TIME_SEP);
  return (
    <span className="cell-stack">
      <span>{stop}</span>
      {time && <span className="cell-time">{time}</span>}
    </span>
  );
}

/** The verdict as a small colored dot plus its group label. The row reads in the
 * same three-way vocabulary as the filter and the chart; the precise status and
 * its explanation are one hover away in the `title`. */
function renderVerification(value: KernTableTransformedCellValue) {
  const [group, label, detail] = String(value).split(STATUS_SEP);
  return (
    <span className={`cell-verification cell-verification--${group}`} title={detail}>
      <span className="cell-verification__dot" aria-hidden="true" />
      {label}
    </span>
  );
}

function createColumns(
  onOpenNotice: (notice: NoticeRef) => void,
  showVerification: boolean
): KernTableColumn[] {
  return [
    {
      id: "date",
      label: "Datum",
      valueFormatter: (value) => <span className="cell-date">{String(value)}</span>,
    },
    {
      id: "line",
      label: "Linie",
      valueFormatter: (value) => <span className="cell-line">{String(value)}</span>,
    },
    { id: "trainNumber", label: "Zug" },
    { id: "from", label: "Von", valueFormatter: renderStop },
    { id: "to", label: "Nach", valueFormatter: renderStop },
    { id: "cause", label: "Ursache" },
    ...(showVerification
      ? [{ id: "verification", label: "Prüfung", valueFormatter: renderVerification }]
      : []),
    {
      id: "source",
      label: "Quelle",
      valueFormatter: (value) => {
        const url = String(value);
        const noticeId = extractNoticeId(url);
        return (
          <span className="cell-source">
            <KernLink
              href={url}
              target="_blank"
              rel="noreferrer"
              label="KVV"
              icon="open-in-new"
              small
            />
            {noticeId && (
              <KernButton
                type="button"
                variant="tertiary"
                icon="info"
                iconPosition="left"
                label="Details"
                onClick={() => onOpenNotice({ id: noticeId, sourceUrl: url })}
              />
            )}
          </span>
        );
      },
    },
  ];
}

function buildFilename(selectedYear: string | null, hasActiveFilters: boolean): string {
  const year = selectedYear ? `-${selectedYear}` : "";
  const suffix = hasActiveFilters ? "-gefiltert" : "";
  return `kvv-ausfaelle${year}${suffix}.csv`;
}

function packStop(stop: string, time: string | undefined): string {
  return time ? `${stop}${STOP_TIME_SEP}${time}` : stop;
}

function packVerification(
  catalogs: Catalogs,
  verification: Cancellation["verification"]
): string {
  const status = resolveVerificationStatus(verification);
  const group = resolveVerificationGroup(status);
  const statusLabel = resolveVerificationLabel(catalogs.verification, status);
  const statusDescription = resolveVerificationDescription(catalogs.verification, status);
  const sourceNames = getVerificationSourceNames(verification);
  const agreementLabel = resolveVerificationAgreementLabel(verification?.agreement);
  const checkDetails = formatVerificationCheckDetails(catalogs.verification, verification);
  const detail = [
    statusDescription ? `${statusLabel} — ${statusDescription}` : statusLabel,
    sourceNames.length > 0 ? `Quellen: ${sourceNames.join(" und ")}` : null,
    agreementLabel ? `Abgleich: ${agreementLabel}` : null,
    checkDetails ? `Einzelergebnisse: ${checkDetails}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return [group, getVerificationGroupLabel(group), detail].join(STATUS_SEP);
}

export function CancellationsTable({
  data,
  loading,
  hasActiveFilters,
  selectedYear,
  catalogs,
}: CancellationsTableProps) {
  const [notice, setNotice] = useState<NoticeRef | null>(null);

  const handleExport = () => {
    exportCancellationsCsv(data, buildFilename(selectedYear, hasActiveFilters), catalogs);
  };

  const showVerification = catalogs.verification.available;
  const columns = useMemo(
    () => createColumns(setNotice, showVerification),
    [showVerification]
  );

  const rows: KernTableRow[] = useMemo(
    () =>
      data.map((item) => ({
        date: item.date,
        line: item.line,
        trainNumber: item.trainNumber,
        from: packStop(item.fromStop, item.fromTime),
        to: packStop(item.toStop, item.toTime),
        cause: resolveRawCauseLabel(catalogs.causes, item.cause),
        verification: packVerification(catalogs, item.verification),
        source: item.sourceUrl,
      })),
    [data, catalogs]
  );

  const count = data.length.toLocaleString("de-DE");
  const title = loading
    ? "Ausfälle im Detail"
    : `Ausfälle im Detail (${count}${hasActiveFilters ? " · gefiltert" : ""})`;

  const body = (
    <div className="table-body">
      <div className="table-toolbar">
        <KernButton
          label="CSV exportieren"
          variant="secondary"
          icon="download"
          iconPosition="left"
          onClick={handleExport}
          disabled={loading || data.length === 0}
          title={
            data.length === 0
              ? "Keine Daten zum Exportieren"
              : `${count} Zeilen als CSV exportieren`
          }
        />
      </div>
      {data.length === 0 && !loading ? (
        <KernAlert title="Keine Einträge" variant="info">
          Für die aktuellen Filter wurden keine Ausfälle gefunden.
        </KernAlert>
      ) : (
        <KernTable columns={columns} rows={rows} striped responsive small />
      )}
      <NoticeDialog
        notice={notice}
        year={selectedYear}
        onClose={() => setNotice(null)}
      />
    </div>
  );

  return <KernAccordion variant="single" items={[{ id: "detail-table", title, body }]} />;
}

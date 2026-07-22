import { useEffect, useRef, useState } from "react";
import { KernAlert, KernButton, KernLink, KernLoader } from "@kern-ux-annex/kern-react-kit";
import { fetchNoticeText } from "../api";
import { cleanNoticeText } from "../utils/dataTransforms";

/** A pointer to a KVV notice: its id (the archived text's filename) and the
 * `sourceUrl` it was linked from. Handed to {@link NoticeDialog} to open it. */
export interface NoticeRef {
  id: string;
  sourceUrl: string;
}

interface NoticeDialogProps {
  /** The notice to display, or null when the dialog is closed. */
  notice: NoticeRef | null;
  /** Fahrplan year the notice belongs to (the folder it is archived under). */
  year: string | null;
  onClose: () => void;
}

/** Load result for one notice, keyed by its id so a stale response for a
 * previously-opened notice can never be rendered against the current one.
 * Exactly one of `text` / `notFound` / `error` is set. */
interface NoticeState {
  id: string;
  /** The archived notice body. */
  text?: string;
  /** No text has been archived for this notice yet (HTTP 404). */
  notFound?: boolean;
  /** The text exists but could not be loaded (network / server error). */
  error?: boolean;
}

/** Shows an archived KVV notice in a native `<dialog>`. KERN's dialog is
 * context-driven with internal open state, which does not fit a single dialog
 * opened on demand from arbitrary table rows — so, like the date inputs, this
 * uses a native element styled with KERN tokens. */
export function NoticeDialog({ notice, year, onClose }: NoticeDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState<NoticeState | null>(null);

  const open = notice !== null;
  const loaded = notice !== null && state?.id === notice.id;
  const loading = open && !loaded;

  // Drive the native dialog's open state from props.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Load the notice text whenever a new (not-yet-loaded) notice is opened.
  useEffect(() => {
    if (!notice || !year || loaded) return;

    const controller = new AbortController();
    const { id } = notice;

    fetchNoticeText(year, id, controller.signal)
      .then((raw) => {
        if (controller.signal.aborted) return;
        setState(raw === null ? { id, notFound: true } : { id, text: cleanNoticeText(raw) });
      })
      .catch(() => {
        // An abort synchronously sets `signal.aborted`, so this guard also
        // filters the AbortError from unmounting / switching notices.
        if (!controller.signal.aborted) setState({ id, error: true });
      });

    return () => controller.abort();
  }, [notice, year, loaded]);

  return (
    <dialog
      ref={dialogRef}
      className="notice-dialog"
      onClose={onClose}
      onClick={(e) => {
        // Close when the backdrop (the dialog element itself) is clicked.
        if (e.target === dialogRef.current) dialogRef.current?.close();
      }}
    >
      <div className="notice-dialog__header">
        <span className="notice-dialog__title">KVV-Meldung</span>
        <KernButton
          type="button"
          variant="tertiary"
          icon="close"
          alt="Schließen"
          onClick={() => dialogRef.current?.close()}
        />
      </div>
      <div className="notice-dialog__body">
        {loading && <KernLoader />}
        {loaded && state?.notFound && (
          <KernAlert title="Noch kein Text vorhanden" variant="info">
            Für diese Meldung liegt noch kein archivierter Text vor.
          </KernAlert>
        )}
        {loaded && state?.error && (
          <KernAlert title="Meldung nicht verfügbar" variant="danger">
            Der Text dieser Meldung konnte nicht geladen werden.
          </KernAlert>
        )}
        {loaded && state?.text && <p className="notice-dialog__text">{state.text}</p>}
      </div>
      {notice && (
        <div className="notice-dialog__footer">
          <KernLink
            href={notice.sourceUrl}
            target="_blank"
            rel="noreferrer"
            label="Original bei der KVV öffnen"
            icon="open-in-new"
            small
          />
        </div>
      )}
    </dialog>
  );
}

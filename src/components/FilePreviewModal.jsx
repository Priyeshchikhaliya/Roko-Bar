import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

export default function FilePreviewModal({
  error,
  kind,
  labels,
  loading,
  onClose,
  open,
  title,
  url,
}) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return undefined;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusDialog = window.requestAnimationFrame(() => {
      dialogRef.current?.querySelector("button")?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onCloseRef.current();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusDialog);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/55 p-3 md:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="w-full max-w-6xl border border-[#ECE8E4] bg-white text-[#1F1D1B]"
        ref={dialogRef}
        role="dialog"
      >
        <div className="flex items-center justify-between gap-4 border-b border-[#ECE8E4] px-4 py-3 md:px-5">
          <h2 className="font-display text-xl font-semibold md:text-2xl" id={titleId}>
            {title}
          </h2>
          <button
            aria-label={labels.close}
            className="inline-flex size-11 shrink-0 items-center justify-center border border-[#ECE8E4] bg-white text-2xl leading-none text-[#1F1D1B] transition-colors hover:border-[#A8392E] hover:text-[#A8392E]"
            onClick={onClose}
            title={labels.close}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="bg-[#FCFBFA] p-3 md:p-5">
          {loading ? (
            <div className="flex h-[70vh] items-center justify-center border border-[#ECE8E4] bg-white px-4 text-center text-sm text-muted">
              {labels.loading}
            </div>
          ) : null}

          {!loading && error ? (
            <div
              className="flex min-h-48 items-center justify-center border border-danger bg-white px-4 text-center text-sm font-semibold text-danger"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          {!loading && !error && url && kind === "pdf" ? (
            <iframe
              className="h-[70vh] w-full border border-[#ECE8E4] bg-white"
              src={url}
              title={title}
            />
          ) : null}

          {!loading && !error && url && kind === "image" ? (
            <div className="flex min-h-48 items-center justify-center border border-[#ECE8E4] bg-white p-3">
              <img
                alt={title}
                className="max-h-[70vh] max-w-full object-contain"
                src={url}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../context/useLanguage.js";

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export default function ConfirmModal({
  open,
  title,
  message,
  children,
  confirmLabel,
  cancelLabel,
  tone = "default",
  busy = false,
  onConfirm,
  onCancel,
}) {
  const { t } = useLanguage();
  const dialogRef = useRef(null);
  const busyRef = useRef(busy);
  const onCancelRef = useRef(onCancel);
  const onConfirmRef = useRef(onConfirm);
  const titleId = useId();
  const contentId = useId();

  useEffect(() => {
    busyRef.current = busy;
    onCancelRef.current = onCancel;
    onConfirmRef.current = onConfirm;
  });

  useEffect(() => {
    if (!open) return undefined;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusDialog = window.requestAnimationFrame(() => {
      const firstFocusable = dialogRef.current?.querySelector(FOCUSABLE_SELECTOR);
      (firstFocusable || dialogRef.current)?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!busyRef.current) onCancelRef.current();
        return;
      }

      if (event.key === "Enter" && !event.isComposing) {
        event.preventDefault();
        if (!busyRef.current) onConfirmRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) || [],
      );
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;
      if (
        event.shiftKey &&
        (activeElement === first || !dialogRef.current?.contains(activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (activeElement === last || !dialogRef.current?.contains(activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
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

  const labels = t.common.confirmModal;
  const confirmClass =
    tone === "danger"
      ? "border-danger bg-danger text-surface hover:bg-primary-hover"
      : "border-primary bg-primary text-surface hover:bg-primary-hover";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <div
        aria-describedby={contentId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="w-full max-w-lg border border-line bg-surface p-5 text-ink md:p-6"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <h2 className="font-display text-2xl font-semibold" id={titleId}>
          {title}
        </h2>
        <div className="mt-3 text-sm leading-6 text-muted" id={contentId}>
          {message ? <p>{message}</p> : null}
          {children}
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-line pt-4">
          <button
            className="min-h-11 border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-55"
            disabled={busy}
            onClick={onCancel}
            type="button"
          >
            {cancelLabel || labels.cancel}
          </button>
          <button
            className={`min-h-11 border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${confirmClass}`}
            disabled={busy}
            onClick={onConfirm}
            type="button"
          >
            {busy ? labels.busy : confirmLabel || labels.confirm}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

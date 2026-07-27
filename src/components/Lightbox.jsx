import { useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { photo } from "../lib/photos.js";

// Full-bleed photo viewer. Arrow keys and Escape work; focus returns to the
// thumbnail that opened it. Follows the same shell conventions as
// FilePreviewModal (portal, scroll lock, focus restore).
export default function Lightbox({ items, index, labels, onClose, onIndex }) {
  const dialogRef = useRef(null);
  const handlersRef = useRef({ onClose, onIndex });
  const titleId = useId();
  const open = index !== null;
  const count = items.length;

  useEffect(() => {
    handlersRef.current = { onClose, onIndex };
  });

  const step = useCallback(
    (delta) => {
      handlersRef.current.onIndex((index + delta + count) % count);
    },
    [count, index],
  );

  useEffect(() => {
    if (!open) return undefined;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusDialog = window.requestAnimationFrame(() => {
      dialogRef.current?.querySelector("button")?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handlersRef.current.onClose();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusDialog);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [open, step]);

  if (!open) return null;

  const current = items[index];
  const image = photo(current.name);
  const navButton =
    "inline-flex size-12 shrink-0 items-center justify-center border border-white/25 bg-black/40 text-2xl leading-none text-white transition-colors hover:border-white hover:bg-black/70";

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex flex-col bg-ink/95 p-3 md:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="flex h-full w-full flex-col gap-4"
        ref={dialogRef}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <p
            className="max-w-3xl text-sm leading-relaxed text-white/85"
            id={titleId}
          >
            {current.caption}
          </p>
          <button
            aria-label={labels.close}
            className={navButton}
            onClick={onClose}
            title={labels.close}
            type="button"
          >
            ×
          </button>
        </div>

        <div
          className="flex min-h-0 flex-1 items-center justify-center"
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <img
            alt={current.alt}
            className="max-h-full max-w-full object-contain"
            height={image.height}
            src={image.full}
            width={image.width}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            aria-label={labels.previous}
            className={navButton}
            onClick={() => step(-1)}
            title={labels.previous}
            type="button"
          >
            ‹
          </button>
          <p className="text-xs uppercase tracking-[0.18em] text-white/60">
            {index + 1} / {count}
          </p>
          <button
            aria-label={labels.next}
            className={navButton}
            onClick={() => step(1)}
            title={labels.next}
            type="button"
          >
            ›
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

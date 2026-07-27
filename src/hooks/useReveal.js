import { useCallback, useEffect, useRef } from "react";

// Progressive enhancement flag, set at import time so it lands before first
// paint. The `.reveal` starting state is scoped to it in index.css, so if this
// module never runs — bundle fails, ancient browser — content simply renders
// visible instead of being stranded at opacity 0.
if (
  typeof document !== "undefined" &&
  typeof IntersectionObserver !== "undefined"
) {
  document.documentElement.dataset.reveal = "on";
}

// Shrinking the root 16% from the bottom means a block has to climb properly
// into view before it fires. Triggering at the very bottom edge, as a small
// threshold does, finishes the whole transition before you have looked at it.
const OPTIONS = { rootMargin: "0px 0px -16% 0px", threshold: 0 };

function show(node) {
  node.dataset.shown = "true";
}

// Returns one stable callback ref that can be attached to any number of
// elements. Each flips to data-shown="true" the first time it enters view.
//
// The observer is owned by the effect, not by the ref callback, and the set of
// pending nodes is kept separately. React 18 StrictMode re-runs effects without
// re-attaching refs, so an observer created during ref attachment would be
// disconnected by the first cleanup and never repopulated — which silently
// leaves every section invisible in dev. Rebuilding from `pending` on each
// effect run makes the hook survive that cycle.
export default function useReveal() {
  const pendingRef = useRef(new Set());
  const observerRef = useRef(null);

  const register = useCallback((node) => {
    if (!node || node.dataset.shown === "true") return;
    pendingRef.current.add(node);
    // If the observer is already live, pick this node up right away.
    observerRef.current?.observe(node);
  }, []);

  useEffect(() => {
    const pending = pendingRef.current;

    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      pending.forEach(show);
      pending.clear();
      return undefined;
    }

    const observer = new IntersectionObserver((entries, self) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        show(entry.target);
        self.unobserve(entry.target);
        pending.delete(entry.target);
      }
    }, OPTIONS);

    observerRef.current = observer;
    pending.forEach((node) => observer.observe(node));

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, []);

  return register;
}

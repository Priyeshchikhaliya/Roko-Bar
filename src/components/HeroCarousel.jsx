import { useCallback, useEffect, useRef, useState } from "react";
import { photo } from "../lib/photos.js";

const INTERVAL = 6500;

// Crossfading background for the home hero.
//
// Treated as one decorative unit: the individual frames carry no alt text and
// the group gets a single label, so a screen reader hears the venue described
// once instead of announcing a new photo every few seconds. The headline
// carries the actual message.
export default function HeroCarousel({ names, label, labels }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const clear = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (names.length < 2 || paused) return undefined;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return undefined;

    const advance = () => setActive((current) => (current + 1) % names.length);
    const start = () => {
      clear();
      timerRef.current = window.setInterval(advance, INTERVAL);
    };

    // Don't burn timers and decode work on a tab nobody is looking at.
    const onVisibility = () => (document.hidden ? clear() : start());

    start();
    document.addEventListener("visibilitychange", onVisibility);
    motion.addEventListener("change", onVisibility);

    return () => {
      clear();
      document.removeEventListener("visibilitychange", onVisibility);
      motion.removeEventListener("change", onVisibility);
    };
  }, [clear, names.length, paused]);

  return (
    <>
      <div
        aria-label={label}
        className="absolute inset-0 z-0 overflow-hidden bg-ink"
        role="img"
      >
        {names.map((name, index) => {
          const image = photo(name);
          return (
            <img
              alt=""
              aria-hidden="true"
              className="hero-slide"
              data-active={index === active}
              decoding="async"
              fetchpriority={index === 0 ? "high" : undefined}
              height={image.height}
              key={name}
              loading={index === 0 ? "eager" : "lazy"}
              sizes="100vw"
              src={image.src}
              srcSet={image.srcSet}
              width={image.width}
            />
          );
        })}
      </div>

      <div aria-hidden="true" className="hero-scrim z-[1]" />
      <div aria-hidden="true" className="hero-grain z-[2]" />

      {names.length > 1 ? (
        <div className="absolute bottom-6 right-0 z-10 md:bottom-10">
          <div className="container-wide flex items-center justify-end gap-2">
            {names.map((name, index) => (
              <button
                aria-current={index === active}
                aria-label={labels.goTo.replace("{n}", index + 1)}
                className="group py-2"
                key={name}
                onBlur={() => setPaused(false)}
                onClick={() => setActive(index)}
                onFocus={() => setPaused(true)}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                type="button"
              >
                <span className="hero-tick block" data-active={index === active} />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

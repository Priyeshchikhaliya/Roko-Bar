import { useState } from "react";
import Lightbox from "./Lightbox.jsx";
import Photo from "./Photo.jsx";

// Grid of tappable photos backed by a shared lightbox.
export default function PhotoGrid({
  items,
  labels,
  aspect = "aspect-[4/3]",
  columns = "sm:grid-cols-2 lg:grid-cols-4",
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
  tone = "light",
}) {
  const [index, setIndex] = useState(null);
  const dark = tone === "dark";
  const frame = dark
    ? "border-surface/20 bg-surface/20"
    : "border-line bg-line";
  const tile = dark ? "bg-ink" : "bg-surface";

  return (
    <>
      <ul className={`grid gap-px border ${frame} ${columns}`}>
        {items.map((item, position) => (
          <li key={item.name}>
            <button
              className={`group relative block w-full cursor-zoom-in ${tile} text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary`}
              onClick={() => setIndex(position)}
              type="button"
            >
              <Photo
                alt={item.alt}
                className={`${aspect} w-full object-cover transition-opacity group-hover:opacity-85`}
                name={item.name}
                sizes={sizes}
              />
              <span className="sr-only">{labels.enlarge}</span>
            </button>
          </li>
        ))}
      </ul>

      <Lightbox
        index={index}
        items={items}
        labels={labels}
        onClose={() => setIndex(null)}
        onIndex={setIndex}
      />
    </>
  );
}

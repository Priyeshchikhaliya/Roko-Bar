import { useState } from "react";
import Lightbox from "./Lightbox.jsx";
import Photo from "./Photo.jsx";

// Editorial bento grid: one large tile anchors the block and the rest fill in
// around it. Each item carries its own span classes; the set in About.jsx is
// chosen so both the 2-column and 3-column arrangements fill completely, with
// no bare cells showing the divider colour.
//
// A constant scrim sits over every tile. The photos range from a bright
// house-lights room to a near-black dance floor, and without it the grid reads
// as a set of unrelated images rather than one block.
export default function PhotoMosaic({ items, labels }) {
  const [index, setIndex] = useState(null);

  return (
    <>
      <ul className="grid auto-rows-[8.5rem] grid-cols-2 gap-px border-y border-line bg-line sm:auto-rows-[11rem] lg:auto-rows-[14rem] lg:grid-cols-3">
        {items.map((item, position) => (
          <li className={item.span} key={item.name}>
            <button
              className="group relative block h-full w-full cursor-zoom-in overflow-hidden bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
              onClick={() => setIndex(position)}
              type="button"
            >
              <Photo
                alt={item.alt}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                name={item.name}
                sizes={item.sizes}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 transition-opacity duration-500 group-hover:opacity-70"
                style={{
                  background:
                    "linear-gradient(to top, rgba(31,29,27,0.5) 0%, rgba(31,29,27,0.12) 45%, rgba(31,29,27,0.04) 100%)",
                }}
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

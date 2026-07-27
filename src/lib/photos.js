// Central registry for the venue photo set.
//
// Source files live in src/assets/photos as <name>-<width>.webp at 400/800/1600.
// They are generated from the raw HEIC shoot; metadata (incl. GPS) is stripped
// and orientation is baked in, so the intrinsic sizes below are final.

const WIDTHS = [400, 800, 1600];

const files = import.meta.glob("../assets/photos/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});

const urls = {};
for (const [path, url] of Object.entries(files)) {
  const match = path.match(/\/([a-z-]+)-(\d+)\.webp$/);
  if (!match) continue;
  const [, name, width] = match;
  (urls[name] ??= {})[Number(width)] = url;
}

// Intrinsic dimensions of the largest rendition, used to reserve layout space.
const SIZES = {
  "stop-city": [1200, 1600],
  "stop-klinikum": [1200, 1600],
  "arrival-sign": [1200, 1600],
  "basement-door": [1200, 1600],
  "stairs-outside": [1200, 1600],
  "entrance-corridor": [1200, 1600],
  "club-bar-sign": [1200, 1600],
  "bar-counter": [1600, 1200],
  "room-wide": [1600, 1200],
  "room-from-bar": [1600, 1200],
  "bar-night": [1600, 1200],
  "dancefloor-night": [1600, 1200],
  "backbar": [1600, 1200],
  "room-night": [1600, 1200],
  "counter-night": [1600, 1200],
  "tower": [1600, 679],
};

export function photo(name) {
  const rendition = urls[name];
  if (!rendition) {
    throw new Error(`Unknown photo "${name}"`);
  }
  const [width, height] = SIZES[name];
  return {
    name,
    width,
    height,
    src: rendition[800],
    full: rendition[1600],
    srcSet: WIDTHS.filter((w) => rendition[w])
      .map((w) => `${rendition[w]} ${w}w`)
      .join(", "),
  };
}

// Pairs photo names with their translated alt text and caption.
export function toItems(names, dict) {
  return names.map((name) => ({ name, ...dict[name] }));
}

// Square tutor portraits, kept separate from the venue set: different source
// folder, different renditions, and they are never fed to the lightbox.
const peopleFiles = import.meta.glob("../assets/people/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});

const people = {};
for (const [path, url] of Object.entries(peopleFiles)) {
  const match = path.match(/\/([a-z]+)-(\d+)\.webp$/);
  if (!match) continue;
  const [, name, width] = match;
  (people[name] ??= {})[Number(width)] = url;
}

export function portrait(name) {
  const rendition = people[name];
  if (!rendition) return null;
  return {
    src: rendition[320],
    srcSet: `${rendition[320]} 320w, ${rendition[640]} 640w`,
  };
}

// Ordered arrival sequence, from the bus stop down to the bar door.
// Step order follows what is visible in each frame; captions live in i18n.
export const WAYFINDING = [
  "stop-city",
  "stop-klinikum",
  "arrival-sign",
  "stairs-outside",
  "basement-door",
  "entrance-corridor",
  "club-bar-sign",
];

// The room with the house lights up — what you are actually renting.
export const INTERIOR_DAY = [
  "room-wide",
  "room-from-bar",
  "bar-counter",
  "backbar",
];

// The room with the rig on.
export const INTERIOR_NIGHT = [
  "dancefloor-night",
  "room-night",
  "bar-night",
  "counter-night",
];

export const GALLERY = [...INTERIOR_NIGHT, ...INTERIOR_DAY];

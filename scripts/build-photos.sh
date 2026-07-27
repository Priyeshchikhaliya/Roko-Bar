#!/usr/bin/env bash
#
# Regenerates the web-ready photo sets from the raw camera originals.
#
#   ./scripts/build-photos.sh
#
# Requires ImageMagick with HEIC support (Debian/Ubuntu:
# `sudo apt install imagemagick libheif1 heif-gdk-pixbuf`).
#
# Why this exists: the originals are HEIC, which Chrome, Firefox and Edge
# cannot decode, and the raw files run 1-3 MB each. This emits WebP at three
# widths (400/800/1600) with metadata stripped -- HEICs off a phone carry GPS
# EXIF, and the tutor portraits are photos of real people.
#
# Outputs are committed, so you only need to rerun this when the source
# photos change. src/lib/photos.js maps the semantic names below to renditions
# and holds the intrinsic dimensions; update SIZES there if you add a photo.

set -euo pipefail

cd "$(dirname "$0")/.."

RAW_VENUE="src/assets/bar-images"
RAW_PEOPLE="src/assets/tutors-profile"
OUT_VENUE="src/assets/photos"
OUT_PEOPLE="src/assets/people"

command -v convert >/dev/null || { echo "ImageMagick 'convert' not found" >&2; exit 1; }

# semantic-name:source-file
VENUE=(
  "stop-city:$RAW_VENUE/IMG_0520.HEIC"
  "stop-klinikum:$RAW_VENUE/IMG_0521.HEIC"
  "arrival-sign:$RAW_VENUE/IMG_0522.HEIC"
  "basement-door:$RAW_VENUE/IMG_0523.HEIC"
  "stairs-outside:$RAW_VENUE/IMG_0524.HEIC"
  "entrance-corridor:$RAW_VENUE/IMG_0525.HEIC"
  "club-bar-sign:$RAW_VENUE/IMG_0526.HEIC"
  "bar-counter:$RAW_VENUE/IMG_0527.HEIC"
  "room-wide:$RAW_VENUE/IMG_0528.HEIC"
  "room-from-bar:$RAW_VENUE/IMG_0529.HEIC"
  "bar-night:$RAW_VENUE/IMG_0530.HEIC"
  "dancefloor-night:$RAW_VENUE/IMG_0531.HEIC"
  "backbar:$RAW_VENUE/IMG_0532.HEIC"
  "room-night:$RAW_VENUE/IMG_0534.HEIC"
  "counter-night:$RAW_VENUE/IMG_0535.HEIC"
)
# IMG_0533 is a near-duplicate of IMG_0532 and is intentionally skipped.

mkdir -p "$OUT_VENUE" "$OUT_PEOPLE"

echo "venue photos -> $OUT_VENUE"
for entry in "${VENUE[@]}"; do
  name="${entry%%:*}"
  src="${entry#*:}"
  [ -f "$src" ] || { echo "  missing source: $src" >&2; exit 1; }
  for width in 1600 800 400; do
    convert "$src" -auto-orient -strip -resize "${width}x${width}>" \
      -quality 74 -define webp:method=6 "$OUT_VENUE/${name}-${width}.webp"
  done
  echo "  $name"
done

# The tower shot is the one venue image not from the HEIC set. Its original
# (src/assets/roko_image.png, 3168x1344) is no longer in the tree, so the
# committed tower-*.webp renditions are the masters. Drop a replacement
# original at the path below and this block will pick it up again.
TOWER_SRC="src/assets/roko_image.png"
if [ -f "$TOWER_SRC" ]; then
  for width in 1600 800 400; do
    convert "$TOWER_SRC" -auto-orient -strip -resize "${width}x${width}>" \
      -quality 74 -define webp:method=6 "$OUT_VENUE/tower-${width}.webp"
  done
  echo "  tower"
else
  echo "  tower (skipped: no original at $TOWER_SRC, keeping committed webp)"
fi

echo "tutor portraits -> $OUT_PEOPLE"
for src in "$RAW_PEOPLE"/*; do
  [ -e "$src" ] || continue
  base="$(basename "$src")"
  name="$(echo "${base%.*}" | tr '[:upper:]' '[:lower:]')"
  # Square crop from the centre so every card matches.
  for width in 640 320; do
    convert "$src" -auto-orient -strip -gravity center \
      -resize "${width}x${width}^" -extent "${width}x${width}" \
      -quality 80 -define webp:method=6 "$OUT_PEOPLE/${name}-${width}.webp"
  done
  echo "  $name"
done

echo
echo "venue:  $(du -sh "$OUT_VENUE" | cut -f1)"
echo "people: $(du -sh "$OUT_PEOPLE" | cut -f1)"

import { photo } from "../lib/photos.js";

// Responsive <img> for the venue photo set. Always emits intrinsic dimensions
// so the browser reserves the right box before the file lands.
export default function Photo({
  name,
  alt,
  className = "",
  priority = false,
  sizes = "100vw",
  ...rest
}) {
  const image = photo(name);

  return (
    <img
      alt={alt}
      className={className}
      decoding="async"
      fetchpriority={priority ? "high" : undefined}
      height={image.height}
      loading={priority ? "eager" : "lazy"}
      sizes={sizes}
      src={image.src}
      srcSet={image.srcSet}
      width={image.width}
      {...rest}
    />
  );
}

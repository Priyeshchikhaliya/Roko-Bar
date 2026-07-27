import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/useLanguage.js";
import Photo from "../components/Photo.jsx";
import PhotoGrid from "../components/PhotoGrid.jsx";
import { toItems } from "../lib/photos.js";

// The tower is a 2.4:1 panorama and is handled separately as a full-bleed
// band; cropping it square for the mosaic threw away the framing that makes it
// the best shot in the set.
const ABOUT_PHOTOS = [
  "club-bar-sign",
  "room-night",
  "backbar",
  "room-wide",
  "counter-night",
  "bar-counter",
  "room-from-bar",
  "dancefloor-night",
];

const LAT = 51.549126;
const LON = 9.939261;

const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
  LON - 0.002
}%2C${LAT - 0.0015}%2C${LON + 0.002}%2C${
  LAT + 0.0015
}&layer=mapnik&marker=${LAT}%2C${LON}`;

const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${LAT},${LON}`;
const geoLink = `geo:${LAT},${LON}?z=19`;

export default function About() {
  const { t } = useLanguage();
  const page = t.about;
  const mosaic = toItems(ABOUT_PHOTOS, t.common.photos);

  useEffect(() => {
    document.title = page.pageTitle;
  }, [page.pageTitle]);

  return (
    <>
      <Helmet>
        <title>{page.pageTitle}</title>
        <meta name="description" content={page.seoDescription} />
        <link rel="canonical" href={t.common.canonical.about} />
        <html lang={t.common.htmlLang} />
      </Helmet>

      <section className="editorial-section section-paper section-pad border-t-0">
        <div className="container-wide grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div className="space-y-5">
            <p className="eyebrow">{t.nav.about}</p>
            <h1 className="hero-title max-w-5xl">{page.title}</h1>
          </div>
          <div className="space-y-5">
            <p className="lead text-xl">{page.subtitle}</p>
            {page.introParagraphs.map((paragraph) => (
              <p key={paragraph} className="lead">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-section section-surface">
        <figure className="relative">
          <Photo
            alt={t.common.photos.tower.alt}
            className="h-[34vh] min-h-[15rem] w-full object-cover md:h-[52vh]"
            name="tower"
            sizes="100vw"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-28"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0))",
            }}
          />
          <figcaption className="absolute inset-x-0 bottom-0">
            <div className="container-wide py-5 md:py-7">
              <p className="eyebrow text-surface/90">{t.common.dormName}</p>
            </div>
          </figcaption>
        </figure>
      </section>

      <section className="editorial-section section-surface">
        <PhotoGrid
          aspect="aspect-square"
          columns="grid-cols-2 md:grid-cols-4"
          items={mosaic}
          labels={t.common.gallery}
          sizes="(min-width: 768px) 25vw, 50vw"
        />
      </section>

      <section className="editorial-section section-paper section-pad">
        <div className="container-wide grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-10">
            <div className="space-y-5">
              <span className="accent-rule" />
              <h2 className="section-title max-w-3xl">{page.vibeTitle}</h2>
              <ul className="grid gap-4">
                {page.vibePoints.map((point) => (
                  <li key={point} className="flex gap-4">
                    <span className="square-bullet" />
                    <span className="leading-relaxed text-muted">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flat-panel space-y-5">
            <h2 className="text-4xl font-semibold">{page.barTitle}</h2>
            {page.barParagraphs.map((paragraph) => (
              <p key={paragraph} className="lead">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-section section-surface section-pad">
        <div className="container-wide grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="flat-panel flex flex-col justify-between gap-10">
            <div className="space-y-6">
              <div className="space-y-4">
                <span className="accent-rule" />
                <h2 className="section-title">{page.contactTitle}</h2>
              </div>

              <div className="grid gap-5 text-base">
                <div>
                  <p className="eyebrow">{page.addressLabel}</p>
                  <p className="mt-2">
                    {t.common.address.line1}
                    <br />
                    {t.common.address.line2}
                  </p>
                </div>

                <div>
                  <p className="eyebrow">{page.emailLabel}</p>
                  <a
                    href={`mailto:${t.common.email}`}
                    className="mt-2 inline-flex underline underline-offset-4"
                  >
                    {t.common.email}
                  </a>
                </div>
              </div>

              <p className="lead text-base">{page.mapHint}</p>
              <p className="lead text-base">{page.directionsText}</p>
            </div>

            <a
              href={geoLink}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => {
                if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                  event.preventDefault();
                  window.location.href = gmapsUrl;
                }
              }}
              className="btn-secondary w-fit text-xs md:text-sm"
            >
              {page.gmapsLabel}
            </a>
          </div>

          <div className="border border-line min-h-[30rem]">
            <iframe
              title={page.mapTitle}
              src={osmEmbedUrl}
              className="h-full min-h-[30rem] w-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </>
  );
}

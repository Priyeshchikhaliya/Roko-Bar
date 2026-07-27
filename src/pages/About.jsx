import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/useLanguage.js";
import Photo from "../components/Photo.jsx";
import PhotoMosaic from "../components/PhotoMosaic.jsx";
import useReveal from "../hooks/useReveal.js";

// Span classes are picked so the grid fills completely at both 2 and 3 columns:
//
//   3 cols            2 cols
//   [ A A ][ B ]      [ A A ]
//   [ A A ][ B ]      [ A A ]
//   [C][D][E]         [ B ][ C ]
//                     [ D ][ E ]
//
// A leftover cell would show the divider colour as a grey block, so the count
// and the spans have to agree.
const MOSAIC = [
  {
    name: "dancefloor-night",
    span: "col-span-2 row-span-2",
    sizes: "(min-width: 1024px) 66vw, 100vw",
  },
  {
    name: "club-bar-sign",
    span: "lg:row-span-2",
    sizes: "(min-width: 1024px) 33vw, 50vw",
  },
  { name: "room-wide", sizes: "(min-width: 1024px) 33vw, 50vw" },
  { name: "backbar", sizes: "(min-width: 1024px) 33vw, 50vw" },
  { name: "counter-night", sizes: "(min-width: 1024px) 33vw, 50vw" },
];

export default function About() {
  const { t } = useLanguage();
  const page = t.about;
  const reveal = useReveal();
  const photos = t.common.photos;
  const mosaic = MOSAIC.map((tile) => ({ ...tile, ...photos[tile.name] }));

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
            alt={photos.tower.alt}
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
        <PhotoMosaic items={mosaic} labels={t.common.gallery} />
      </section>

      <section className="editorial-section section-paper section-pad">
        <div
          className="container-wide reveal grid gap-10 lg:grid-cols-[0.85fr_1.15fr]"
          ref={reveal}
        >
          <div className="space-y-5">
            <span className="accent-rule" />
            <h2 className="section-title max-w-3xl">{page.vibeTitle}</h2>
            <ul className="grid gap-4 pt-2">
              {page.vibePoints.map((point) => (
                <li key={point} className="flex gap-4">
                  <span className="square-bullet" />
                  <span className="leading-relaxed text-muted">{point}</span>
                </li>
              ))}
            </ul>
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
        <div
          className="container-wide reveal flex flex-col gap-10 md:flex-row md:items-end md:justify-between"
          ref={reveal}
        >
          <div className="max-w-3xl space-y-5">
            <span className="accent-rule" />
            <p className="eyebrow">{page.closingKicker}</p>
            <h2 className="section-title">{page.closingTitle}</h2>
            <p className="lead max-w-2xl">{page.closingText}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row md:shrink-0">
            <Link
              to={t.common.links.directions}
              className="btn-secondary w-full sm:w-fit"
            >
              {page.closingDirections}
            </Link>
            <Link
              to={t.common.links.booking}
              className="btn-primary w-full sm:w-fit"
            >
              {page.closingBooking}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

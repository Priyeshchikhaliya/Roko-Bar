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

const TRAIL = { "--reveal-delay": "140ms" };

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
        <div className="container-wide grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div className="reveal space-y-5" ref={reveal}>
            <span className="accent-rule" />
            <p className="eyebrow">{t.nav.about}</p>
            <h1 className="hero-title max-w-4xl">{page.title}</h1>
          </div>

          <div className="reveal space-y-6" ref={reveal} style={TRAIL}>
            {/* The opening line carries the page. Keeping it at text colour and
                a size above the body copy gives the column a top instead of a
                flat wall of grey. */}
            <p className="max-w-2xl text-xl leading-relaxed text-ink md:text-2xl">
              {page.subtitle}
            </p>
            <div className="space-y-4 border-l border-line pl-6">
              {page.introParagraphs.map((paragraph) => (
                <p key={paragraph} className="lead max-w-2xl">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-section section-surface">
        <figure className="reveal relative" ref={reveal}>
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
        <div className="reveal" ref={reveal}>
          <PhotoMosaic items={mosaic} labels={t.common.gallery} />
        </div>
      </section>

      <section className="editorial-section section-paper section-pad">
        <div className="container-wide space-y-14">
          <div
            className="reveal grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end"
            ref={reveal}
          >
            <div className="space-y-4">
              <span className="accent-rule" />
              <p className="eyebrow">{page.vibeKicker}</p>
              <h2 className="section-title max-w-2xl">{page.vibeTitle}</h2>
            </div>
            <p className="lead max-w-2xl lg:ml-auto">{page.vibeIntro}</p>
          </div>

          <dl
            className="reveal grid gap-px border-t border-line"
            ref={reveal}
            style={TRAIL}
          >
            {page.vibePoints.map((point) => (
              <div
                key={point.title}
                className="grid gap-3 border-b border-line py-7 md:grid-cols-[0.4fr_0.6fr] md:gap-10 md:py-9"
              >
                <dt className="font-display text-2xl font-semibold leading-tight md:text-3xl">
                  {point.title}
                </dt>
                <dd className="lead max-w-2xl">{point.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Dark block between two light ones, mirroring the rhythm on the home
          page. It also gives the bar's own description somewhere to sit that
          does not look like an afterthought panel. */}
      <section className="editorial-section section-ink section-pad">
        <div className="container-wide grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
          <div className="reveal space-y-4" ref={reveal}>
            <span className="accent-rule" />
            <p className="eyebrow">{page.barKicker}</p>
            <h2 className="section-title max-w-2xl">{page.barTitle}</h2>
          </div>

          {/* One stacked column rather than two short ones: paired against a
              three-line display heading, two thin columns left the block
              bottom-heavy with empty space. */}
          <div className="reveal space-y-6" ref={reveal} style={TRAIL}>
            {page.barParagraphs.map((paragraph) => (
              <p key={paragraph} className="lead max-w-2xl text-lg">
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

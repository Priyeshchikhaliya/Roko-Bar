import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/useLanguage.js";
import Lightbox from "../components/Lightbox.jsx";
import Photo from "../components/Photo.jsx";
import useReveal from "../hooks/useReveal.js";
import { toItems } from "../lib/photos.js";

const LAT = 51.549126;
const LON = 9.939261;

const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
  LON - 0.002
}%2C${LAT - 0.0015}%2C${LON + 0.002}%2C${
  LAT + 0.0015
}&layer=mapnik&marker=${LAT}%2C${LON}`;

const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${LAT},${LON}`;

const TRAIL = { "--reveal-delay": "140ms" };

export default function Directions() {
  const { t } = useLanguage();
  const page = t.directions;
  const photos = t.common.photos;
  const reveal = useReveal();
  const [index, setIndex] = useState(null);

  // Flat list backing the lightbox, in the order the steps render.
  const sequence = toItems(
    page.steps.flatMap((step) => step.photos),
    photos,
  );

  // Index of each step's first photo within `sequence`.
  const offsets = page.steps.reduce(
    (acc, step) => [...acc, acc[acc.length - 1] + step.photos.length],
    [0],
  );

  useEffect(() => {
    document.title = page.pageTitle;
  }, [page.pageTitle]);

  return (
    <>
      <Helmet>
        <title>{page.pageTitle}</title>
        <meta name="description" content={page.seoDescription} />
        <link rel="canonical" href={t.common.canonical.directions} />
        <html lang={t.common.htmlLang} />
      </Helmet>

      <section className="editorial-section section-paper section-pad border-t-0">
        <div className="container-wide grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div className="reveal space-y-5" ref={reveal}>
            <span className="accent-rule" />
            <p className="eyebrow">{t.nav.directions}</p>
            <h1 className="hero-title max-w-3xl">{page.title}</h1>
          </div>
          <div className="reveal space-y-6" ref={reveal} style={TRAIL}>
            <p className="max-w-2xl text-xl leading-relaxed text-ink md:text-2xl">
              {page.intro}
            </p>
            <p className="border-l border-primary pl-6 text-base leading-relaxed">
              {t.common.address.line1}
              <br />
              {t.common.address.line2}
            </p>
          </div>
        </div>
      </section>

      <section className="editorial-section section-ink section-pad">
        <div className="container-wide grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16">
          <div className="reveal space-y-4" ref={reveal}>
            <span className="accent-rule" />
            <p className="eyebrow">{page.transitKicker}</p>
            <h2 className="section-title">{page.transitTitle}</h2>
          </div>

          <div className="reveal space-y-8" ref={reveal} style={TRAIL}>
            <div className="space-y-4">
              <p className="eyebrow">{page.linesLabel}</p>
              <ul className="flex flex-wrap gap-2">
                {page.lines.map((line) => (
                  <li
                    className="display-figure border border-surface/25 px-4 py-2 text-2xl text-surface md:text-3xl"
                    key={line}
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <p className="eyebrow">{page.nightLinesLabel}</p>
              <ul className="flex flex-wrap gap-2">
                {page.nightLines.map((line) => (
                  <li
                    className="display-figure border border-primary/70 px-4 py-2 text-2xl text-primary md:text-3xl"
                    key={line}
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <p className="lead max-w-2xl text-base">{page.transitNote}</p>
          </div>
        </div>
      </section>

      <section className="editorial-section section-surface section-pad">
        <div className="container-wide space-y-16">
          <div
            className="reveal grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end"
            ref={reveal}
          >
            <div className="space-y-4">
              <span className="accent-rule" />
              <p className="eyebrow">{page.routeKicker}</p>
              <h2 className="section-title max-w-2xl">{page.routeTitle}</h2>
            </div>
            <p className="lead max-w-2xl lg:ml-auto">{page.routeIntro}</p>
          </div>

          {/* The route drawn as a route: one rule running down the page with a
              numbered node per step, content alternating across it on wide
              screens. Narrow screens move the rule to the left edge and hang
              everything off it in a single column. */}
          {/* The rule lives outside the list: an <ol> may only contain <li>,
              and a stray child also shifts every :nth-child() index. */}
          <div className="relative">
            <span
              aria-hidden="true"
              className="absolute bottom-6 left-[1.4375rem] top-3 w-px bg-line xl:left-1/2"
            />

            <ol>
              {page.steps.map((step, stepIndex) => {
                const textLeft = stepIndex % 2 === 0;
                return (
                  <li
                    className="reveal relative grid gap-6 pb-14 pl-16 last:pb-0 xl:grid-cols-[1fr_5rem_1fr] xl:gap-y-0 xl:pb-24 xl:pl-0"
                    key={step.heading}
                    ref={reveal}
                  >
                    <span className="absolute left-0 top-0 flex size-12 items-center justify-center border border-line bg-surface xl:static xl:col-start-2 xl:row-start-1 xl:justify-self-center">
                      <span className="display-figure text-xl text-primary">
                        {String(stepIndex + 1).padStart(2, "0")}
                      </span>
                    </span>

                    <div
                      className={`space-y-3 xl:row-start-1 ${
                        textLeft
                          ? "xl:col-start-1 xl:pr-12 xl:text-right"
                          : "xl:col-start-3 xl:pl-12"
                      }`}
                    >
                      <h3 className="font-display text-3xl font-semibold leading-tight md:text-4xl">
                        {step.heading}
                      </h3>
                      <p
                        className={`lead text-base ${
                          textLeft ? "xl:ml-auto xl:max-w-sm" : "xl:max-w-sm"
                        }`}
                      >
                        {step.text}
                      </p>
                    </div>

                    <div
                      className={`flex xl:row-start-1 ${
                        textLeft
                          ? "xl:col-start-3 xl:justify-start xl:pl-12"
                          : "xl:col-start-1 xl:justify-end xl:pr-12"
                      }`}
                    >
                      <div className="flex h-fit w-fit gap-px border border-line bg-line">
                        {step.photos.map((name, photoIndex) => (
                          <button
                            className="group block w-32 cursor-zoom-in overflow-hidden bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:w-48 md:w-56 lg:w-64 xl:w-56"
                            key={name}
                            onClick={() =>
                              setIndex(offsets[stepIndex] + photoIndex)
                            }
                            type="button"
                          >
                            <Photo
                              alt={photos[name].alt}
                              className="aspect-[3/4] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                              name={name}
                              sizes="(min-width: 1280px) 224px, (min-width: 1024px) 256px, (min-width: 768px) 224px, (min-width: 640px) 192px, 128px"
                            />
                            <span className="sr-only">
                              {t.common.gallery.enlarge}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div
            className="reveal flat-panel border-l-2 border-l-primary"
            ref={reveal}
          >
            <p className="lead max-w-3xl text-base">{page.accessNote}</p>
          </div>
        </div>
      </section>

      <section className="editorial-section section-paper section-pad">
        <div className="container-wide grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div
            className="reveal flat-panel flex flex-col justify-between gap-10"
            ref={reveal}
          >
            <div className="space-y-5">
              <span className="accent-rule" />
              <h2 className="text-3xl font-semibold">{page.helpTitle}</h2>
              <p className="lead">{page.helpText}</p>
              <a
                href={`mailto:${t.common.email}`}
                className="inline-flex underline underline-offset-4"
              >
                {t.common.email}
              </a>
            </div>

            <a
              href={gmapsUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary w-fit text-xs md:text-sm"
            >
              {page.gmapsLabel}
            </a>
          </div>

          <div className="reveal border border-line min-h-[26rem]" ref={reveal}>
            <iframe
              title={page.mapTitle}
              src={osmEmbedUrl}
              className="h-full min-h-[26rem] w-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <Lightbox
        index={index}
        items={sequence}
        labels={t.common.gallery}
        onClose={() => setIndex(null)}
        onIndex={setIndex}
      />
    </>
  );
}

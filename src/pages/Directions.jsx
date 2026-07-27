import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/useLanguage.js";
import Lightbox from "../components/Lightbox.jsx";
import Photo from "../components/Photo.jsx";
import { toItems } from "../lib/photos.js";

const LAT = 51.549126;
const LON = 9.939261;

const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
  LON - 0.002
}%2C${LAT - 0.0015}%2C${LON + 0.002}%2C${
  LAT + 0.0015
}&layer=mapnik&marker=${LAT}%2C${LON}`;

const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${LAT},${LON}`;

export default function Directions() {
  const { t } = useLanguage();
  const page = t.directions;
  const photos = t.common.photos;
  const [index, setIndex] = useState(null);

  // Flat list backing the lightbox, in the same order the steps render.
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
        <div className="container-wide grid gap-10 md:grid-cols-[1fr_1fr] md:items-end">
          <div className="space-y-5">
            <p className="eyebrow">{t.nav.directions}</p>
            <h1 className="hero-title max-w-4xl">{page.title}</h1>
          </div>
          <div className="space-y-6">
            <p className="lead">{page.intro}</p>
            <div className="border-l border-primary pl-5 text-base text-ink">
              {t.common.address.line1}
              <br />
              {t.common.address.line2}
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-section section-ink section-pad">
        <div className="container-wide grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div className="space-y-4">
            <p className="eyebrow">{page.transitKicker}</p>
            <h2 className="section-title">{page.transitTitle}</h2>
          </div>

          <div className="space-y-8">
            <dl className="grid gap-px border border-surface/20 bg-surface/20 sm:grid-cols-3">
              {[
                { label: page.stopLabel, value: page.stopName },
                { label: page.linesLabel, value: page.lines },
                { label: page.nightLinesLabel, value: page.nightLines },
              ].map((fact) => (
                <div key={fact.label} className="bg-ink p-5 md:p-6">
                  <dt className="eyebrow">{fact.label}</dt>
                  <dd className="mt-3 font-display text-2xl font-semibold leading-tight text-surface md:text-3xl">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="lead">{page.transitNote}</p>
          </div>
        </div>
      </section>

      <section className="editorial-section section-surface section-pad">
        <div className="container-wide space-y-12">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div className="space-y-4">
              <span className="accent-rule" />
              <p className="eyebrow">{page.routeKicker}</p>
              <h2 className="section-title max-w-2xl">{page.routeTitle}</h2>
            </div>
            <p className="lead max-w-3xl lg:ml-auto">{page.routeIntro}</p>
          </div>

          <ol className="grid gap-px border border-line bg-line">
            {page.steps.map((step, stepIndex) => (
              <li
                key={step.heading}
                className="grid gap-8 bg-surface p-6 md:p-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12"
              >
                <div className="space-y-5">
                  <span className="font-display text-6xl font-semibold leading-none text-primary">
                    {String(stepIndex + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-3xl font-semibold">{step.heading}</h3>
                  <p className="lead">{step.text}</p>
                </div>

                <div className="flex w-fit items-start gap-px self-start border border-line bg-line">
                  {step.photos.map((name, photoIndex) => (
                    <button
                      key={name}
                      className="group block w-34 cursor-zoom-in bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:w-44 lg:w-64"
                      onClick={() => setIndex(offsets[stepIndex] + photoIndex)}
                      type="button"
                    >
                      <Photo
                        alt={photos[name].alt}
                        className="aspect-[3/4] w-full object-cover transition-opacity group-hover:opacity-85"
                        name={name}
                        sizes="(min-width: 1024px) 256px, (min-width: 640px) 176px, 136px"
                      />
                      <span className="sr-only">{t.common.gallery.enlarge}</span>
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ol>

          <div className="flat-panel flex flex-col gap-4 border-l-2 border-l-primary md:flex-row md:items-center md:justify-between">
            <p className="lead max-w-3xl text-base">{page.accessNote}</p>
          </div>
        </div>
      </section>

      <section className="editorial-section section-paper section-pad">
        <div className="container-wide grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flat-panel flex flex-col justify-between gap-10">
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

          <div className="border border-line min-h-[26rem]">
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

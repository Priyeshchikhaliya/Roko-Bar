import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/useLanguage.js";
import rokoImage from "../assets/roko_image.jpeg";
import section1 from "../assets/section1.png";
import section2 from "../assets/section2.png";

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
        <div className="grid grid-cols-2 border-b border-line md:grid-cols-4">
          <img
            src={rokoImage}
            alt={page.imageAlt}
            className="aspect-square w-full border-r border-line object-cover"
          />
          <img
            src={section1}
            alt={page.imageAlt}
            className="aspect-square w-full border-r border-line object-cover"
          />
          <img
            src={section2}
            alt={page.imageAlt}
            className="aspect-square w-full border-r border-line object-cover"
          />
          <div className="aspect-square bg-paper p-5 flex items-end text-xs uppercase tracking-[0.16em] text-muted">
            {t.common.ui.placeholderImage}
          </div>
        </div>
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

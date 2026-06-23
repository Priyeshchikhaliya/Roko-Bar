import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/useLanguage.js";

const LAT = 51.549126;
const LON = 9.939261;

const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
  LON - 0.002
}%2C${LAT - 0.0015}%2C${LON + 0.002}%2C${
  LAT + 0.0015
}&layer=mapnik&marker=${LAT}%2C${LON}`;

export default function Directions() {
  const { t } = useLanguage();
  const page = t.directions;

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

      <section className="editorial-section section-surface section-pad">
        <div className="container-wide grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="placeholder-panel flex flex-col justify-between gap-10">
            <div className="space-y-4">
              <span className="accent-rule" />
              <p className="eyebrow">{page.placeholderTitle}</p>
              <p className="lead">{page.placeholderText}</p>
            </div>
          </div>

          <div className="border border-line min-h-[26rem]">
            <iframe
              title={t.about.mapTitle}
              src={osmEmbedUrl}
              className="h-full min-h-[26rem] w-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </>
  );
}

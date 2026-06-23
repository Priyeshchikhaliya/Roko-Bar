import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/useLanguage.js";

export default function Datenschutz() {
  const { t } = useLanguage();
  const page = t.datenschutz;

  useEffect(() => {
    document.title = page.pageTitle;
  }, [page.pageTitle]);

  return (
    <>
      <Helmet>
        <title>{page.pageTitle}</title>
        <meta name="description" content={page.seoDescription} />
        <link rel="canonical" href={t.common.canonical.datenschutz} />
        <html lang={t.common.htmlLang} />
      </Helmet>

      <section className="editorial-section section-paper section-pad border-t-0">
        <div className="container-wide grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <div className="space-y-5">
            <p className="eyebrow">{page.lastUpdated}</p>
            <h1 className="hero-title">{page.title}</h1>
          </div>
          <p className="lead">{page.intro}</p>
        </div>
      </section>

      <section className="editorial-section section-surface section-pad">
        <div className="container-wide">
          <div className="grid gap-px border border-line bg-line lg:grid-cols-2">
            {page.sections.map((section, index) => (
              <article key={section.heading} className="bg-surface p-6 md:p-8">
                <p className="font-display text-5xl font-semibold leading-none text-primary">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-8 text-3xl font-semibold">
                  {section.heading}
                </h2>
                <ul className="mt-6 grid gap-3 text-muted">
                  {section.points.map((point) => (
                    <li key={point} className="flex gap-4">
                      <span className="square-bullet" />
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

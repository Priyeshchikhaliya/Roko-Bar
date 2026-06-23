import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/useLanguage.js";

export default function Mietbedingungen() {
  const { t } = useLanguage();
  const page = t.terms;

  useEffect(() => {
    document.title = page.pageTitle;
  }, [page.pageTitle]);

  return (
    <>
      <Helmet>
        <title>{page.pageTitle}</title>
        <meta name="description" content={page.seoDescription} />
        <link rel="canonical" href={t.common.canonical.terms} />
        <html lang={t.common.htmlLang} />
      </Helmet>

      <section className="editorial-section section-paper section-pad border-t-0">
        <div className="container-wide grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-end">
          <div className="space-y-5">
            <p className="eyebrow">{t.footer.terms}</p>
            <h1 className="hero-title max-w-5xl">{page.title}</h1>
          </div>
          <p className="lead max-w-2xl">{page.intro}</p>
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

      <section className="editorial-section section-paper section-pad">
        <div className="container-wide grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-5">
            <span className="accent-rule" />
            <h2 className="section-title">{page.contractsTitle}</h2>
            <p className="lead">{page.contractsIntro}</p>
          </div>

          <div className="flat-panel flex flex-col justify-between gap-8">
            <div className="flex flex-wrap gap-3">
              <a
                href={t.common.contracts.residentsHref}
                className="btn-secondary text-xs md:text-sm"
              >
                {t.common.contracts.residentsLabel}
              </a>
              <a
                href={t.common.contracts.externalHref}
                className="btn-secondary text-xs md:text-sm"
              >
                {t.common.contracts.externalLabel}
              </a>
            </div>

            <details className="border-t border-line pt-6">
              <summary className="cursor-pointer text-xl font-semibold">
                {page.legalDetailsSummary}
              </summary>
              <div className="pt-5">
                <h3 className="sr-only">{page.legalDetailsTitle}</h3>
                <p className="lead text-base">{page.legalDetailsIntro}</p>
                <ul className="mt-5 grid gap-3 text-muted">
                  {page.legalDetailsPoints.map((point) => (
                    <li key={point} className="flex gap-4">
                      <span className="square-bullet" />
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          </div>
        </div>
      </section>

      <section className="editorial-section section-ink py-10">
        <div className="container-wide flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-surface/80">{page.bookingText}</p>
          <Link to={t.common.links.booking} className="btn-primary w-fit">
            {page.bookingLink}
          </Link>
        </div>
      </section>
    </>
  );
}

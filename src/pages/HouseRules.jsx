import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/useLanguage.js";

export default function HouseRules() {
  const { t } = useLanguage();
  const page = t.houseRules;

  useEffect(() => {
    document.title = page.pageTitle;
  }, [page.pageTitle]);

  return (
    <>
      <Helmet>
        <title>{page.pageTitle}</title>
        <meta name="description" content={page.seoDescription} />
        <link rel="canonical" href={t.common.canonical.houseRules} />
        <html lang={t.common.htmlLang} />
      </Helmet>

      <section className="editorial-section section-paper section-pad border-t-0">
        <div className="container-wide grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-end">
          <div className="space-y-5">
            <p className="eyebrow">{t.nav.houseRules}</p>
            <h1 className="hero-title max-w-5xl">{page.title}</h1>
          </div>
          <p className="lead max-w-2xl">{page.intro}</p>
        </div>
      </section>

      <section className="editorial-section section-surface section-pad">
        <div className="container-wide">
          <div className="grid gap-px border border-line bg-line md:grid-cols-2">
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
        <div className="container-wide">
          <div className="flat-panel flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="lead max-w-2xl">{page.linksIntro}</p>
            <div className="flex flex-wrap gap-3">
              {page.links.map((link) =>
                link.type === "internal" ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="btn-secondary text-xs md:text-sm"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    className="btn-secondary text-xs md:text-sm"
                  >
                    {link.label}
                  </a>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-section section-ink section-pad">
        <div className="container-wide flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-5">
            <span className="accent-rule" />
            <p className="eyebrow">{page.contactKicker}</p>
            <h2 className="section-title">{page.contactTitle}</h2>
            <p className="lead">{page.contactText}</p>
          </div>

          <a
            href={`mailto:${t.common.email}`}
            className="btn-primary w-fit shrink-0 text-xs md:text-sm"
          >
            {page.contactCTA}
          </a>
        </div>
      </section>
    </>
  );
}

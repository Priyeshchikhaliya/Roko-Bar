import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/useLanguage.js";

export default function Team() {
  const { t } = useLanguage();
  const page = t.team;

  useEffect(() => {
    document.title = page.pageTitle;
  }, [page.pageTitle]);

  return (
    <>
      <Helmet>
        <title>{page.pageTitle}</title>
        <meta name="description" content={page.seoDescription} />
        <link rel="canonical" href={t.common.canonical.team} />
        <html lang={t.common.htmlLang} />
      </Helmet>

      <section className="editorial-section section-paper section-pad border-t-0">
        <div className="container-wide grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-end">
          <div className="space-y-5">
            <p className="eyebrow">{t.nav.team}</p>
            <h1 className="hero-title max-w-4xl">{page.title}</h1>
          </div>
          <p className="lead max-w-2xl">{page.intro}</p>
        </div>
      </section>

      <section className="editorial-section section-surface section-pad">
        <div className="container-wide space-y-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <span className="accent-rule" />
              <p className="eyebrow">{page.placeholdersTitle}</p>
            </div>
          </div>

          <div className="grid gap-px border border-line bg-line md:grid-cols-2">
            {page.placeholders.map((person, index) => (
              <article
                key={`${person.name}-${index}`}
                className="bg-surface p-5 md:p-7"
              >
                <div className="aspect-square border border-line bg-paper flex items-center justify-center text-xs uppercase tracking-[0.16em] text-muted">
                  {page.placeholdersTitle}
                </div>
                <div className="mt-6 space-y-2">
                  <p className="text-2xl font-display font-semibold leading-none">
                    {person.name}
                  </p>
                  <p className="eyebrow">{person.role}</p>
                  <p className="lead text-base">{person.funLine}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

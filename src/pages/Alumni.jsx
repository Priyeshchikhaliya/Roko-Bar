import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/useLanguage.js";

export default function Alumni() {
  const { t } = useLanguage();
  const page = t.alumni;

  useEffect(() => {
    document.title = page.pageTitle;
  }, [page.pageTitle]);

  return (
    <>
      <Helmet>
        <title>{page.pageTitle}</title>
        <meta name="description" content={page.seoDescription} />
        <link rel="canonical" href={t.common.canonical.alumni} />
        <html lang={t.common.htmlLang} />
      </Helmet>

      <section className="editorial-section section-paper section-pad border-t-0">
        <div className="container-wide grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-end">
          <div className="space-y-5">
            <p className="eyebrow">{t.nav.alumni}</p>
            <h1 className="hero-title max-w-5xl">{page.title}</h1>
          </div>
          <p className="lead max-w-2xl">{page.intro}</p>
        </div>
      </section>

      <section className="editorial-section section-surface section-pad">
        <div className="container-wide">
          <div className="placeholder-panel flex flex-col justify-between gap-12">
            <div className="space-y-4 max-w-2xl">
              <span className="accent-rule" />
              <p className="eyebrow">{page.placeholdersTitle}</p>
              <p className="lead">{page.placeholderText}</p>
            </div>
            <div className="grid gap-px border border-line bg-line md:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="aspect-[4/3] bg-surface flex items-center justify-center px-5 text-center text-xs uppercase tracking-[0.16em] text-muted"
                >
                  {page.placeholdersTitle}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

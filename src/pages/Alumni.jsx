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
          <div className="flat-panel flex flex-col gap-8 border-l-2 border-l-primary md:flex-row md:items-end md:justify-between">
            <div className="space-y-4 max-w-2xl">
              <p className="eyebrow">{page.callKicker}</p>
              <h2 className="section-title">{page.callTitle}</h2>
              <p className="lead">{page.callText}</p>
            </div>
            <a
              href={`mailto:${t.common.email}`}
              className="btn-primary w-fit shrink-0 text-xs md:text-sm"
            >
              {page.callCTA}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

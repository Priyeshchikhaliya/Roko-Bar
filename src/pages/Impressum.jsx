import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/useLanguage.js";

export default function Impressum() {
  const { t } = useLanguage();
  const page = t.impressum;

  useEffect(() => {
    document.title = page.pageTitle;
  }, [page.pageTitle]);

  return (
    <>
      <Helmet>
        <title>{page.pageTitle}</title>
        <meta name="description" content={page.seoDescription} />
        <link rel="canonical" href={t.common.canonical.impressum} />
        <html lang={t.common.htmlLang} />
      </Helmet>

      <section className="editorial-section section-paper section-pad border-t-0">
        <div className="container-wide grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <div className="space-y-5">
            <p className="eyebrow">{t.footer.impressum}</p>
            <h1 className="hero-title">{page.title}</h1>
          </div>
          <p className="lead">{page.disclaimer}</p>
        </div>
      </section>

      <section className="editorial-section section-surface section-pad">
        <div className="container-wide">
          <div className="grid gap-px border border-line bg-line">
            {[page.operator, page.managedBy].map((item) => (
              <div key={item} className="bg-surface p-6 md:p-8">
                <p className="lead">{item}</p>
              </div>
            ))}
            <div className="bg-surface p-6 md:p-8">
              <p className="eyebrow">{page.emailLabel}</p>
              <a
                href={`mailto:${t.common.email}`}
                className="mt-3 inline-flex text-lg underline underline-offset-4"
              >
                {t.common.email}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

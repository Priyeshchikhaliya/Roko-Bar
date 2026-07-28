import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/useLanguage.js";
import useReveal from "../hooks/useReveal.js";

const TRAIL = { "--reveal-delay": "140ms" };

export default function Datenschutz() {
  const { t } = useLanguage();
  const page = t.datenschutz;
  const reveal = useReveal();

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
        <div className="container-wide grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div className="reveal space-y-5" ref={reveal}>
            <span className="accent-rule" />
            <p className="eyebrow">{page.lastUpdated}</p>
            {/* "Datenschutzerklärung" is one 20-character word. Without a break
                opportunity it sets the grid column's min-content width, pushes
                the container past the viewport on a 320 px phone, and `main`
                clips the result — heading and body text both.
                `wrap-anywhere` rather than `wrap-break-word`: only `anywhere`
                lowers the min-content contribution, which is what the column is
                sized from. Hyphens supply the dash where Chrome has a German
                dictionary; both only engage when the word truly does not fit. */}
            <h1 className="hero-title max-w-3xl hyphens-auto wrap-anywhere">
              {page.title}
            </h1>
          </div>

          <p className="reveal lead max-w-2xl" ref={reveal} style={TRAIL}>
            {page.intro}
          </p>
        </div>
      </section>

      {/* A privacy policy is long by nature, so the four claims that actually
          decide whether someone keeps reading go above the numbered sections. */}
      <section className="editorial-section section-ink section-pad">
        <div className="container-wide space-y-10">
          <p className="reveal eyebrow" ref={reveal}>
            {page.summaryKicker}
          </p>

          <dl
            className="reveal grid gap-px border-t border-white/20 md:grid-cols-2"
            ref={reveal}
            style={TRAIL}
          >
            {page.summary.map((item) => (
              <div
                key={item.title}
                className="border-b border-white/20 py-7 md:py-9 md:odd:pr-10 md:even:pl-10"
              >
                <dt className="font-display text-2xl font-semibold leading-tight md:text-3xl">
                  {item.title}
                </dt>
                <dd className="lead mt-3 max-w-xl">{item.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="editorial-section section-surface section-pad">
        <div className="container-wide">
          <div className="grid gap-px border border-line bg-line lg:grid-cols-2">
            {page.sections.map((section, index) => (
              <article
                key={section.heading}
                className="reveal select-text bg-surface p-6 md:p-8"
                ref={reveal}
              >
                <p className="display-figure text-5xl text-primary">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-8 font-display text-3xl font-semibold">
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
        <div className="container-wide grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="reveal space-y-5" ref={reveal}>
            <span className="accent-rule" />
            <p className="eyebrow">{page.authorityKicker}</p>
            <h2 className="section-title max-w-xl">{page.authorityTitle}</h2>
            <p className="lead max-w-xl">{page.authorityText}</p>
          </div>

          <address
            className="reveal flat-panel select-text space-y-4 not-italic"
            ref={reveal}
            style={TRAIL}
          >
            <p className="font-display text-2xl font-semibold leading-tight">
              {page.authority.name}
            </p>
            <div className="text-muted">
              {page.authority.lines.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
            <a
              href={page.authority.href}
              target="_blank"
              rel="noreferrer"
              className="link-quiet inline-flex"
            >
              {page.authority.linkLabel}
            </a>
          </address>
        </div>
      </section>

      <section className="editorial-section section-surface section-pad">
        <div
          className="container-wide reveal flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
          ref={reveal}
        >
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

import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/useLanguage.js";
import useReveal from "../hooks/useReveal.js";

const TRAIL = { "--reveal-delay": "140ms" };

export default function Impressum() {
  const { t } = useLanguage();
  const page = t.impressum;
  const reveal = useReveal();

  // The § 5 DDG block is assembled here rather than in the translation file so
  // the operator name, address and email stay single-sourced in `common` and
  // cannot drift between the German and English pages.
  const identity = [
    { label: page.identityLabels.operator, lines: [t.common.operatorName] },
    {
      label: page.identityLabels.responsible,
      lines: [t.common.responsiblePerson],
    },
    {
      label: page.identityLabels.address,
      lines: [t.common.address.line1, t.common.address.line2],
    },
    { label: page.identityLabels.contact, mailto: t.common.email },
  ];

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
        <div className="container-wide grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div className="reveal space-y-5" ref={reveal}>
            <span className="accent-rule" />
            <p className="eyebrow">{page.kicker}</p>
            <h1 className="hero-title max-w-3xl">{page.title}</h1>
          </div>

          <p className="reveal lead max-w-2xl" ref={reveal} style={TRAIL}>
            {page.disclaimer}
          </p>
        </div>
      </section>

      <section className="editorial-section section-surface section-pad">
        <div className="container-wide space-y-12">
          <div className="reveal space-y-4" ref={reveal}>
            <span className="accent-rule" />
            <p className="eyebrow">{page.identityKicker}</p>
            <h2 className="section-title max-w-2xl">{page.identityTitle}</h2>
          </div>

          {/* Ruled rows rather than boxes: this is the one block on the site
              that is read for facts, so it should look like a record. */}
          <dl
            className="reveal grid gap-px border-t border-line"
            ref={reveal}
            style={TRAIL}
          >
            {identity.map((row) => (
              <div
                key={row.label}
                className="grid gap-2 border-b border-line py-6 md:grid-cols-[0.4fr_0.6fr] md:gap-10 md:py-7"
              >
                <dt className="eyebrow pt-1">{row.label}</dt>
                <dd className="select-text text-lg leading-relaxed">
                  {row.mailto ? (
                    <a
                      href={`mailto:${row.mailto}`}
                      className="link-quiet inline-flex"
                    >
                      {row.mailto}
                    </a>
                  ) : (
                    row.lines.map((line) => <div key={line}>{line}</div>)
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <p className="reveal lead max-w-2xl" ref={reveal}>
            {page.contactNote}
          </p>
        </div>
      </section>

      <section className="editorial-section section-paper section-pad">
        <div className="container-wide">
          <div
            className="reveal flat-panel grid gap-8 border-l-2 border-l-primary lg:grid-cols-[0.8fr_1.2fr]"
            ref={reveal}
          >
            <div className="space-y-4">
              <p className="eyebrow">{page.noteKicker}</p>
              <h2 className="font-display text-3xl font-semibold leading-tight">
                {page.noteTitle}
              </h2>
            </div>
            <div className="space-y-5">
              {page.noteParagraphs.map((paragraph) => (
                <p key={paragraph} className="lead max-w-2xl">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-section section-surface section-pad">
        <div className="container-wide space-y-12">
          <div className="reveal space-y-4" ref={reveal}>
            <span className="accent-rule" />
            <p className="eyebrow">{page.legalKicker}</p>
            <h2 className="section-title max-w-2xl">{page.legalTitle}</h2>
          </div>

          <div
            className="reveal grid gap-px border border-line bg-line lg:grid-cols-2"
            ref={reveal}
            style={TRAIL}
          >
            {page.legalSections.map((section, index) => (
              <article key={section.heading} className="bg-surface p-6 md:p-8">
                <p className="display-figure text-5xl text-primary">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-8 font-display text-3xl font-semibold">
                  {section.heading}
                </h3>
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

      <section className="editorial-section section-ink py-10">
        <div className="container-wide flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-surface/80">{page.privacyText}</p>
          <Link to={t.common.links.datenschutz} className="btn-primary w-fit">
            {page.privacyLink}
          </Link>
        </div>
      </section>
    </>
  );
}

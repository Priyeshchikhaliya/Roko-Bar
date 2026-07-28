import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/useLanguage.js";
import useReveal from "../hooks/useReveal.js";

const TRAIL = { "--reveal-delay": "140ms" };

export default function Alumni() {
  const { t } = useLanguage();
  const page = t.alumni;
  const reveal = useReveal();

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
        <div className="container-wide grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div className="reveal space-y-5" ref={reveal}>
            <span className="accent-rule" />
            <p className="eyebrow">{t.nav.alumni}</p>
            <h1 className="hero-title max-w-4xl">{page.title}</h1>
          </div>

          <p
            className="reveal max-w-2xl text-xl leading-relaxed text-ink md:text-2xl"
            ref={reveal}
            style={TRAIL}
          >
            {page.intro}
          </p>
        </div>
      </section>

      {/* Saying plainly that the archive is empty is better than a stub that
          looks like a page which failed to load. */}
      <section className="editorial-section section-surface section-pad">
        <div className="container-wide grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="reveal space-y-4" ref={reveal}>
            <span className="accent-rule" />
            <p className="eyebrow">{page.statusKicker}</p>
            <h2 className="section-title max-w-xl">{page.statusTitle}</h2>
          </div>

          <div className="reveal space-y-5" ref={reveal} style={TRAIL}>
            {page.statusParagraphs.map((paragraph) => (
              <p key={paragraph} className="lead max-w-2xl text-lg">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-section section-paper section-pad">
        <div className="container-wide space-y-12">
          <div className="reveal space-y-4" ref={reveal}>
            <span className="accent-rule" />
            <p className="eyebrow">{page.collectKicker}</p>
            <h2 className="section-title max-w-2xl">{page.collectTitle}</h2>
          </div>

          <dl
            className="reveal grid gap-px border-t border-line"
            ref={reveal}
            style={TRAIL}
          >
            {page.collect.map((item) => (
              <div
                key={item.title}
                className="grid gap-3 border-b border-line py-7 md:grid-cols-[0.4fr_0.6fr] md:gap-10 md:py-9"
              >
                <dt className="font-display text-2xl font-semibold leading-tight md:text-3xl">
                  {item.title}
                </dt>
                <dd className="lead max-w-2xl">{item.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="editorial-section section-ink section-pad">
        <div className="container-wide space-y-12">
          <div className="reveal space-y-4" ref={reveal}>
            <span className="accent-rule" />
            <p className="eyebrow">{page.howKicker}</p>
            <h2 className="section-title max-w-2xl">{page.howTitle}</h2>
          </div>

          <ol
            className="reveal grid gap-px border border-white/20 bg-white/20 md:grid-cols-3"
            ref={reveal}
            style={TRAIL}
          >
            {page.howSteps.map((step, index) => (
              <li key={step.heading} className="bg-ink p-6 md:p-8">
                <p className="display-figure text-5xl text-primary">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-8 font-display text-2xl font-semibold leading-tight">
                  {step.heading}
                </h3>
                <p className="lead mt-4">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="editorial-section section-surface section-pad">
        <div className="container-wide">
          <div
            className="reveal flat-panel grid gap-8 border-l-2 border-l-primary lg:grid-cols-[0.8fr_1.2fr]"
            ref={reveal}
          >
            <div className="space-y-4">
              <p className="eyebrow">{page.consentKicker}</p>
              <h2 className="font-display text-3xl font-semibold leading-tight">
                {page.consentTitle}
              </h2>
            </div>

            <div className="space-y-6">
              <p className="lead max-w-2xl">{page.consentIntro}</p>
              <ul className="grid gap-3 text-muted">
                {page.consentPoints.map((point) => (
                  <li key={point} className="flex gap-4">
                    <span className="square-bullet" />
                    <span className="max-w-2xl leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-section section-ink py-10">
        <div className="container-wide flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="eyebrow">{page.callKicker}</p>
            <p className="font-display text-2xl font-semibold leading-tight">
              {page.callTitle}
            </p>
            <p className="lead max-w-2xl">{page.callText}</p>
          </div>

          <a
            href={`mailto:${t.common.email}`}
            className="btn-primary w-fit shrink-0 text-xs md:text-sm"
          >
            {page.callCTA}
          </a>
        </div>
      </section>
    </>
  );
}

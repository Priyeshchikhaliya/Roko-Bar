import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/useLanguage.js";
import rokoImage from "../assets/roko_image.jpeg";
import section1 from "../assets/section1.png";

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const page = t.home;

  useEffect(() => {
    document.title = page.pageTitle;
  }, [page.pageTitle]);

  return (
    <>
      <Helmet>
        <title>{page.pageTitle}</title>
        <meta name="description" content={page.seoDescription} />
        <link rel="canonical" href={t.common.canonical.home} />
        <html lang={t.common.htmlLang} />
      </Helmet>

      <section className="editorial-section border-t-0 relative min-h-[calc(100vh-73px)] flex items-center overflow-hidden">
        <img
          src={rokoImage}
          alt={t.about.imageAlt}
          className="absolute inset-0 z-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(to top right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0.18) 68%, rgba(0,0,0,0) 100%)",
          }}
        />
        <div className="container-wide relative z-10 py-12 md:py-16">
          <div className="max-w-4xl space-y-7 text-surface">
            <p className="eyebrow text-surface/75">{t.common.brandBadge}</p>
            <h1 className="hero-title">{page.heroTitle}</h1>
            <p className="max-w-2xl text-lg leading-relaxed text-surface/85">
              {page.heroSubtitle}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => navigate(t.common.links.booking)}
                className="btn-primary"
              >
                {page.heroCTA}
              </button>
              <a
                href="#booking-process"
                className="text-sm font-semibold uppercase tracking-[0.14em] text-surface underline decoration-surface/70 underline-offset-4 hover:text-brick-tint"
              >
                {page.heroSecondaryCTA}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-section section-surface section-pad">
        <div className="container-wide grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="accent-rule" />
              <p className="eyebrow">{page.whyKicker}</p>
            </div>
            <h2 className="section-title max-w-3xl">{page.whyTitle}</h2>
            <p className="lead max-w-2xl">{page.whyIntro}</p>
            <ul className="grid gap-4 pt-4">
              {page.whyPoints.map((point) => (
                <li key={point} className="flex items-start gap-4">
                  <span className="square-bullet" />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-line">
            <img
              src={section1}
              alt={page.imageAlt}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section id="prices" className="editorial-section section-ink section-pad">
        <div className="container-wide space-y-12">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div className="space-y-4">
              <p className="eyebrow">{page.pricesKicker}</p>
              <h2 className="section-title max-w-3xl">{page.pricesTitle}</h2>
            </div>
            <p className="lead max-w-3xl lg:ml-auto">{page.pricesIntro}</p>
          </div>

          <div className="grid gap-px border border-surface/20 bg-surface/20 md:grid-cols-3">
            {page.priceCards.map((card) => (
              <article key={card.title} className="bg-ink p-6 md:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-surface/70">
                  {card.title}
                </p>
                <p className="mt-8 font-display text-6xl font-semibold leading-none text-primary md:text-7xl">
                  {card.amount}
                </p>
                <p className="mt-6 text-sm leading-relaxed text-surface/75">
                  {card.note}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="booking-process"
        className="editorial-section section-paper section-pad"
      >
        <div className="container-wide space-y-12">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div className="space-y-4">
              <p className="eyebrow">{t.common.badges.simpleClear}</p>
              <h2 className="section-title max-w-3xl">{page.processTitle}</h2>
            </div>
            <p className="lead max-w-3xl lg:ml-auto">{page.processIntro}</p>
          </div>

          <ol className="grid gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
            {page.processSteps.map((step, index) => (
              <li key={step} className="bg-paper p-6 md:p-8">
                <span className="font-display text-6xl font-semibold leading-none text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-8 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="editorial-section section-surface section-pad">
        <div className="container-wide flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-4xl space-y-5">
            <span className="accent-rule" />
            <h2 className="section-title">{page.closingTitle}</h2>
            <p className="lead max-w-2xl">{page.closingText}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(t.common.links.booking)}
            className="btn-primary shrink-0"
          >
            {page.closingCTA}
          </button>
        </div>
      </section>
    </>
  );
}

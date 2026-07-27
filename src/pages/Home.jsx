import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/useLanguage.js";
import HeroCarousel from "../components/HeroCarousel.jsx";
import useReveal from "../hooks/useReveal.js";

// The three strongest frames, all shot with the rig running. Kept short and
// all-night on purpose: the lit shots carry colour and depth that survive a
// heavy scrim, where the house-lights frames go flat and show every scuff.
// The honest lights-on views still live on /about and /directions.
const HERO_PHOTOS = ["dancefloor-night", "room-night", "counter-night"];

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const page = t.home;
  const reveal = useReveal();

  // The step grid paints its dividers with a background behind gap-px cells, so
  // a partly-filled last row would show bare divider colour. Stretch the final
  // card across whatever the row is short by.
  const stepCount = page.processSteps.length;
  const trailingSpan = [
    stepCount % 2 === 1 ? "md:col-span-2" : "",
    stepCount % 3 === 1 ? "lg:col-span-3" : "",
    stepCount % 3 === 2 ? "lg:col-span-2" : "",
  ]
    .filter(Boolean)
    .join(" ");

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

      <section className="editorial-section relative flex min-h-[calc(100vh-73px)] items-center overflow-hidden border-t-0">
        <HeroCarousel
          label={page.heroImageLabel}
          labels={t.common.gallery}
          names={HERO_PHOTOS}
        />

        <div className="container-wide relative z-10 py-16 md:py-20">
          <div className="max-w-4xl space-y-6 text-surface md:space-y-8">
            <p className="eyebrow text-surface/90">{t.common.brandBadge}</p>
            <h1 className="hero-title">{page.heroTitle}</h1>
            <p className="max-w-2xl text-lg leading-relaxed text-surface/85">
              {page.heroSubtitle}
            </p>
            <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:gap-6">
              <button
                type="button"
                onClick={() => navigate(t.common.links.booking)}
                className="btn-primary"
              >
                {page.heroCTA}
              </button>
              <a
                href="#booking-process"
                className="link-quiet w-fit text-sm font-semibold uppercase tracking-[0.14em] text-surface"
              >
                {page.heroSecondaryCTA}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-section section-surface section-pad">
        <div className="container-wide space-y-14">
          <div
            className="reveal grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end"
            ref={reveal}
          >
            <div className="space-y-4">
              <span className="accent-rule" />
              <p className="eyebrow">{page.whyKicker}</p>
              <h2 className="section-title max-w-2xl">{page.whyTitle}</h2>
            </div>
            <p className="lead max-w-2xl lg:ml-auto">{page.whyIntro}</p>
          </div>

          <dl
            className="reveal grid gap-px border-t border-line"
            ref={reveal}
            style={{ "--reveal-delay": "140ms" }}
          >
            {page.whyPoints.map((point) => (
              <div
                key={point.title}
                className="grid gap-3 border-b border-line py-7 md:grid-cols-[0.4fr_0.6fr] md:gap-10 md:py-9"
              >
                <dt className="font-display text-2xl font-semibold leading-tight md:text-3xl">
                  {point.title}
                </dt>
                <dd className="lead max-w-2xl">{point.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="prices" className="editorial-section section-ink section-pad">
        <div className="container-wide space-y-14">
          <div
            className="reveal grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end"
            ref={reveal}
          >
            <div className="space-y-4">
              <p className="eyebrow">{page.pricesKicker}</p>
              <h2 className="section-title max-w-3xl">{page.pricesTitle}</h2>
            </div>
            <p className="lead max-w-3xl lg:ml-auto">{page.pricesIntro}</p>
          </div>

          <div
            className="reveal grid gap-px border border-surface/20 bg-surface/20 md:grid-cols-3"
            ref={reveal}
            style={{ "--reveal-delay": "140ms" }}
          >
            {page.priceCards.map((card) => (
              <article
                key={card.title}
                className="flex flex-col bg-ink p-6 md:p-8"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-surface/70">
                  {card.title}
                </p>
                <p className="display-figure mt-10 text-6xl text-primary md:text-7xl">
                  {card.amount}
                </p>
                <p className="mt-4 text-xs uppercase tracking-[0.16em] text-surface/55">
                  {card.meta}
                </p>
                <p className="mt-7 border-t border-surface/15 pt-6 text-sm leading-relaxed text-surface/75">
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
        <div className="container-wide space-y-14">
          <div
            className="reveal grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end"
            ref={reveal}
          >
            <div className="space-y-4">
              <span className="accent-rule" />
              <p className="eyebrow">{t.common.badges.simpleClear}</p>
              <h2 className="section-title max-w-2xl">{page.processTitle}</h2>
            </div>
            <p className="lead max-w-3xl lg:ml-auto">{page.processIntro}</p>
          </div>

          <ol
            className="reveal grid gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-3"
            ref={reveal}
            style={{ "--reveal-delay": "140ms" }}
          >
            {page.processSteps.map((step, index) => (
              <li
                key={step.title}
                className={`flex flex-col bg-paper p-6 md:p-8 ${
                  index === page.processSteps.length - 1 ? trailingSpan : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="display-figure block text-5xl text-primary/25 md:text-6xl">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {step.tag ? (
                    <span className="mt-1 border border-line px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
                      {step.tag}
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-7 text-xl font-semibold md:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-3 leading-relaxed text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="editorial-section section-surface section-pad">
        <div
          className="container-wide reveal flex flex-col gap-10 md:flex-row md:items-end md:justify-between"
          ref={reveal}
        >
          <div className="max-w-3xl space-y-5">
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

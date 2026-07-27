import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/useLanguage.js";
import useReveal from "../hooks/useReveal.js";
import { portrait } from "../lib/photos.js";

const TRAIL = { "--reveal-delay": "140ms" };

export default function Team() {
  const { t } = useLanguage();
  const page = t.team;
  const reveal = useReveal();

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
        <div className="container-wide grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div className="reveal space-y-5" ref={reveal}>
            <span className="accent-rule" />
            <p className="eyebrow">{t.nav.team}</p>
            <h1 className="hero-title max-w-3xl">{page.title}</h1>
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

      {/* Every other page is built from hairline grids and boxed panels. This
          one is deliberately the opposite: no frames, no dividers, portraits
          set on open paper and staggered so the row reads as a composition
          rather than a row of ID photos. */}
      <section className="editorial-section section-surface section-pad">
        <div className="container-wide space-y-12">
          <div className="reveal space-y-3" ref={reveal}>
            <span className="accent-rule" />
            <p className="eyebrow">{page.membersKicker}</p>
          </div>

          <ul
            className="reveal grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-4 lg:gap-x-7"
            ref={reveal}
            style={TRAIL}
          >
            {page.members.map((person, index) => {
              const image = portrait(person.photo);
              return (
                <li
                  key={person.photo}
                  className={index % 2 === 1 ? "sm:mt-14 lg:mt-28" : ""}
                >
                  <figure className="group">
                    <div className="overflow-hidden bg-paper">
                      {image ? (
                        <img
                          alt={page.photoAltTemplate.replace(
                            "{name}",
                            person.name,
                          )}
                          className="portrait-img aspect-[3/4] w-full object-cover"
                          decoding="async"
                          height={640}
                          loading="lazy"
                          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 44vw, 88vw"
                          src={image.src}
                          srcSet={image.srcSet}
                          width={640}
                        />
                      ) : (
                        <div className="aspect-[3/4] w-full bg-paper" />
                      )}
                    </div>

                    <figcaption className="mt-6 space-y-3">
                      <span className="display-figure block text-2xl text-primary/30">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="font-display text-3xl font-semibold leading-none">
                        {person.name}
                      </p>
                      <span className="accent-rule" />
                      {person.role ? (
                        <p className="eyebrow">{person.role}</p>
                      ) : null}
                      {person.funLine ? (
                        <p className="lead text-base">{person.funLine}</p>
                      ) : null}
                    </figcaption>
                  </figure>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="editorial-section section-ink section-pad">
        <div className="container-wide space-y-14">
          <div
            className="reveal grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end"
            ref={reveal}
          >
            <div className="space-y-4">
              <p className="eyebrow">{page.tasksKicker}</p>
              <h2 className="section-title max-w-2xl">{page.tasksTitle}</h2>
            </div>
            <p className="lead max-w-3xl lg:ml-auto">{page.tasksIntro}</p>
          </div>

          <ol
            className="reveal grid gap-px border border-surface/20 bg-surface/20 md:grid-cols-3"
            ref={reveal}
            style={TRAIL}
          >
            {page.tasks.map((task, index) => (
              <li key={task.title} className="bg-ink p-6 md:p-8">
                <span className="display-figure block text-5xl text-primary/40 md:text-6xl">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-7 text-xl font-semibold md:text-2xl">
                  {task.title}
                </h3>
                <p className="mt-3 leading-relaxed text-surface/75">
                  {task.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="editorial-section section-paper section-pad">
        <div
          className="container-wide reveal flex flex-col gap-10 md:flex-row md:items-end md:justify-between"
          ref={reveal}
        >
          <div className="max-w-3xl space-y-5">
            <span className="accent-rule" />
            <h2 className="section-title">{page.contactTitle}</h2>
            <p className="lead max-w-2xl">{page.contactText}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row md:shrink-0">
            <a
              href={`mailto:${t.common.email}`}
              className="btn-secondary w-full sm:w-fit"
            >
              {t.common.email}
            </a>
            <Link
              to={t.common.links.booking}
              className="btn-primary w-full sm:w-fit"
            >
              {page.contactCTA}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

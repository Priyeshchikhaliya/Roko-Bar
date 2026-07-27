import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/useLanguage.js";
import { portrait } from "../lib/photos.js";

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
          <div className="space-y-3">
            <span className="accent-rule" />
            <p className="eyebrow">{page.membersKicker}</p>
          </div>

          <ul className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {page.members.map((person) => {
              const image = portrait(person.photo);
              return (
                <li key={person.photo} className="bg-surface p-5 md:p-6">
                  {image ? (
                    <img
                      alt={page.photoAltTemplate.replace("{name}", person.name)}
                      className="aspect-square w-full border border-line object-cover"
                      decoding="async"
                      height={640}
                      loading="lazy"
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                      src={image.src}
                      srcSet={image.srcSet}
                      width={640}
                    />
                  ) : (
                    <div className="aspect-square w-full border border-line bg-paper" />
                  )}

                  <div className="mt-5 space-y-2">
                    <p className="font-display text-2xl font-semibold leading-none">
                      {person.name}
                    </p>
                    {person.role ? (
                      <p className="eyebrow">{person.role}</p>
                    ) : null}
                    {person.funLine ? (
                      <p className="lead text-base">{person.funLine}</p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="editorial-section section-paper section-pad">
        <div className="container-wide">
          <div className="flat-panel flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3 max-w-2xl">
              <h2 className="text-3xl font-semibold">{page.contactTitle}</h2>
              <p className="lead">{page.contactText}</p>
            </div>
            <a
              href={`mailto:${t.common.email}`}
              className="btn-secondary w-fit text-xs md:text-sm"
            >
              {t.common.email}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

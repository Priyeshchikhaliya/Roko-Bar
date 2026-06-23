import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/useLanguage.js";

const COPY = {
  de: {
    pageTitle: "Seite nicht gefunden | RoKo Bar",
    eyebrow: "404",
    title: "Seite nicht gefunden",
    body: "Diese Adresse gibt es hier nicht oder nicht mehr.",
    home: "Zur Startseite",
    booking: "Zur Buchung",
  },
  en: {
    pageTitle: "Page not found | RoKo Bar",
    eyebrow: "404",
    title: "Page not found",
    body: "This address does not exist here, or no longer exists.",
    home: "Go home",
    booking: "Go to booking",
  },
};

export default function NotFound() {
  const { lang, t } = useLanguage();
  const copy = COPY[lang] || COPY.de;

  return (
    <>
      <Helmet>
        <title>{copy.pageTitle}</title>
        <meta name="robots" content="noindex,nofollow" />
        <html lang={t.common.htmlLang} />
      </Helmet>

      <section className="editorial-section section-paper border-t-0 py-16 md:py-24">
        <div className="container-wide max-w-3xl select-text">
          <div className="flat-panel space-y-6">
            <div className="space-y-3">
              <p className="eyebrow">{copy.eyebrow}</p>
              <h1 className="font-display text-4xl font-semibold md:text-5xl">
                {copy.title}
              </h1>
              <p className="lead text-base">{copy.body}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link className="btn-primary" to={t.common.links.home}>
                {copy.home}
              </Link>
              <Link className="btn-secondary" to={t.common.links.booking}>
                {copy.booking}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

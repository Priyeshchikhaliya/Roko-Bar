import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/useLanguage.js";

// Local rather than in translations.js: nothing else on the site needs these
// strings, and a 404 has to render even if a page's own copy is what broke.
const COPY = {
  de: {
    pageTitle: "Seite nicht gefunden | RoKo Bar",
    eyebrow: "404",
    title: "Seite nicht gefunden",
    body: "Diese Adresse gibt es hier nicht oder nicht mehr. Vielleicht hat sich ein Link geändert – oder wir haben etwas umbenannt.",
    home: "Zur Startseite",
    booking: "Zur Buchung",
    elsewhereTitle: "Vielleicht suchst du das",
  },
  en: {
    pageTitle: "Page not found | RoKo Bar",
    eyebrow: "404",
    title: "Page not found",
    body: "This address does not exist here, or no longer does. A link may have changed — or we renamed something.",
    home: "Go home",
    booking: "Go to booking",
    elsewhereTitle: "You might be looking for",
  },
};

export default function NotFound() {
  const { lang, t } = useLanguage();
  const copy = COPY[lang] || COPY.de;

  const elsewhere = [
    { to: t.common.links.about, label: t.nav.about },
    { to: t.common.links.directions, label: t.nav.directions },
    { to: t.common.links.houseRules, label: t.nav.houseRules },
    { to: t.common.links.terms, label: t.footer.terms },
    { to: t.common.links.team, label: t.nav.team },
  ];

  return (
    <>
      <Helmet>
        <title>{copy.pageTitle}</title>
        <meta name="robots" content="noindex,nofollow" />
        <html lang={t.common.htmlLang} />
      </Helmet>

      <section className="editorial-section section-paper border-t-0 py-20 md:py-28">
        <div className="container-wide select-text space-y-14">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-end">
            <div className="space-y-5">
              <span className="accent-rule" />
              <p className="eyebrow">{copy.eyebrow}</p>
              <h1 className="hero-title max-w-2xl">{copy.title}</h1>
            </div>

            <div className="space-y-6">
              <p className="lead max-w-xl">{copy.body}</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link className="btn-primary w-fit" to={t.common.links.home}>
                  {copy.home}
                </Link>
                <Link
                  className="btn-secondary w-fit"
                  to={t.common.links.booking}
                >
                  {copy.booking}
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-6 border-t border-line pt-10">
            <p className="eyebrow">{copy.elsewhereTitle}</p>
            <ul className="flex flex-wrap gap-x-8 gap-y-4">
              {elsewhere.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="link-quiet font-display text-xl font-semibold text-ink md:text-2xl"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext.jsx";

const texts = {
  de: {
    title: "Mietbedingungen RoKo-Bar",
    seoTitle: "Mietbedingungen – RoKo-Heimkneipe",
    seoDescription:
      "Mietbedingungen der RoKo-Heimkneipe: 75 € Bewohner:innen, 100 € Externe, 200 € Kaution, nur Wochenende, keine kommerziellen Partys.",
    sections: [
      {
        heading: "Miete & Kaution",
        points: [
          "Miete: 75 € für Bewohner:innen des RoKo, Christophorusweg oder Rosenbachweg; 100 € für externe Gäste.",
          "Kaution: 200 € in bar bei der Schlüsselübergabe.",
        ],
      },
      {
        heading: "Zeitraum",
        points: [
          "Vermietung nur am Wochenende (Freitag–Sonntag). Unter der Woche wird die Heimkneipe nicht vermietet.",
        ],
      },
      {
        heading: "Sauberkeit & Rückgabe",
        points: [
          "Die Bar muss gereinigt und im ursprünglichen Zustand übergeben werden.",
          "Kosten für fehlende Reinigung werden von der Kaution abgezogen.",
        ],
      },
      {
        heading: "Sicherheit & Notausgang",
        points: [
          "Der Notausgang bleibt geschlossen und ist nur für Notfälle. Kein Einlass durch den Notausgang.",
        ],
      },
      {
        heading: "Keine kommerziellen Partys",
        points: [
          "Kein Verkauf von Getränken über Selbstkostenpreis, keine Eintrittsgelder oder Tickets.",
        ],
      },
      {
        heading: "Verstöße",
        points: [
          "Bei Regelverstößen können Teile oder die gesamte Kaution einbehalten werden.",
        ],
      },
    ],
    bookingLink: "Zur Buchungsseite",
    bookingText: "Details zum Ablauf findest du auf der Buchungsseite.",
  },
  en: {
    title: "Rental Terms RoKo Bar",
    seoTitle: "Rental Terms – RoKo Bar",
    seoDescription:
      "Rental terms for the RoKo Bar: €75 residents, €100 external guests, €200 deposit, weekends only, no commercial parties.",
    sections: [
      {
        heading: "Rent & deposit",
        points: [
          "Rent: €75 for residents of RoKo, Christophorusweg or Rosenbachweg; €100 for external guests.",
          "Deposit: €200 in cash at key handover.",
        ],
      },
      {
        heading: "When you can rent",
        points: [
          "Rental is weekend only (Friday–Sunday). No weekday rentals.",
        ],
      },
      {
        heading: "Cleaning & return",
        points: [
          "Clean the bar and hand it back in its original condition.",
          "Cleaning costs for missing cleaning will be taken from the deposit.",
        ],
      },
      {
        heading: "Safety & emergency exit",
        points: [
          "Keep the emergency exit closed; use it only in emergencies. No entrance via that door.",
        ],
      },
      {
        heading: "No commercial events",
        points: [
          "Do not sell drinks above self-cost, and do not charge entry fees or tickets.",
        ],
      },
      {
        heading: "Violations",
        points: [
          "Violations may result in partial or full retention of the deposit.",
        ],
      },
    ],
    bookingLink: "Go to booking",
    bookingText: "Find the booking steps and contact on the booking page.",
  },
};

export default function Mietbedingungen() {
  const { language } = useLanguage();
  const t = texts[language] ?? texts.de;
  const pageTitles = {
    de: "Mietbedingungen RoKo-Bar – RoKo Bar Göttingen",
    en: "Rental terms RoKo Bar – RoKo Bar Göttingen",
  };
  const fullTitle = pageTitles[language] ?? pageTitles.de;

  useEffect(() => {
    document.title = fullTitle;
  }, [fullTitle]);

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <Helmet>
        <title>{fullTitle}</title>
        <meta name="description" content={t.seoDescription} />
        <link rel="canonical" href="https://YOUR-DOMAIN-HERE.de/terms" />
        <html lang={language === "de" ? "de" : "en"} />
      </Helmet>

      <div className="glass-card p-6 md:p-8 space-y-3">
        <h1 className="text-2xl md:text-3xl font-semibold">{t.title}</h1>
      </div>

      {t.sections.map((section) => (
        <div key={section.heading} className="glass-card p-6 md:p-8 space-y-3">
          <h2 className="text-lg md:text-xl font-semibold">
            {section.heading}
          </h2>
          <ul className="space-y-2 text-sm md:text-base text-zinc-300 leading-relaxed">
            {section.points.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="mt-2 w-2 h-2 rounded-full bg-orange-400" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="text-sm text-zinc-300 text-center pb-6">
        {t.bookingText}{" "}
        <Link
          to="/booking"
          className="text-orange-300 hover:text-orange-200 underline underline-offset-4"
        >
          {t.bookingLink}
        </Link>
        .
      </div>
    </div>
  );
}

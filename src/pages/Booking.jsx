import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/LanguageContext.jsx";

const BOOKING_EMAIL = "heimkneipe@roko-goettingen.de";

const bookingTexts = {
  de: {
    title: "Buchungsanfrage RoKo-Bar",
    introParagraphs: [
      "Hier kannst du die RoKo-Bar für deine Veranstaltung am Wochenende anfragen.",
      "Die Miete beträgt 75 € für Bewohner:innen des RoKo 38 und 100 € für externe Gäste.",
      "Die Kaution beträgt 200 € und wird bei ordentlicher, sauberer Rückgabe vollständig zurückgezahlt.",
    ],
    weekdayNote:
      "Aktuell vermieten wir die Heimkneipe nicht an Wochentagen (Montag–Donnerstag). Bitte wähle ein Datum am Wochenende oder an einem Feiertag.",
    processTitle: "So funktioniert die Buchung",
    processSteps: [
      "Du suchst dir ein Datum (am Wochenende) für deine Party aus.",
      "Du schickst uns eine Buchungsanfrage per E-Mail.",
      "Wir prüfen das Datum und schicken dir den passenden Mietvertrag (75 € oder 100 €).",
      "Du unterschreibst den Vertrag und überweist die Miete.",
      "Wir unterschreiben gegen, vereinbaren einen Termin zur Schlüsselübergabe und du zahlst dort die 200 € Kaution in bar.",
    ],
    mailButtonLabel: "E-Mail mit Buchungsanfrage öffnen",
    mailFallbackLabel: "Oder schreib uns direkt an",
    pageTitle:
      "Buchungsanfrage RoKo-Bar – RoKo Bar Göttingen",
    seoDescription:
      "Buchungsanfrage für die RoKo-Heimkneipe: 75 € für Bewohner:innen, 100 € für Externe, 200 € Kaution bar bei Schlüsselübergabe, Vermietung nur am Wochenende.",
  },
  en: {
    title: "RoKo Bar booking request",
    introParagraphs: [
      "Request the RoKo Bar for your weekend event.",
      "The rental fee is €75 for RoKo residents and €100 for external guests.",
      "The deposit is €200 in cash at key handover and is fully refunded if the bar is returned clean and undamaged.",
    ],
    weekdayNote:
      "We currently do not rent out the bar on weekdays (Monday–Thursday). Please choose a date on a weekend or public holiday.",
    processTitle: "How the booking works",
    processSteps: [
      "You choose a weekend date for your party.",
      "You send us a booking request by email.",
      "We check the date and send you the correct rental contract (€75 or €100).",
      "You sign the contract and pay the rent.",
      "We countersign, schedule the key handover, and you pay the €200 deposit in cash at that appointment.",
    ],
    mailButtonLabel: "Open booking request email",
    mailFallbackLabel: "Or email us directly at",
    pageTitle:
      "RoKo Bar booking request – RoKo Bar Göttingen",
    seoDescription:
      "Book the RoKo Bar: €75 residents, €100 external guests, €200 cash deposit at key handover, weekend rentals only.",
  },
};

export default function Booking() {
  const { language } = useLanguage();
  const t = bookingTexts[language] ?? bookingTexts.de;
  const fullTitle = t.pageTitle;

  useEffect(() => {
    document.title = fullTitle;
  }, [fullTitle]);

  const subject =
    language === "de" ? "Anfrage RoKo-Bar Buchung" : "RoKo Bar booking request";

  const bodyDe = [
    "Hallo RoKo-Bar-Team,",
    "",
    "ich möchte die RoKo-Bar mieten.",
    "",
    "Gewünschtes Datum (nur Wochenende): [TT.MM.JJJJ]",
    "Uhrzeit: [von-bis]",
    "Ich wohne im RoKo: [Ja/Nein]",
    "Anzahl der Gäste: [Zahl]",
    "",
    "Name:",
    "Telefonnummer:",
    "",
    "Weitere Informationen:",
  ].join("\n");

  const bodyEn = [
    "Dear RoKo Bar team,",
    "",
    "I would like to rent the RoKo Bar.",
    "",
    "Preferred date (weekend only): [DD.MM.YYYY]",
    "Time: [from–to]",
    "I live in RoKo: [Yes/No]",
    "Number of guests: [Number]",
    "",
    "Name:",
    "Phone number:",
    "",
    "Additional information:",
  ].join("\n");

  const body = language === "de" ? bodyDe : bodyEn;

  const mailtoHref =
    "mailto:" +
    encodeURIComponent(BOOKING_EMAIL) +
    "?subject=" +
    encodeURIComponent(subject) +
    "&body=" +
    encodeURIComponent(body);

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      <Helmet>
        <title>{fullTitle}</title>
        <meta name="description" content={t.seoDescription} />
        <link rel="canonical" href="https://YOUR-DOMAIN-HERE.de/booking" />
        <html lang={language === "de" ? "de" : "en"} />
      </Helmet>

      <div className="glass-card p-6 md:p-8 space-y-4">
        <h1 className="text-2xl md:text-3xl font-semibold">{t.title}</h1>
        {t.introParagraphs.map((paragraph) => (
          <p
            key={paragraph}
            className="text-zinc-200 text-sm md:text-base leading-relaxed"
          >
            {paragraph}
          </p>
        ))}

        <div className="mt-2 rounded-xl bg-red-900/40 border border-red-500/60 p-4 text-sm text-zinc-100">
          {t.weekdayNote}
        </div>

        <a
          href={mailtoHref}
          className="inline-flex items-center justify-center mt-6 px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-400 text-white font-medium shadow-lg shadow-orange-500/40 transition"
        >
          {t.mailButtonLabel}
        </a>

        <p className="mt-3 text-xs text-zinc-400">
          {t.mailFallbackLabel}{" "}
          <a
            href={`mailto:${BOOKING_EMAIL}`}
            className="text-orange-400 hover:text-orange-300 underline"
          >
            {BOOKING_EMAIL}
          </a>
          .
        </p>
      </div>

      <div className="glass-card p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-xl md:text-2xl font-semibold">
            {t.processTitle}
          </h2>
          <span className="text-xs uppercase tracking-[0.2em] text-orange-200/70">
            {language === "de" ? "Einfach & klar" : "Simple & clear"}
          </span>
        </div>
        <ol className="space-y-4">
          {t.processSteps.map((step, index) => (
            <li key={step} className="flex gap-4 items-start">
              <span className="rounded-full w-8 h-8 flex items-center justify-center bg-zinc-800 text-sm font-semibold border border-zinc-700">
                {index + 1}
              </span>
              <p className="text-zinc-100 leading-relaxed text-sm md:text-base">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

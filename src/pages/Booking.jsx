import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/LanguageContext.jsx";

const BOOKING_EMAIL = "heimkneipe@roko-goettingen.de";

const bookingTexts = {
  de: {
    title: "Buchungsanfrage",
    introParagraphs: [
      "Hier kannst du die RoKo-Bar für deine Veranstaltung anfragen.",
      "Die Miete beträgt 75 € für Bewohner:innen des RoKo und 100 € für externe Gäste.",
      "Die Kaution beträgt 200 € und wird bei ordentlicher Übergabe vollständig zurückgezahlt.",
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
    seoTitle:
      "RoKo-Bar Buchung – Studentenbar im Wohnheim Robert-Koch-Straße 38, Göttingen",
    seoDescription:
      "Frage hier die RoKo-Heimkneipe im Wohnheim Robert-Koch-Straße 38 in Göttingen an. Alle Infos zu Miete, Kaution und Wochenendregelung auf einen Blick.",
  },
  en: {
    title: "Booking request",
    introParagraphs: [
      "Here you can request the RoKo Bar for your event.",
      "The rental fee is €75 for RoKo residents and €100 for external guests.",
      "The deposit is €200 and will be fully refunded if the bar is handed over in a proper condition.",
    ],
    weekdayNote:
      "We currently do not rent out the bar on weekdays (Monday–Thursday). Please choose a date on a weekend or public holiday.",
    processTitle: "How the booking works",
    processSteps: [
      "You choose a weekend date for your party.",
      "You send us a booking request by e-mail.",
      "We check the date and send you the correct rental contract (€75 or €100).",
      "You sign the contract and pay the rent.",
      "We countersign, schedule the key handover, and you pay the €200 deposit in cash at that appointment.",
    ],
    mailButtonLabel: "Open booking request email",
    mailFallbackLabel: "Or email us directly at",
    seoTitle:
      "RoKo Bar booking – Student bar at Robert-Koch-Str. 38, Göttingen",
    seoDescription:
      "Request the RoKo Bar at the student dormitory Robert-Koch-Str. 38 in Göttingen. All information about fees, deposit, and weekend rule at a glance.",
  },
};

export default function Booking() {
  const { language } = useLanguage();
  const t = bookingTexts[language] ?? bookingTexts.de;
  const baseTitle = "RoKo Bar Göttingen";

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
    <div className="space-y-8 max-w-4xl mx-auto">
      <Helmet>
        <title>{`${t.title} – ${baseTitle}`}</title>
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

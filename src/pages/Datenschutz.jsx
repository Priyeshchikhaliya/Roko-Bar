import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/LanguageContext.jsx";

const texts = {
  de: {
    title: "Datenschutzerklärung",
    seoTitle: "Datenschutzerklärung – RoKo-Heimkneipe",
    seoDescription:
      "Datenschutzhinweise für die RoKo-Heimkneipe: E-Mail-Anfragen, keine Cookies/Analytics, Hosting-Logs nur technisch.",
    lastUpdated: "Stand: 12.01.2025",
    intro:
      "Wir halten es simpel: Wir sammeln nur die Daten, die ihr uns per E-Mail schickt, um eure Buchungsanfragen zu beantworten.",
    sections: [
      {
        heading: "Welche Daten wir verarbeiten",
        points: [
          "Nur die Informationen, die ihr uns per E-Mail zusendet (z. B. Name, Kontaktdaten, gewünschtes Datum).",
          "Keine Cookies, kein Tracking, keine Formulare auf der Website.",
        ],
      },
      {
        heading: "Zweck der Verarbeitung",
        points: [
          "Bearbeitung und Beantwortung eurer Buchungsanfrage.",
          "Organisation von Mietverträgen, Schlüsselübergaben und Rückfragen.",
        ],
      },
      {
        heading: "Hosting & technische Logs",
        points: [
          "Das Hosting (z. B. Netlify oder Vercel) kann IP-Adressen kurzfristig in Server-Logs speichern, um den Betrieb sicherzustellen.",
          "Wir nutzen diese Logs nicht zur Auswertung eurer Nutzung.",
        ],
      },
      {
        heading: "Aufbewahrung",
        points: [
          "E-Mails bleiben so lange gespeichert, wie es für Rückfragen rund um die Buchung nötig ist.",
          "Auf Wunsch löschen wir eure E-Mail-Korrespondenz, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen.",
        ],
      },
      {
        heading: "Kontakt",
        points: [
          "Für Auskunfts- oder Löschanfragen: ",
          "E-Mail: heimkneipe@roko-goettingen.de",
        ],
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    seoTitle: "Privacy Policy – RoKo Bar",
    seoDescription:
      "Privacy notes for the RoKo Bar: email-only data, no cookies/analytics, hosting logs for technical reasons.",
    lastUpdated: "Last updated: 12 Jan 2025",
    intro:
      "We keep it simple: the only personal data we process is what you send us by email to handle your booking request.",
    sections: [
      {
        heading: "What data we process",
        points: [
          "Only the information you send via email (e.g., name, contact details, desired date).",
          "No cookies, no tracking, no on-site forms.",
        ],
      },
      {
        heading: "Purpose",
        points: [
          "To process and respond to your booking request.",
          "To organize rental contracts, key handover, and follow-up questions.",
        ],
      },
      {
        heading: "Hosting & technical logs",
        points: [
          "The hosting provider (e.g., Netlify or Vercel) may briefly store IP addresses in server logs for technical operation.",
          "We do not use these logs to analyze your behavior.",
        ],
      },
      {
        heading: "Retention",
        points: [
          "Emails are kept as long as needed for booking-related communication.",
          "On request, we delete email correspondence unless legal retention duties apply.",
        ],
      },
      {
        heading: "Contact",
        points: [
          "For access or deletion requests:",
          "Email: heimkneipe@roko-goettingen.de",
        ],
      },
    ],
  },
};

export default function Datenschutz() {
  const { language } = useLanguage();
  const t = texts[language] ?? texts.de;
  const baseTitle = "RoKo Bar Göttingen";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Helmet>
        <title>{`${t.title} – ${baseTitle}`}</title>
        <meta name="description" content={t.seoDescription} />
        <link rel="canonical" href="https://YOUR-DOMAIN-HERE.de/datenschutz" />
        <html lang={language === "de" ? "de" : "en"} />
      </Helmet>

      <div className="glass-card p-6 md:p-8 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-2xl md:text-3xl font-semibold">{t.title}</h1>
          <span className="text-xs text-zinc-400">{t.lastUpdated}</span>
        </div>
        <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
          {t.intro}
        </p>
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
    </div>
  );
}

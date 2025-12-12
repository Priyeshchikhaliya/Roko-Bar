import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/LanguageContext.jsx";

const texts = {
  de: {
    title: "Datenschutzerklärung",
    seoDescription:
      "Datenschutz für die RoKo-Heimkneipe: keine Cookies oder Tracking, E-Mail-Anfragen nur zur Buchungsbearbeitung, Spracheinstellung in localStorage.",
    lastUpdated: "Stand: 12.01.2025",
    intro:
      "Wir halten es simpel: Wir sammeln nur die Daten, die ihr uns per E-Mail schickt, um eure Buchungsanfragen zu beantworten. Es gibt keine Tracking-Cookies oder Analytics.",
    sections: [
      {
        heading: "Verantwortliche Stelle",
        points: [
          "Studentenwohnheim RoKo 38, Robert-Koch-Straße 38, 37075 Göttingen.",
          "E-Mail: heimkneipe@roko-goettingen.de",
        ],
      },
      {
        heading: "Server-Logs",
        points: [
          "Der Hosting-Anbieter (z. B. Netlify oder Vercel) speichert technisch notwendige Server-Logs (IP-Adresse, Timestamp, User-Agent), um den Betrieb zu gewährleisten.",
          "Wir werten diese Logs nicht zu Marketing- oder Tracking-Zwecken aus.",
        ],
      },
      {
        heading: "E-Mails & Buchungen",
        points: [
          "Wir verarbeiten nur die Daten, die ihr uns per E-Mail sendet (z. B. Name, Kontaktdaten, gewünschtes Datum), um eure Buchungsanfrage zu beantworten.",
          "Die Daten werden ausschließlich zur Organisation von Mietvertrag, Schlüsselübergabe und Rückfragen genutzt.",
          "Speicherdauer: solange es für Rückfragen zur Buchung nötig ist; auf Wunsch löschen wir die Korrespondenz, sofern keine gesetzlichen Pflichten entgegenstehen.",
        ],
      },
      {
        heading: "Cookies & localStorage",
        points: [
          "Keine Cookies, kein Google Analytics, keine Marketing-Tools.",
          "Wir speichern nur eure Spracheinstellung (\"de\" oder \"en\") im Browser (localStorage, Schlüssel: \"roko-language\"), damit die Seite beim nächsten Besuch in eurer Sprache lädt.",
          "Ihr könnt den Eintrag jederzeit über eure Browser-Einstellungen löschen.",
        ],
      },
      {
        heading: "Eure Rechte",
        points: [
          "Ihr könnt Auskunft oder Löschung eurer E-Mails verlangen, soweit keine Aufbewahrungspflichten entgegenstehen.",
          "Bei Fragen: heimkneipe@roko-goettingen.de",
        ],
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    seoDescription:
      "Privacy for the RoKo Bar: no cookies or tracking, booking emails only for handling rentals, language saved in localStorage.",
    lastUpdated: "Last updated: 12 Jan 2025",
    intro:
      "We keep it simple: the only personal data we process is what you send us by email to handle your booking request. There are no tracking cookies or analytics tools.",
    sections: [
      {
        heading: "Controller",
        points: [
          "Student dormitory RoKo 38, Robert-Koch-Str. 38, 37075 Göttingen, Germany.",
          "Email: heimkneipe@roko-goettingen.de",
        ],
      },
      {
        heading: "Server logs",
        points: [
          "The hosting provider (e.g., Netlify or Vercel) stores technically necessary server logs (IP address, timestamp, user agent) to keep the site running.",
          "We do not use these logs for marketing or tracking.",
        ],
      },
      {
        heading: "Emails & booking",
        points: [
          "We only process the data you send via email (e.g., name, contact details, desired date) to handle your booking.",
          "Data is used solely to organize rental contracts, key handover, and follow-up questions.",
          "Retention: kept as long as needed for booking-related communication; we delete correspondence on request unless legal duties require keeping it.",
        ],
      },
      {
        heading: "Cookies & localStorage",
        points: [
          "No cookies, no Google Analytics, no marketing tools.",
          "We only store your language preference (\"de\" or \"en\") in the browser (localStorage, key: \"roko-language\") so the site opens in your language next time.",
          "You can delete this entry at any time via your browser settings.",
        ],
      },
      {
        heading: "Your rights",
        points: [
          "You can request access to or deletion of your emails unless legal retention duties apply.",
          "Questions: heimkneipe@roko-goettingen.de",
        ],
      },
    ],
  },
};

export default function Datenschutz() {
  const { language } = useLanguage();
  const t = texts[language] ?? texts.de;
  const pageTitles = {
    de: "Datenschutzerklärung – RoKo Bar Göttingen",
    en: "Privacy Policy – RoKo Bar Göttingen",
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

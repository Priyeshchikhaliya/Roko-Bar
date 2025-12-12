import { useLanguage } from "../context/LanguageContext.jsx";

const BOOKING_EMAIL = "heimkneipe@roko-goettingen.de";

const texts = {
  de: {
    title: "Buchungsanfrage",
    intro:
      "Schicke uns eine E-Mail mit deinem Wunschtermin. Wir senden dir den passenden Mietvertrag (75 € für Bewohner:innen, 100 € für Externe). Die Kaution von 200 € wird erst am Tag der Schlüsselübergabe in bar gezahlt.",
    note:
      "Bitte fülle die Platzhalter vor dem Senden aus. Wir antworten dir so schnell wie möglich.",
    button: "E-Mail mit Buchungsanfrage öffnen",
    fallbackLabel: "Oder direkt per Mail:",
    subject: "Anfrage RoKo-Bar Buchung",
    body: `Hallo RoKo-Bar-Team,\n\nich möchte die RoKo-Bar mieten.\n\nGewünschtes Datum: [TT.MM.JJJJ]\nFalls das Datum belegt ist, alternative Termine: [weitere Vorschläge]\nIch wohne im RoKo: [Ja/Nein]\n\nName:\nTelefonnummer:\n\nWeitere Informationen:\n\nPreisinfo: 75 € für Bewohner:innen, 100 € für Externe. Kaution 200 € in bar am Tag der Schlüsselübergabe.`,
  },
  en: {
    title: "Booking request",
    intro:
      "Send us an email with your preferred date. We’ll send you the right rental contract (€75 for residents, €100 for external guests). The €200 deposit is paid in cash on the key handover day.",
    note:
      "Please fill in the placeholders before sending. We’ll get back to you quickly.",
    button: "Open booking request email",
    fallbackLabel: "Or email directly:",
    subject: "RoKo Bar booking request",
    body: `Hello RoKo Bar team,\n\nI would like to rent the RoKo Bar.\n\nPreferred date: [DD/MM/YYYY]\nIf that date is taken, other possible dates: [your alternatives]\nI live in RoKo: [Yes/No]\n\nName:\nPhone number:\n\nAdditional information:\n\nPrice info: €75 for residents, €100 for external guests. Deposit €200 paid in cash on key handover day.`,
  },
};

export default function Booking() {
  const { language } = useLanguage();
  const t = texts[language] ?? texts.de;

  const mailtoHref = `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(
    t.subject
  )}&body=${encodeURIComponent(t.body)}`;

  return (
    <div className="glass-card p-6 md:p-8 space-y-4">
      <h1 className="text-2xl md:text-3xl font-semibold">{t.title}</h1>
      <p className="text-zinc-200 text-sm md:text-base leading-relaxed">
        {t.intro}
      </p>
      <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
        {t.note}
      </p>

      <div className="pt-2">
        <a
          href={mailtoHref}
          target="_self"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-orange-500 text-white font-medium shadow-lg shadow-orange-500/40 hover:bg-orange-400 transition"
        >
          {t.button}
        </a>
      </div>

      <div className="text-sm text-zinc-400">
        <span className="block mb-1">{t.fallbackLabel}</span>
        <a
          href={`mailto:${BOOKING_EMAIL}`}
          className="text-orange-200 hover:text-orange-100 underline underline-offset-4"
        >
          {BOOKING_EMAIL}
        </a>
      </div>
    </div>
  );
}

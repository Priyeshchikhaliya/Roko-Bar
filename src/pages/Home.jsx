import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext.jsx";
import section1 from "../assets/section1.png";
import section2 from "../assets/section2.png";

const texts = {
  de: {
    heroTitle: "Miete die RoKo-Bar für deine nächste Party.",
    heroSubtitle:
      "Studentenbar im Wohnheim Robert-Koch-Straße 38 in Göttingen. Faire Miete, klare Regeln, kurze Wege nach Hause.",
    heroCTA: "Jetzt Buchungsanfrage per E-Mail stellen",
    heroSecondaryCTA: "Preise & Ablauf ansehen",
    priceResidentTitle: "Bewohner:innen",
    priceResidentAmount: "75 €",
    priceResidentNote: "Gilt für Bewohner:innen des Studentenwohnheims RoKo.",
    priceExternalTitle: "Externe",
    priceExternalAmount: "100 €",
    priceExternalNote: "Für Gäste, die nicht im RoKo wohnen.",
    priceDepositTitle: "Kaution",
    priceDepositAmount: "200 €",
    priceDepositNote:
      "Die Kaution wird NICHT mit der Miete überwiesen, sondern am Tag der Schlüsselübergabe in bar gezahlt und bei ordentlicher Übergabe vollständig zurückerstattet.",
    processTitle: "So läuft die Buchung",
    processSteps: [
      "Du wählst dein Datum und schickst eine Anfrage.",
      "Wir schicken dir den passenden Mietvertrag (75 € oder 100 €).",
      "Du unterschreibst und überweist die Miete.",
      "Wir unterschreiben gegen, Termin zur Schlüsselübergabe wird vereinbart.",
      "Am Tag der Schlüsselübergabe zahlst du die 200 € Kaution in bar.",
    ],
    featuresTitle: "Warum die RoKo-Bar?",
    featuresIntro:
      "Atmosphäre, Ausstattung und kurze Wege: perfekt für Geburtstage, WG-Partys und Vereinsfeiern.",
    features: [
      "Gemütliche Kellerbar direkt im Wohnheim.",
      "Theke mit Zapfanlage und Kühlschränken für Getränke.",
      "Tische, Hocker und viel Platz für Geburtstage, WG-Partys und Vereinsfeiern.",
      "Einnahmen unterstützen das Wohnheim und gemeinsame Projekte.",
    ],
    seoDescription:
      "Miete die RoKo-Bar im Studentenwohnheim Robert-Koch-Straße 38 in Göttingen. Faire Miete, klare Regeln und einfache Buchung für Bewohner:innen und Gäste.",
  },
  en: {
    heroTitle: "Rent the RoKo Bar for your next party.",
    heroSubtitle:
      "Student bar in the Robert-Koch-Str. 38 dorm in Göttingen. Fair rental, clear rules, short way home.",
    heroCTA: "Send booking request by email now",
    heroSecondaryCTA: "View prices & process",
    priceResidentTitle: "Residents",
    priceResidentAmount: "€75",
    priceResidentNote: "Applies to residents of the RoKo dormitory.",
    priceExternalTitle: "External guests",
    priceExternalAmount: "€100",
    priceExternalNote: "For guests who do not live in RoKo.",
    priceDepositTitle: "Deposit",
    priceDepositAmount: "€200",
    priceDepositNote:
      "Do NOT transfer with rent. Pay cash on key handover day; fully refunded with proper return.",
    processTitle: "How booking works",
    processSteps: [
      "You pick your date and send a request.",
      "We send you the right rental contract (€75 or €100).",
      "You sign and transfer the rent.",
      "We countersign and schedule the key handover.",
      "On key handover day you pay the €200 deposit in cash.",
    ],
    featuresTitle: "Why RoKo Bar?",
    featuresIntro:
      "Great atmosphere, solid equipment, and just downstairs in the dorm—ideal for birthdays, flat parties, and club events.",
    features: [
      "Cozy basement bar right inside the dormitory.",
      "Counter with tap system and fridges for drinks.",
      "Tables, stools, and plenty of space for birthdays, flat parties, and club events.",
      "Revenue supports the dorm community and shared projects.",
    ],
    seoDescription:
      "Rent the RoKo Bar at the dorm Robert-Koch-Str. 38 in Göttingen. Fair prices, clear rules, and simple booking for residents and guests.",
  },
};

export default function Home() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = texts[language] ?? texts.de;
  const baseTitle = "RoKo Bar Göttingen";

  const pageTitle = language === "de" ? "Startseite" : "Home";
  const fullTitle = `${pageTitle} – ${baseTitle}`;

  useEffect(() => {
    document.title = fullTitle;
  }, [fullTitle]);

  const priceHeading =
    language === "de" ? "Preise & Konditionen" : "Prices & Conditions";

  const featuresAlt =
    language === "de"
      ? "Barbereich der RoKo-Bar mit Theke und Kühlschrank"
      : "Bar area of the RoKo Bar with counter and fridges";

  const bookingLabel = language === "de" ? "Buchung" : "Booking";

  return (
    <div className="max-w-6xl mx-auto space-y-12 md:space-y-16">
      <Helmet>
        <title>{fullTitle}</title>
        <meta name="description" content={t.seoDescription} />
        <link rel="canonical" href="https://YOUR-DOMAIN-HERE.de/" />
        <html lang={language === "de" ? "de" : "en"} />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl min-h-[70vh] md:min-h-[80vh] border border-white/10 flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${section2})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/70 to-black/30" />

        <div className="relative z-10 max-w-2xl p-6 md:p-10 lg:p-14 flex flex-col gap-4 md:gap-5">
          <span className="text-xs uppercase tracking-[0.24em] text-orange-200/80">
            RoKo-Bar · Göttingen
          </span>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight drop-shadow-lg">
            {t.heroTitle}
          </h1>
          <p className="text-sm md:text-base text-zinc-200/90 leading-relaxed max-w-2xl">
            {t.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-center">
            <button
              type="button"
              onClick={() => navigate("/booking")}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-orange-500 text-white font-medium shadow-lg shadow-orange-500/40 hover:bg-orange-400 transition"
            >
              {t.heroCTA}
            </button>
            <a
              href="#prices"
              className="text-sm font-semibold text-zinc-100 hover:text-orange-200 underline decoration-orange-400/70 underline-offset-4"
            >
              {t.heroSecondaryCTA}
            </a>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="prices" className="space-y-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">
            {bookingLabel}
          </p>
          <h2 className="text-xl md:text-2xl font-semibold">{priceHeading}</h2>
          <p className="text-zinc-400 text-sm md:text-base mt-2">
            {language === "de"
              ? "Miete und Kaution werden klar getrennt. Die Kaution wird erst bei der Schlüsselübergabe in bar bezahlt."
              : "Rent and deposit are handled separately. The deposit is paid in cash only on the key handover day."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-card p-6 flex flex-col gap-2">
            <h3 className="text-lg font-semibold">{t.priceResidentTitle}</h3>
            <p className="text-3xl font-semibold text-orange-200">
              {t.priceResidentAmount}
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {t.priceResidentNote}
            </p>
          </div>

          <div className="glass-card p-6 flex flex-col gap-2">
            <h3 className="text-lg font-semibold">{t.priceExternalTitle}</h3>
            <p className="text-3xl font-semibold text-orange-200">
              {t.priceExternalAmount}
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {t.priceExternalNote}
            </p>
          </div>

          <div className="glass-card p-6 flex flex-col gap-2 border border-orange-500/70 bg-gradient-to-br from-orange-500/10 to-transparent">
            <h3 className="text-lg font-semibold">{t.priceDepositTitle}</h3>
            <p className="text-3xl font-semibold text-orange-200">
              {t.priceDepositAmount}
            </p>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {t.priceDepositNote}
            </p>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="glass-card p-6 md:p-8 space-y-6">
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
              <p className="text-zinc-100 leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold">
            {t.featuresTitle}
          </h2>
          <p className="text-zinc-300 leading-relaxed">{t.featuresIntro}</p>
          <ul className="space-y-3">
            {t.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-zinc-50">
                <span className="mt-2 w-2.5 h-2.5 rounded-full bg-orange-400" />
                <span className="leading-relaxed text-zinc-200">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="glass-card overflow-hidden border border-white/10">
          <img
            src={section1}
            alt={featuresAlt}
            className="w-full h-full object-cover"
          />
        </div>
      </section>
    </div>
  );
}

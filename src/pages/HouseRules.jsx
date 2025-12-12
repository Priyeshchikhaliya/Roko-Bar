import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext.jsx";

const rulesTexts = {
  de: {
    title: "Hausregeln der Heimkneipe",
    intro:
      "Die kurze, freundliche Version der Regeln: Bitte respektiert Bewohner:innen, Nachbarschaft und die Heimkneipe selbst. Dann bleibt die Bar für alle ein schöner Ort.",
    sections: [
      {
        heading: "Lautstärke & Nachbarn",
        points: [
          "Haltet die Lautstärke so gering, dass Bewohner:innen im RoKo und die Nachbarschaft schlafen können.",
          "Lasst die Tür zur Heimkneipe und die obere Tür zum Gemeinschaftshaus nicht dauerhaft offen.",
          "Ab 22 Uhr keine lauten Gruppen vor dem Gemeinschaftshaus – verlegt Gespräche nach drinnen.",
        ],
      },
      {
        heading: "Notausgang & Türen",
        points: [
          "Die Notausgangstür ist wirklich nur für Notfälle da – sie bleibt während der Party geschlossen.",
          "Der Notausgang darf nicht als zusätzlicher Eingang genutzt werden.",
          "Die Türen zur Bar und zum Gemeinschaftshaus sollen nicht offenstehen.",
        ],
      },
      {
        heading: "Kaution, Sauberkeit & Schäden",
        points: [
          "Ihr bekommt die 200 € Kaution vollständig zurück, wenn alles sauber und heil ist.",
          "Gebt die Heimkneipe so zurück, wie ihr sie übernommen habt – sonst behalten wir Reinigungskosten ein oder ihr müsst nachreinigen.",
          "Meldet Schäden oder fehlendes Inventar von euch aus. Reparaturen werden von der Kaution abgezogen; ist es teurer, zahlt ihr den Rest.",
        ],
      },
      {
        heading: "Keine kommerziellen Partys",
        points: [
          "Die Heimkneipe ist kein Club: Eintritt, Tickets oder andere Entgelte fürs Reinkommen sind nicht erlaubt.",
          "Getränkepreise dürfen nicht über den Selbstkostenpreis hinausgehen – keine Gewinne mit der Bar.",
          "Verstöße können dazu führen, dass die Kaution teilweise oder komplett einbehalten wird.",
        ],
      },
      {
        heading: "Parken & Feuerwehrzufahrt",
        points: [
          "Blockiert niemals die Feuerwehrzufahrt und nutzt nur erlaubte Stellplätze.",
          "Falls abgeschleppt werden muss, gehen die Kosten von eurer Kaution ab; bei höheren Kosten zahlt ihr den Rest.",
        ],
      },
      {
        heading: "Verantwortung & Anwesenheit",
        points: [
          "Die Person, die den Mietvertrag unterschreibt, muss während der gesamten Party anwesend sein.",
          "Ihr seid gegenüber der SV verantwortlich, dass alle Regeln eingehalten werden.",
          "Hinterlegt eure Handynummer, damit wir euch im Notfall erreichen können.",
          "SV-Vertretung und Heimsprecher:innen haben Hausrecht und dürfen die Räume betreten.",
        ],
      },
      {
        heading: "Wochenend-Regel & Gemeinschaftsraum",
        points: [
          "Die Heimkneipe wird in der Regel nur am Wochenende vermietet. Unter der Woche gibt es normalerweise keine Vermietungen – Details findest du auf der Buchungsseite.",
          "Der Gemeinschaftsraum im Gemeinschaftshaus ist ein eigener Raum und NICHT Teil der Heimkneipen-Miete.",
          "RoKo-Bewohner:innen dürfen den Gemeinschaftsraum ohne Buchung nutzen, aber er ist nicht für große Feiern oder Events mit vielen Getränken und Buffets gedacht.",
          "Wichtig: Die Notausgangstür bleibt zu; sie ist kein zweiter Eingang.",
        ],
      },
    ],
    footer:
      "Die vollständigen rechtlichen Regelungen findest du in den Mietverträgen und auf der Seite mit den Mietbedingungen.",
    seoTitle:
      "Hausregeln – RoKo-Heimkneipe im Studentenwohnheim Robert-Koch-Str. 38",
    seoDescription:
      "Kurze, freundliche Hausregeln für die RoKo-Heimkneipe in Göttingen: Lautstärke, Kaution, Sauberkeit, keine kommerziellen Partys, Wochenende-Regel und Notausgang.",
  },
  en: {
    title: "House rules of the RoKo Bar",
    intro:
      "A friendly summary of the rules: please respect residents, neighbours, and the bar itself so everyone keeps enjoying this place.",
    sections: [
      {
        heading: "Noise & neighbours",
        points: [
          "Keep the volume low enough for residents and neighbours to sleep.",
          "Do not leave the bar door or the upper community house door open for long.",
          "After 10 pm, no loud groups outside the community house – move chats indoors.",
        ],
      },
      {
        heading: "Emergency exit & doors",
        points: [
          "The emergency exit is only for emergencies – keep it closed during the party.",
          "Do not use the emergency exit as an extra entrance.",
          "Keep bar and community house doors closed, not propped open.",
        ],
      },
      {
        heading: "Deposit, cleaning & damages",
        points: [
          "You get the €200 deposit back in full if everything is clean and intact.",
          "Return the bar as tidy as you received it – otherwise cleaning costs may be kept from the deposit or you’ll need to clean again.",
          "Report damages or missing items proactively. Repairs are taken from the deposit; if costs exceed it, you cover the difference.",
        ],
      },
      {
        heading: "No commercial parties",
        points: [
          "This is not a club: no entry fees, tickets or other charges for coming in.",
          "Drink prices must not be above self-cost – no profit-making with the bar.",
          "Violations can lead to partial or full retention of the deposit.",
        ],
      },
      {
        heading: "Parking & fire access",
        points: [
          "Never block the fire lane; use only allowed parking spots.",
          "If towing is needed, costs will be taken from the deposit and you cover any extra.",
        ],
      },
      {
        heading: "Responsibility & presence",
        points: [
          "The person who signs the rental contract must be present for the entire event.",
          "You are responsible to the SV that all rules are respected.",
          "Leave your phone number so we can reach you if needed.",
          "SV reps and dorm speakers have house rights and may enter.",
        ],
      },
      {
        heading: "Weekend rule & common room",
        points: [
          "The bar is usually rented only on weekends. Weekday rentals are normally not available – see the booking page for details.",
          "The common room upstairs is separate and NOT part of the bar rental.",
          "RoKo residents may use the common room without booking, but it’s not meant for large parties or events with lots of food and drinks.",
          "Important: Keep the emergency exit door closed; it is not a second entrance.",
        ],
      },
    ],
    footer:
      "Find the full legal terms in the rental contracts and on the rental conditions page.",
    seoTitle: "House rules – RoKo Bar at Robert-Koch-Str. 38, Göttingen",
    seoDescription:
      "Friendly house rules for the RoKo Bar: noise, deposit, cleaning, no commercial parties, weekend-only rentals, emergency exit, and more.",
  },
};

export default function HouseRules() {
  const { language } = useLanguage();
  const t = rulesTexts[language] ?? rulesTexts.de;
  const baseTitle = "RoKo Bar Göttingen";

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Helmet>
        <title>{`${t.title} – ${baseTitle}`}</title>
        <meta name="description" content={t.seoDescription} />
        <link rel="canonical" href="https://YOUR-DOMAIN-HERE.de/house-rules" />
        <html lang={language === "de" ? "de" : "en"} />
      </Helmet>

      <div className="glass-card p-6 md:p-8 space-y-3">
        <h1 className="text-2xl md:text-3xl font-semibold">{t.title}</h1>
        <p className="text-sm md:text-base text-zinc-200 leading-relaxed">
          {t.intro}
        </p>
      </div>

      {t.sections.map((section) => (
        <div key={section.heading} className="glass-card p-6 md:p-8">
          <h2 className="text-xl font-semibold">{section.heading}</h2>
          <ul className="mt-3 space-y-2 text-sm md:text-base text-zinc-200 leading-relaxed">
            {section.points.map((point) => (
              <li key={point} className="flex gap-3">
                <span className="mt-2 w-2 h-2 rounded-full bg-orange-400" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <p className="text-xs text-zinc-400 text-center pb-6">
        {language === "de"
          ? "Details zur Buchung findest du auf der Buchungsseite. Die vollständigen rechtlichen Regelungen findest du in den Mietverträgen und auf der Seite mit den "
          : "For booking details please visit the booking page. Find the full legal terms in the rental contracts and on the "}
        <Link
          to="/booking"
          className="text-orange-300 hover:text-orange-200 underline underline-offset-4"
        >
          {language === "de" ? "Buchungsseite" : "booking page"}
        </Link>
        {language === "de" ? " sowie unter " : " and under "}
        <Link
          to="/terms"
          className="text-orange-300 hover:text-orange-200 underline underline-offset-4"
        >
          {language === "de" ? "Mietbedingungen" : "rental conditions"}
        </Link>
        .
      </p>
    </div>
  );
}

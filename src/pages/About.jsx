import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/LanguageContext.jsx";
import { Link } from "react-router-dom";
import rokoImage from "../assets/roko_image.jpeg";

const EMAIL = "heimkneipe@roko-goettingen.de";
const ADDRESS_LINE_1 = "Robert-Koch-Straße 38";
const ADDRESS_LINE_2 = "37075 Göttingen, Deutschland";

const aboutTexts = {
  de: {
    title: "Über RoKo & die Heimkneipe",
    subtitle:
      "RoKo 38 ist eines der größten Studentenwohnheime Göttingens – und die Heimkneipe im Keller ist unser gemeinsames Wohnzimmer.",
    introParagraphs: [
      "Im Studentenwohnheim Robert-Koch-Straße 38 – kurz RoKo – leben Studierende aus ganz unterschiedlichen Studiengängen, Ländern und Kulturen unter einem Dach.",
      "Die Heimkneipe im Keller ist der Ort für WG-Partys, Geburtstage, Fachschafts-Events und alles, was zu einem lebendigen Wohnheim dazugehört – mit Theke, Zapfanlage, Kühlschränken und genug Platz zum Feiern.",
    ],
    vibeTitle: "Was RoKo besonders macht",
    vibePoints: [
      "Großes Hochhaus mit vielen Studis, kurzen Wegen und jeder Menge Geschichten.",
      "Eigene Heimkneipe im Keller – keine weite Anfahrt, nach der Party geht es einfach mit dem Aufzug nach Hause.",
      "Engagierte Bewohner:innen, die Veranstaltungen organisieren und sich um Bar, Technik und Hausregeln kümmern.",
      "Die Einnahmen aus der Vermietung helfen dabei, Ausgaben rund ums Wohnheim und gemeinsame Projekte zu stemmen.",
    ],
    barTitle: "Die Heimkneipe in RoKo 38",
    barParagraphs: [
      "Die Heimkneipe ist ein separater Raum im Keller des RoKo mit Tresen, Zapfanlage, Kühlschränken und Sitzmöglichkeiten. Sie kann von RoKo-Bewohner:innen und externen Gruppen gemietet werden.",
      "Damit alle etwas davon haben, gibt es klare Regeln: faire Mieten, Kaution zur Absicherung und Hausregeln, die Rücksicht auf alle Bewohner:innen nehmen.",
    ],
    contactTitle: "Kontakt & Anfahrt",
    addressLabel: "Adresse",
    emailLabel: "E-Mail",
    directionsText:
      "Für die Routenplanung kannst du die eingeblendete Karte oder Google Maps verwenden:",
    osmLabel: "OpenStreetMap öffnen",
    gmapsLabel: "Google Maps (Routenplanung)",
    bookingTeaser:
      "Du möchtest die Heimkneipe nutzen? Alle Infos zur Buchung findest du hier:",
    bookingButton: "Zur Buchungsseite",
    mapHint:
      "Tipp: Die Heimkneipe befindet sich im Keller des RoKo. Der Eingang ist ausgeschildert, bitte nutze nicht den Notausgang als Eingang.",
    seoTitle:
      "Über RoKo 38 & die Heimkneipe – Studentenwohnheim Robert-Koch-Straße 38, Göttingen",
    seoDescription:
      "Erfahre mehr über das Studentenwohnheim RoKo 38 in Göttingen und die Heimkneipe im Keller. Infos zur Atmosphäre, Nutzung der Bar, Adresse und Anfahrt.",
  },
  en: {
    title: "About RoKo & the student bar",
    subtitle:
      "RoKo 38 is one of the largest student dorms in Göttingen – and the basement bar is our shared living room.",
    introParagraphs: [
      "The student dormitory at Robert-Koch-Str. 38 – usually called RoKo – is home to students from many different study programs, countries and cultures.",
      "The Heimkneipe (student bar) in the basement is the place for birthday parties, flat parties, student society events and everything that makes dorm life fun – with bar counter, taps, fridges and plenty of space.",
    ],
    vibeTitle: "What makes RoKo special",
    vibePoints: [
      "A big high-rise with lots of students, short distances and countless stories.",
      "Own student bar in the basement – no long way home, just take the elevator after the party.",
      "Engaged residents who organize events and take care of the bar, equipment and house rules.",
      "The income from renting the bar helps to cover costs around the dorm and support joint projects.",
    ],
    barTitle: "The RoKo basement bar",
    barParagraphs: [
      "The student bar is a separate room in the basement of RoKo with counter, taps, fridges and seating. It can be rented by RoKo residents and external groups.",
      "To make it fair for everyone, there are clear rules: transparent rental fees, a deposit for safety and house rules that respect all residents.",
    ],
    contactTitle: "Contact & directions",
    addressLabel: "Address",
    emailLabel: "Email",
    directionsText:
      "For directions you can use either OpenStreetMap or Google Maps:",
    osmLabel: "Open in OpenStreetMap",
    gmapsLabel: "Google Maps (route planner)",
    bookingTeaser:
      "Want to use the bar for your event? You can find all booking information here:",
    bookingButton: "Go to booking page",
    mapHint:
      "Tip: The bar is located in the basement of RoKo. The entrance is signposted – please do not use the emergency exit as an entrance.",
    seoTitle:
      "About RoKo 38 & the student bar – dormitory at Robert-Koch-Str. 38, Göttingen",
    seoDescription:
      "Learn more about the RoKo 38 student dorm in Göttingen and its basement bar. Atmosphere, bar usage, address and directions at a glance.",
  },
};

// --- Accurate coordinates for RoKo Bar entrance ---
const LAT = 51.549126;
const LON = 9.939261;

// OpenStreetMap embed (nice zoomed frame around the dorm)
const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
  LON - 0.002
}%2C${LAT - 0.0015}%2C${LON + 0.002}%2C${
  LAT + 0.0015
}&layer=mapnik&marker=${LAT}%2C${LON}`;

// Google Maps directions (desktop)
const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${LAT},${LON}`;

// Android/iOS geo deep link (mobile)
const geoLink = `geo:${LAT},${LON}?z=19`;

export default function About() {
  const { language } = useLanguage();
  const t = aboutTexts[language] ?? aboutTexts.de;
  const baseTitle = "RoKo Bar Göttingen";

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      <Helmet>
        <title>{`${t.title} – ${baseTitle}`}</title>
        <meta name="description" content={t.seoDescription} />
        <link rel="canonical" href="https://YOUR-DOMAIN-HERE.de/about" />
        <html lang={language === "de" ? "de" : "en"} />
      </Helmet>

      {/* Hero / image + text */}
      <section className="grid gap-6 md:grid-cols-2 items-stretch">
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
          <img
            src={rokoImage}
            alt={
              language === "de"
                ? "Studentenwohnheim RoKo 38 in Göttingen"
                : "RoKo 38 student dormitory in Göttingen"
            }
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        <div className="glass-card p-6 md:p-8 flex flex-col justify-center gap-4">
          <h1 className="text-2xl md:text-3xl font-semibold">{t.title}</h1>
          <p className="text-sm md:text-base text-zinc-200">{t.subtitle}</p>
          {t.introParagraphs.map((p) => (
            <p
              key={p}
              className="text-sm md:text-base text-zinc-300 leading-relaxed"
            >
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* What makes RoKo special */}
      <section className="glass-card p-6 md:p-8 space-y-4">
        <h2 className="text-xl md:text-2xl font-semibold">{t.vibeTitle}</h2>
        <ul className="mt-2 space-y-2 text-sm md:text-base text-zinc-200">
          {t.vibePoints.map((point) => (
            <li key={point} className="flex gap-2">
              <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Bar description */}
      <section className="glass-card p-6 md:p-8 space-y-4">
        <h2 className="text-xl md:text-2xl font-semibold">{t.barTitle}</h2>
        {t.barParagraphs.map((p) => (
          <p
            key={p}
            className="text-sm md:text-base text-zinc-300 leading-relaxed"
          >
            {p}
          </p>
        ))}
      </section>

      {/* Contact & map / directions */}
      <section className="grid gap-6 md:grid-cols-2 items-stretch">
        {/* Contact + directions text */}
        <div className="glass-card p-6 md:p-8 flex flex-col justify-between h-full">
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold">
              {t.contactTitle}
            </h2>

            <div className="space-y-3 text-sm md:text-base">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                  {t.addressLabel}
                </div>
                <div className="text-zinc-100">
                  {ADDRESS_LINE_1}
                  <br />
                  {ADDRESS_LINE_2}
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                  {t.emailLabel}
                </div>
                <a
                  href={`mailto:${EMAIL}`}
                  className="text-orange-400 hover:text-orange-300 underline"
                >
                  {EMAIL}
                </a>
              </div>
            </div>

            <p className="mt-2 text-xs md:text-sm text-zinc-400">{t.mapHint}</p>

            <div className="mt-4 space-y-2 text-xs md:text-sm text-zinc-300">
              <p>{t.directionsText}</p>
            </div>
          </div>

          {/* Google directions button at the bottom of the card */}
          <div className="mt-6">
            <a
              href={geoLink}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                  e.preventDefault();
                  window.location.href = gmapsUrl;
                }
              }}
              className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-orange-500/70 bg-orange-500/10 text-xs md:text-sm text-orange-200 hover:bg-orange-500/20 transition"
            >
              {t.gmapsLabel}
            </a>
          </div>
        </div>

        {/* Small embedded map box – same height as contact card */}
        <div className="glass-card p-0 overflow-hidden h-full">
          <div className="relative w-full h-full">
            <iframe
              title={
                language === "de"
                  ? "Karte: Studentenwohnheim RoKo 38 in Göttingen"
                  : "Map: RoKo 38 student dormitory in Göttingen"
              }
              src={osmEmbedUrl}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

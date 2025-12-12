import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/LanguageContext.jsx";

const texts = {
  de: {
    title: "Impressum",
    seoTitle: "Impressum – RoKo-Heimkneipe, Robert-Koch-Str. 38, Göttingen",
    seoDescription:
      "Impressum der RoKo-Heimkneipe im Studentenwohnheim Robert-Koch-Str. 38, Göttingen. Ansprechpartner und Hinweise zum nicht-kommerziellen Studentenprojekt.",
    operator: "Betreiber: Studentenwohnheim Robert-Koch-Straße 38, 37075 Göttingen",
    managedBy: "Verantwortlich: Bewohner:innen des RoKo 38, Heimkneipe-Team",
    emailLabel: "E-Mail",
    disclaimer:
      "Hinweis: Die Heimkneipe ist ein nicht-kommerzielles Studentenprojekt und keine geschäftsmäßige Website. Inhalte dienen ausschließlich der Information zu Vermietung und Nutzung der Bar.",
  },
  en: {
    title: "Legal Notice",
    seoTitle: "Legal Notice – RoKo Bar, Robert-Koch-Str. 38, Göttingen",
    seoDescription:
      "Legal notice for the RoKo Bar at the dormitory Robert-Koch-Str. 38, Göttingen. Student-run, non-commercial project.",
    operator: "Operator: Studentenwohnheim Robert-Koch-Straße 38, 37075 Göttingen",
    managedBy: "Managed by: Residents of RoKo 38, Heimkneipe team",
    emailLabel: "Email",
    disclaimer:
      "Note: This bar website is a non-commercial student project, not a business website. Information is solely about renting and using the student bar.",
  },
};

export default function Impressum() {
  const { language } = useLanguage();
  const t = texts[language] ?? texts.de;
  const pageTitles = {
    de: "Impressum – RoKo Bar Göttingen",
    en: "Legal notice – RoKo Bar Göttingen",
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
        <link rel="canonical" href="https://YOUR-DOMAIN-HERE.de/impressum" />
        <html lang={language === "de" ? "de" : "en"} />
      </Helmet>

      <div className="glass-card p-6 md:p-8 space-y-4">
        <h1 className="text-2xl md:text-3xl font-semibold">{t.title}</h1>
        <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
          {t.operator}
        </p>
        <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
          {t.managedBy}
        </p>
        <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
          {t.emailLabel}:{" "}
          <a
            href="mailto:heimkneipe@roko-goettingen.de"
            className="text-orange-300 hover:text-orange-200 underline underline-offset-4"
          >
            heimkneipe@roko-goettingen.de
          </a>
        </p>
        <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
          {t.disclaimer}
        </p>
      </div>
    </div>
  );
}

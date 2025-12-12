// src/components/Footer.jsx
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function Footer() {
  const year = new Date().getFullYear();
  const { language } = useLanguage();

  const labels =
    language === "de"
      ? {
          impressum: "Impressum",
          privacy: "Datenschutz",
          terms: "Mietbedingungen",
          rules: "Hausordnung",
          brand:
            "© " +
            year +
            " RoKo-Bar · Studentenwohnheim Robert-Koch-Str. 38, Göttingen",
        }
      : {
          impressum: "Legal notice",
          privacy: "Privacy",
          terms: "Rental terms",
          rules: "House rules",
          brand:
            "© " +
            year +
            " RoKo Bar · Student dormitory Robert-Koch-Str. 38, Göttingen",
        };

  return (
    <footer className="border-t border-zinc-800 mt-10">
      <div className="max-w-6xl mx-auto px-4 py-6 text-xs flex flex-col md:flex-row items-center justify-between gap-3 text-zinc-400">
        <span>{labels.brand}</span>

        <div className="flex flex-wrap gap-4">
          <Link to="/impressum" className="hover:text-zinc-200">
            {labels.impressum}
          </Link>
          <Link to="/datenschutz" className="hover:text-zinc-200">
            {labels.privacy}
          </Link>
          <Link to="/terms" className="hover:text-zinc-200">
            {labels.terms}
          </Link>
          <Link to="/house-rules" className="hover:text-zinc-200">
            {labels.rules}
          </Link>
        </div>
      </div>
    </footer>
  );
}

// src/components/Layout.jsx
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/LanguageContext.jsx";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

export default function Layout({ children }) {
  const { language } = useLanguage();
  const fallbackTitle =
    language === "de"
      ? `RoKo Bar Göttingen – Studentenbar & Vermietung`
      : `RoKo Bar Göttingen – Student bar & rentals`;
  const fallbackDescription =
    language === "de"
      ? "Miete die RoKo-Heimkneipe im Wohnheim Robert-Koch-Str. 38 in Göttingen. Infos zu Buchung, Hausregeln und Ansprechpartnern."
      : "Rent the RoKo bar at the dormitory Robert-Koch-Str. 38 in Göttingen. Info on booking, house rules, and contact.";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-neutral-950 via-black to-neutral-900 text-zinc-50">
      <Helmet>
        <title>{fallbackTitle}</title>
        <meta name="description" content={fallbackDescription} />
        <html lang={language === "de" ? "de" : "en"} />
      </Helmet>
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}

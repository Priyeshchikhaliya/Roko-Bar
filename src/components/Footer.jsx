// src/components/Footer.jsx
import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-800 mt-10">
      <div className="max-w-6xl mx-auto px-4 py-6 text-xs flex flex-col md:flex-row items-center justify-between gap-3 text-zinc-400">
        <span>
          © {year} RoKo-Bar · Studentenwohnheim Robert-Koch-Str. 38, Göttingen
        </span>

        <div className="flex flex-wrap gap-4">
          <Link to="/impressum" className="hover:text-zinc-200">
            Impressum
          </Link>
          <Link to="/datenschutz" className="hover:text-zinc-200">
            Datenschutz
          </Link>
          <Link to="/terms" className="hover:text-zinc-200">
            Mietbedingungen
          </Link>
          <Link to="/house-rules" className="hover:text-zinc-200">
            Hausordnung
          </Link>
        </div>
      </div>
    </footer>
  );
}

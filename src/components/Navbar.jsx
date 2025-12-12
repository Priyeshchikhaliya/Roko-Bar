// src/components/Navbar.jsx
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext.jsx";

const navLinkBase =
  "text-sm md:text-base px-3 py-2 rounded-full transition-colors";
const navLinkActive = "bg-zinc-800 text-zinc-50";
const navLinkInactive = "text-zinc-300 hover:bg-zinc-800/60";

function LanguageToggle({ onAfterToggle }) {
  const { language, toggleLanguage } = useLanguage();
  const isGerman = language === "de";

  const handleClick = () => {
    toggleLanguage();
    if (onAfterToggle) onAfterToggle();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-xs border border-zinc-700 rounded-full px-1 py-1 text-zinc-300 hover:border-zinc-500 bg-zinc-900 flex items-center gap-1"
    >
      <span
        className={`px-2 py-1 rounded-full font-semibold transition-colors ${
          isGerman ? "bg-zinc-700 text-zinc-50" : "text-zinc-400"
        }`}
      >
        DE
      </span>
      <span
        className={`px-2 py-1 rounded-full font-semibold transition-colors ${
          !isGerman ? "bg-zinc-700 text-zinc-50" : "text-zinc-400"
        }`}
      >
        EN
      </span>
    </button>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  const brandTop =
    language === "de" ? "Studentenwohnheim" : "Student dormitory";
  const rulesLabel = language === "de" ? "Hausregeln" : "House rules";
  const bookingLabel = language === "de" ? "Buchen" : "Booking";
  const aboutLabel = language === "de" ? "Über die Bar" : "About the bar";

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-black/70 backdrop-blur-md border-b border-zinc-800">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo / Brand */}
        <Link to="/" className="flex flex-col leading-tight">
          <span className="uppercase tracking-[0.22em] text-xs text-zinc-400">
            {brandTop}
          </span>
          <span className="text-sm md:text-lg font-semibold">
            RoKo-Bar · Robert-Koch-Str. 38
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <NavLink
              to="/booking"
              onClick={closeMenu}
              className={({ isActive }) =>
                `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive}`
              }
            >
              {bookingLabel}
            </NavLink>
            <NavLink
              to="/house-rules"
              onClick={closeMenu}
              className={({ isActive }) =>
                `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive}`
              }
            >
              {rulesLabel}
            </NavLink>
            <NavLink
              to="/about"
              onClick={closeMenu}
              className={({ isActive }) =>
                `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive}`
              }
            >
              {aboutLabel}
            </NavLink>

            <div className="ml-2">
              <LanguageToggle />
            </div>
          </div>

          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-full border border-zinc-700 text-zinc-200 hover:bg-zinc-800 transition"
            onClick={toggleMenu}
            aria-label="Toggle navigation"
          >
            <span className="sr-only">Toggle navigation</span>
            <div className="space-y-1">
              <span
                className={`block h-0.5 w-5 bg-zinc-200 transition-transform ${
                  isOpen ? "rotate-45 translate-y-1.5" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-zinc-200 transition-opacity ${
                  isOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-zinc-200 transition-transform ${
                  isOpen ? "-rotate-45 -translate-y-1.5" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </nav>

      {isOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-black/95">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-2">
            <NavLink
              to="/booking"
              onClick={closeMenu}
              className={({ isActive }) =>
                `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive} w-full text-left`
              }
            >
              {bookingLabel}
            </NavLink>
            <NavLink
              to="/house-rules"
              onClick={closeMenu}
              className={({ isActive }) =>
                `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive} w-full text-left`
              }
            >
              {rulesLabel}
            </NavLink>
            <NavLink
              to="/about"
              onClick={closeMenu}
              className={({ isActive }) =>
                `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive} w-full text-left`
              }
            >
              {aboutLabel}
            </NavLink>

            <div className="pt-2">
              <LanguageToggle onAfterToggle={closeMenu} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

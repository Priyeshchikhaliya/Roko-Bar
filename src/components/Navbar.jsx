// src/components/Navbar.jsx
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useLanguage } from "../context/useLanguage.js";

const navLinkBase =
  "text-xs uppercase tracking-[0.14em] px-2 py-3.5 border-b transition-colors whitespace-nowrap";
const navLinkActive = "border-primary text-ink";
const navLinkInactive = "border-transparent text-muted hover:text-primary";

function LanguageToggle({ onAfterToggle }) {
  const { lang, toggleLanguage, t } = useLanguage();
  const isGerman = lang === "de";

  const handleClick = () => {
    toggleLanguage();
    if (onAfterToggle) onAfterToggle();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="min-h-11 text-xs border border-line px-1 py-1 text-muted hover:border-primary bg-surface flex items-center gap-1 transition-colors"
    >
      <span
        className={`px-2 py-1 font-semibold transition-colors ${
          isGerman ? "bg-primary text-surface" : "text-muted"
        }`}
      >
        {t.common.languageLabels.de}
      </span>
      <span
        className={`px-2 py-1 font-semibold transition-colors ${
          !isGerman ? "bg-primary text-surface" : "text-muted"
        }`}
      >
        {t.common.languageLabels.en}
      </span>
    </button>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const primaryLinks = [
    { to: t.common.links.home, label: t.nav.home, end: true },
    { to: t.common.links.booking, label: t.nav.booking },
    { to: t.common.links.about, label: t.nav.about },
    { to: t.common.links.team, label: t.nav.team },
    { to: t.common.links.directions, label: t.nav.directions },
  ];
  const secondaryLinks = [
    { to: t.common.links.houseRules, label: t.nav.houseRules },
    { to: t.common.links.terms, label: t.footer.terms },
    { to: t.common.links.alumni, label: t.nav.alumni },
    { to: t.common.links.impressum, label: t.footer.impressum },
    { to: t.common.links.datenschutz, label: t.footer.datenschutz },
  ];

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-line">
      <nav className="container-wide py-3 flex flex-wrap items-center justify-between gap-3 md:gap-4">
        <Link
          to={t.common.links.home}
          className="flex flex-col leading-tight min-w-fit"
        >
          <span className="uppercase tracking-[0.22em] text-xs text-muted">
            {t.nav.brandTop}
          </span>
          <span className="text-sm md:text-lg font-semibold text-primary-dark">
            {t.nav.brandMain}
          </span>
        </Link>

        <div className="flex items-center gap-2 flex-1 md:flex-none justify-end flex-wrap">
          <div className="hidden md:flex items-center gap-2 flex-wrap">
            {primaryLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `${navLinkBase} ${
                    isActive ? navLinkActive : navLinkInactive
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="ml-2">
              <LanguageToggle />
            </div>
          </div>

          <button
            type="button"
            className="md:hidden inline-flex h-11 w-11 items-center justify-center border border-line text-ink hover:border-primary transition"
            onClick={toggleMenu}
            aria-label={t.nav.toggleAria}
          >
            <span className="sr-only">{t.nav.toggleSr}</span>
            <div className="space-y-1">
              <span
                className={`block h-0.5 w-5 bg-ink transition-transform ${
                  isOpen ? "rotate-45 translate-y-1.5" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-ink transition-opacity ${
                  isOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-ink transition-transform ${
                  isOpen ? "-rotate-45 -translate-y-1.5" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </nav>

      {isOpen && (
        <div className="md:hidden border-t border-line bg-surface">
          <div className="container-wide py-5 flex flex-col gap-1">
            {[...primaryLinks, ...secondaryLinks].map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `${navLinkBase} ${
                    isActive ? navLinkActive : navLinkInactive
                  } w-full text-left`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="pt-2">
              <LanguageToggle onAfterToggle={closeMenu} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

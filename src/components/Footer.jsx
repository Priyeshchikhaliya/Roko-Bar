// src/components/Footer.jsx
import { Link } from "react-router-dom";
import { useLanguage } from "../context/useLanguage.js";

export default function Footer() {
  const year = new Date().getFullYear();
  const { t } = useLanguage();
  const brand = t.footer.brandTemplate.replace("{year}", year);
  const footerLinks = [
    { to: t.common.links.houseRules, label: t.footer.houseRules },
    { to: t.common.links.terms, label: t.footer.terms },
    { to: t.common.links.alumni, label: t.footer.alumni },
    { to: t.common.links.impressum, label: t.footer.impressum },
    { to: t.common.links.datenschutz, label: t.footer.datenschutz },
  ];

  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-wide py-10 md:py-14 text-xs flex flex-col md:flex-row md:items-end justify-between gap-8 text-muted">
        <span className="max-w-md leading-relaxed">{brand}</span>

        <div className="flex flex-wrap gap-x-5 gap-y-3 md:justify-end">
          {footerLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-muted hover:text-primary uppercase tracking-[0.14em]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

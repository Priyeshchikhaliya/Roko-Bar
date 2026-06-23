import { useEffect, useState } from "react";
import LanguageContext from "./LanguageContextValue.js";
import translations from "../i18n/translations.js";

const STORAGE_KEY = "roko-language";
const DEFAULT_LANG = "de";

function normalizeLanguage(value) {
  return value === "de" || value === "en" ? value : DEFAULT_LANG;
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_LANG;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return normalizeLanguage(stored);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const setLang = (nextLang) => {
    setLangState((currentLang) =>
      normalizeLanguage(
        typeof nextLang === "function" ? nextLang(currentLang) : nextLang,
      ),
    );
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === "de" ? "en" : "de"));
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        language: lang,
        setLang,
        setLanguage: setLang,
        toggleLanguage,
        t: translations[lang] ?? translations[DEFAULT_LANG],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

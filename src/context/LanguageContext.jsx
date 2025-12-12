import { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext();
const STORAGE_KEY = "roko-language";

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") return "de";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "de" || stored === "en" ? stored : "de";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "de" ? "en" : "de"));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export default LanguageContext;

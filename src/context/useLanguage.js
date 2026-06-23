import { useContext } from "react";
import LanguageContext from "./LanguageContextValue.js";

export function useLanguage() {
  return useContext(LanguageContext);
}

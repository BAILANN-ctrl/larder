import { createContext, useContext, useMemo, useState, useCallback } from "react";
import { translations, SUPPORTED_LANGUAGES } from "../i18n/translations.js";

const LanguageContext = createContext(null);

const STORAGE_KEY = "foodfinder-lang";
const DEFAULT_LANG = "en";

function getInitialLang() {
  const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
  if (stored && translations[stored]) return stored;
  return DEFAULT_LANG;
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang);

  const setLang = useCallback((next) => {
    if (!translations[next]) return;
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  // `t` is a tiny lookup helper: t('searchButton') -> localized string,
  // falling back to English then the key itself so missing translations
  // never render blank UI.
  const t = useCallback(
    (key) => translations[lang]?.[key] ?? translations[DEFAULT_LANG]?.[key] ?? key,
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, t, languages: SUPPORTED_LANGUAGES }),
    [lang, setLang, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}

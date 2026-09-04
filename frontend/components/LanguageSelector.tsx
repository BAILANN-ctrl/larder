"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function LanguageSelector() {
  const { lang, setLang, languages } = useLanguage();

  return (
    <select
      className="py-2 px-3 rounded border border-border bg-surface text-sm"
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      aria-label="Select language"
    >
      {languages.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}

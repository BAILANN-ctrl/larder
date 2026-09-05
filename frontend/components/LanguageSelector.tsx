"use client";

import { useLanguage } from "@/context/LanguageContext";
import { IonGlobe, IonChevronDown } from "@/components/icons";

export default function LanguageSelector() {
  const { lang, setLang, languages } = useLanguage();

  return (
    <div className="relative">
      <IonGlobe className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-taupe" />
      <select
        className="appearance-none rounded-full border border-black/[0.07] bg-paper/70 py-2 pl-9 pr-9 text-sm text-cocoa outline-none transition-colors duration-500 ease-luxe hover:bg-paper focus:bg-paper"
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        aria-label="Select language"
      >
        {languages.map((l) => (
          <option key={l.code} value={l.code} className="bg-paper text-espresso">
            {l.label}
          </option>
        ))}
      </select>
      <IonChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-taupe" />
    </div>
  );
}
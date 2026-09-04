import { useLanguage } from "../context/LanguageContext.jsx";

export default function LanguageSelector() {
  const { lang, setLang, languages } = useLanguage();

  return (
    <select
      className="language-selector"
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

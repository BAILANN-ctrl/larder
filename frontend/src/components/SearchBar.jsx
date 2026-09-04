import { useState } from "react";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function SearchBar({ onSearch, initialQuery = "" }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState(initialQuery);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) onSearch(trimmed);
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchPlaceholder")}
      />
      <button type="submit">{t("searchButton")}</button>
    </form>
  );
}

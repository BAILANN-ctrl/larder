"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

export default function SearchBar({
  onSearch,
  initialQuery = "",
}: SearchBarProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState(initialQuery);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) onSearch(trimmed);
  }

  return (
    <form className="flex gap-2 mb-6" onSubmit={handleSubmit}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchPlaceholder")}
        className="flex-1 py-3 px-4 rounded border border-border text-base bg-surface"
      />
      <button
        type="submit"
        className="py-3 px-5 rounded border-none bg-primary text-white font-semibold cursor-pointer hover:bg-primary-dark"
      >
        {t("searchButton")}
      </button>
    </form>
  );
}

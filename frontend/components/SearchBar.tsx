"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { IonArrowUpRight, IonSearch } from "@/components/icons";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  large?: boolean;
}

export default function SearchBar({
  onSearch,
  initialQuery = "",
  large = false,
}: SearchBarProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState(initialQuery);
  const hasText = query.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) onSearch(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`rounded-full bg-black/[0.035] p-1.5 ring-1 ring-black/[0.05] shadow-shell transition-shadow duration-700 ease-luxe focus-within:shadow-float ${
          large ? "p-2" : ""
        }`}
      >
        <div className="flex items-center rounded-full bg-paper/95 px-5 ring-1 ring-white/60 shadow-inset">
          <IonSearch
            className={`shrink-0 text-taupe ${large ? "h-5 w-5" : "h-4 w-4"}`}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className={`w-full bg-transparent outline-none placeholder:text-taupe ${
              large ? "py-4 pl-4 text-lg md:py-5 md:text-xl" : "py-2.5 pl-4 text-base"
            }`}
          />
          <button
            type="submit"
            disabled={!hasText}
            className={`group flex shrink-0 items-center gap-3 rounded-full bg-espresso text-cream transition-all duration-700 ease-luxe hover:bg-olive active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-espresso ${
              large ? "pl-6 pr-1.5 py-1.5" : "pl-5 pr-1 py-1"
            }`}
          >
            <span
              className={`font-medium uppercase tracking-wider ${
                large ? "text-sm" : "text-xs"
              }`}
            >
              {t("searchButton")}
            </span>
            <span
              className={`flex items-center justify-center rounded-full bg-white/10 transition-all duration-700 ease-luxe group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105 group-hover:bg-white/15 ${
                large ? "h-10 w-10" : "h-8 w-8"
              }`}
            >
              <IonArrowUpRight className={large ? "h-[18px] w-[18px]" : "h-3.5 w-3.5"} />
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}
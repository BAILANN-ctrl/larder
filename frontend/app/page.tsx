"use client";

import { useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { searchProducts, getProduct, getBillingStatus, getRecentSearches } from "@/lib/api";
import LanguageSelector from "@/components/LanguageSelector";
import SearchBar from "@/components/SearchBar";
import ProductCard from "@/components/ProductCard";
import ProductDetail from "@/components/ProductDetail";
import SubscriptionControl from "@/components/SubscriptionControl";
import { Product, BillingStatus } from "@/types";

export default function Home() {
  const { lang, t } = useLanguage();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [billing, setBilling] = useState<BillingStatus>({
    configured: false,
    subscribed: false,
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [checkoutNotice, setCheckoutNotice] = useState<"success" | "cancelled" | null>(null);

  const refreshRecentSearches = useCallback(async () => {
    try {
      const { terms } = await getRecentSearches();
      setRecentSearches(terms);
    } catch (err) {
      console.error("Could not fetch recent searches:", err);
    }
  }, []);

  const refreshBillingStatus = useCallback(async () => {
    try {
      const status = await getBillingStatus();
      setBilling(status);
    } catch (err) {
      console.error("Could not fetch billing status:", err);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (checkout === "success") setCheckoutNotice("success");
    if (checkout === "cancelled") setCheckoutNotice("cancelled");
    if (checkout) {
      window.history.replaceState({}, "", window.location.pathname);
    }
    refreshBillingStatus();
    refreshRecentSearches();
  }, [refreshBillingStatus, refreshRecentSearches]);

  const runSearch = useCallback(
    async (searchTerm: string) => {
      setQuery(searchTerm);
      setSelectedProduct(null);
      setLoading(true);
      setError(null);
      setHasSearched(true);
      try {
        const data = await searchProducts(searchTerm, lang);
        setResults(data.products);
        refreshRecentSearches();
      } catch (err) {
        console.error(err);
        setError(t("error"));
      } finally {
        setLoading(false);
      }
    },
    [lang, t, refreshRecentSearches]
  );

  useEffect(() => {
    if (query) runSearch(query);
  }, [lang]);

  async function handleSelectProduct(id: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await getProduct(id, lang);
      setSelectedProduct(data.product);
    } catch (err) {
      console.error(err);
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-6 pb-16">
      <header className="app__header flex justify-between items-start flex-wrap gap-4 mb-6">
        <div>
          <h1 className="m-0 text-[1.75rem]">{t("appName")}</h1>
          <p className="mt-1 text-muted">{t("tagline")}</p>
        </div>
        <div className="app__header-controls flex items-center gap-3">
          <SubscriptionControl
            subscribed={billing.subscribed}
            configured={billing.configured}
          />
          <LanguageSelector />
        </div>
      </header>

      {checkoutNotice && (
        <div
          className={`p-3 rounded mb-4 text-sm ${
            checkoutNotice === "success"
              ? "bg-green-50 text-primary-dark"
              : "bg-red-50 text-red-800"
          }`}
        >
          {checkoutNotice === "success"
            ? t("checkoutSuccess")
            : t("checkoutCancelled")}
        </div>
      )}

      <main>
        {!selectedProduct && (
          <SearchBar onSearch={runSearch} initialQuery={query} />
        )}

        {!loading && !selectedProduct && recentSearches.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-muted">{t("recentSearches")}:</span>
            {recentSearches.map((term) => (
              <button
                key={term}
                onClick={() => runSearch(term)}
                className="py-1 px-3 rounded-full text-sm border border-border bg-surface hover:bg-gray-100 cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <p className="text-muted text-center py-8">{t("loading")}</p>
        )}
        {error && (
          <p className="text-red-700 text-center py-8">{error}</p>
        )}

        {!loading && !error && selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onBack={() => setSelectedProduct(null)}
            subscribed={billing.subscribed}
          />
        )}

        {!loading && !error && !selectedProduct && (
          <>
            {!hasSearched && (
              <p className="text-muted text-center py-8">{t("startPrompt")}</p>
            )}
            {hasSearched && results.length === 0 && (
              <p className="text-muted text-center py-8">{t("noResults")}</p>
            )}
            <div className="product-grid">
              {results.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={handleSelectProduct}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { searchProducts, getProduct, getBillingStatus, getRecentSearches } from "@/lib/api";
import SearchBar from "@/components/SearchBar";
import ProductCard from "@/components/ProductCard";
import ProductDetail from "@/components/ProductDetail";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Marquee from "@/components/Marquee";
import Reveal from "@/components/Reveal";
import { ScrollTrigger } from "@/lib/gsap";
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
      } catch (err: any) {
        console.error(err);
        setError(err?.message || t("error"));
      } finally {
        setLoading(false);
      }
    },
    [lang, t, refreshRecentSearches]
  );

  useEffect(() => {
    if (query) runSearch(query);
  }, [lang, runSearch]);

  useEffect(() => {
    ScrollTrigger.refresh();
  }, [hasSearched, selectedProduct]);

  async function handleSelectProduct(id: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await getProduct(id, lang);
      setSelectedProduct(data.product);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || t("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] pb-24">
      {checkoutNotice && (
        <div className="px-4 pt-4">
          <Reveal>
            <div
              className={`mx-auto flex max-w-[1200px] items-center gap-3 rounded-full px-5 py-3 text-sm ring-1 ${
                checkoutNotice === "success"
                  ? "bg-olive/10 text-olive ring-olive/25"
                  : "bg-cocoa/10 text-cocoa ring-cocoa/25"
              }`}
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-current opacity-60" />
              {checkoutNotice === "success"
                ? t("checkoutSuccess")
                : t("checkoutCancelled")}
            </div>
          </Reveal>
        </div>
      )}

      <main className="w-full max-w-full overflow-x-clip">
        {!selectedProduct && !hasSearched && (
          <Hero onSearch={runSearch} recentSearches={recentSearches} />
        )}

        {selectedProduct ? (
          <div className="px-4 py-10 md:py-16">
            <ProductDetail
              product={selectedProduct}
              onBack={() => setSelectedProduct(null)}
              subscribed={billing.subscribed}
              configured={billing.configured}
            />
          </div>
        ) : (
          hasSearched && (
            <section id="search" className="mx-auto max-w-[1200px] px-4 py-14 md:py-20">
              <Reveal>
                <SearchBar onSearch={runSearch} initialQuery={query} />
              </Reveal>

              {loading && (
                <div className="flex items-center justify-center gap-3 py-24 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-taupe">
                  {t("loading")}
                  <span className="flex items-center gap-1">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </span>
                </div>
              )}

              {!loading && error && (
                <div className="mx-auto max-w-md rounded-[2rem] bg-espresso p-10 text-center text-cream shadow-float ring-1 ring-white/10">
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-cream/70">
                    {error}
                  </p>
                </div>
              )}

              {!loading && !error && results.length === 0 && (
                <div className="py-20 text-center md:py-28">
                  <Reveal>
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-taupe">
                      0 {t("results")}
                    </p>
                    <h2 className="mt-4 font-display text-4xl tracking-[-0.02em] text-espresso md:text-5xl">
                      {t("noResults")}
                    </h2>
                    <p className="mt-4 text-cocoa/80">{t("noResultsHint")}</p>
                  </Reveal>
                </div>
              )}

              {!loading && !error && results.length > 0 && (
                <>
                  <Reveal delay={100}>
                    <p className="mt-12 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-taupe">
                      {results.length} {t("results")}
                    </p>
                  </Reveal>
                  <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {results.map((product, i) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onSelect={handleSelectProduct}
                        index={i}
                      />
                    ))}
                  </div>
                </>
              )}
            </section>
          )
        )}
      </main>

      <Marquee />
      <Features />
      <Testimonials />
    </div>
  );
}
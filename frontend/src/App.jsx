import { useEffect, useState, useCallback } from "react";
import { useLanguage } from "./context/LanguageContext.jsx";
import { searchProducts, getProduct, getBillingStatus } from "./api.js";
import LanguageSelector from "./components/LanguageSelector.jsx";
import SearchBar from "./components/SearchBar.jsx";
import ProductCard from "./components/ProductCard.jsx";
import ProductDetail from "./components/ProductDetail.jsx";
import SubscriptionControl from "./components/Subscriptioncontrol.jsx";

export default function App() {
  const { lang, t } = useLanguage();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [billing, setBilling] = useState({ configured: false, subscribed: false });
  const [checkoutNotice, setCheckoutNotice] = useState(null);

  const refreshBillingStatus = useCallback(async () => {
    try {
      const status = await getBillingStatus();
      setBilling(status);
    } catch (err) {
      console.error("Could not fetch billing status:", err);
    }
  }, []);

  // On load: check for a Stripe Checkout redirect flag, and load current
  // subscription status. Access control is always re-verified against the
  // backend/Stripe rather than trusted from the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (checkout === "success") setCheckoutNotice("success");
    if (checkout === "cancelled") setCheckoutNotice("cancelled");
    if (checkout) {
      window.history.replaceState({}, "", window.location.pathname);
    }
    refreshBillingStatus();
  }, [refreshBillingStatus]);

  const runSearch = useCallback(
    async (searchTerm) => {
      setQuery(searchTerm);
      setSelectedProduct(null);
      setLoading(true);
      setError(null);
      setHasSearched(true);
      try {
        const data = await searchProducts(searchTerm, lang);
        setResults(data.products);
      } catch (err) {
        console.error(err);
        setError(t("error"));
      } finally {
        setLoading(false);
      }
    },
    [lang, t]
  );

  // Re-run the last search whenever the language changes, so localized
  // product names/ingredients refresh too.
  useEffect(() => {
    if (query) runSearch(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  async function handleSelectProduct(id) {
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
    <div className="app">
      <header className="app__header">
        <div>
          <h1>{t("appName")}</h1>
          <p className="tagline">{t("tagline")}</p>
        </div>
        <div className="app__header-controls">
          <SubscriptionControl subscribed={billing.subscribed} configured={billing.configured} />
          <LanguageSelector />
        </div>
      </header>

      {checkoutNotice && (
        <div className={`notice notice--${checkoutNotice}`}>
          {checkoutNotice === "success" ? t("checkoutSuccess") : t("checkoutCancelled")}
        </div>
      )}

      <main className="app__main">
        {!selectedProduct && <SearchBar onSearch={runSearch} initialQuery={query} />}

        {loading && <p className="status-text">{t("loading")}</p>}
        {error && <p className="status-text status-text--error">{error}</p>}

        {!loading && !error && selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onBack={() => setSelectedProduct(null)}
            subscribed={billing.subscribed}
          />
        )}

        {!loading && !error && !selectedProduct && (
          <>
            {!hasSearched && <p className="status-text">{t("startPrompt")}</p>}
            {hasSearched && results.length === 0 && <p className="status-text">{t("noResults")}</p>}
            <div className="product-grid">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} onSelect={handleSelectProduct} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function handle(response) {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export function searchProducts(query, lang, page = 1) {
  const url = new URL(`${API_URL}/products/search`);
  url.searchParams.set("q", query);
  url.searchParams.set("lang", lang);
  url.searchParams.set("page", page);
  return fetch(url).then(handle);
}

export function getProduct(code, lang) {
  const url = new URL(`${API_URL}/products/${encodeURIComponent(code)}`);
  url.searchParams.set("lang", lang);
  return fetch(url).then(handle);
}

export function getBillingStatus() {
  return fetch(`${API_URL}/billing/status`).then(handle);
}

export function startCheckout() {
  return fetch(`${API_URL}/billing/checkout`, { method: "POST" }).then(handle);
}

export function openBillingPortal() {
  return fetch(`${API_URL}/billing/portal`, { method: "POST" }).then(handle);
}

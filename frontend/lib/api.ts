import { SearchResult, BillingStatus, Product } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function handle(response: Response) {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export function searchProducts(
  query: string,
  lang: string,
  page: number = 1
): Promise<SearchResult> {
  const url = new URL(`${API_URL}/products/search`);
  url.searchParams.set("q", query);
  url.searchParams.set("lang", lang);
  url.searchParams.set("page", String(page));
  return fetch(url).then(handle);
}

export function getProduct(code: string, lang: string): Promise<{ product: Product }> {
  const url = new URL(`${API_URL}/products/${encodeURIComponent(code)}`);
  url.searchParams.set("lang", lang);
  return fetch(url).then(handle);
}

export function getBillingStatus(): Promise<BillingStatus> {
  return fetch(`${API_URL}/billing/status`).then(handle);
}

export function startCheckout(): Promise<{ url: string }> {
  return fetch(`${API_URL}/billing/checkout`, { method: "POST" }).then(handle);
}

export function openBillingPortal(): Promise<{ url: string }> {
  return fetch(`${API_URL}/billing/portal`, { method: "POST" }).then(handle);
}

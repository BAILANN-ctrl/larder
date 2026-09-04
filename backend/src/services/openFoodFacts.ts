import fetch from "node-fetch";
import { Product, SearchResult } from "../types/index.js";

const BASE_URL = "https://world.openfoodfacts.org";

async function fetchWithRetry(
  url: string | URL,
  options: Parameters<typeof fetch>[1] = {},
  retries: number = 2,
  delayMs: number = 1000
): Promise<ReturnType<typeof fetch>> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
    }
  }
  throw new Error("fetchWithRetry: unexpected error");
}

const LANG_MAP: Record<string, string> = {
  en: "en",
  nl: "nl",
  de: "de",
  fr: "fr",
};

function resolveLang(lang: string): string {
  return LANG_MAP[lang] || "en";
}

function localized(
  product: Record<string, any>,
  field: string,
  lang: string
): string {
  return (
    product[`${field}_${lang}`] ||
    product[`${field}_en`] ||
    product[field] ||
    ""
  );
}

function mapProduct(product: Record<string, any>, lang: string): Product {
  return {
    id: product.code,
    name: localized(product, "product_name", lang) || "Unknown product",
    brand: product.brands || "",
    imageUrl: product.image_front_url || product.image_url || null,
    quantity: product.quantity || "",
    nutriments: product.nutriments
      ? {
          energyKcal100g: product.nutriments["energy-kcal_100g"] ?? null,
          fat100g: product.nutriments["fat_100g"] ?? null,
          saturatedFat100g: product.nutriments["saturated-fat_100g"] ?? null,
          carbohydrates100g: product.nutriments["carbohydrates_100g"] ?? null,
          sugars100g: product.nutriments["sugars_100g"] ?? null,
          fiber100g: product.nutriments["fiber_100g"] ?? null,
          proteins100g: product.nutriments["proteins_100g"] ?? null,
          salt100g: product.nutriments["salt_100g"] ?? null,
        }
      : null,
    nutriscoreGrade: product.nutriscore_grade || null,
    ingredientsText: localized(product, "ingredients_text", lang),
  };
}

export async function searchProducts(
  query: string,
  lang: string,
  page: number = 1,
  pageSize: number = 20
): Promise<SearchResult> {
  const offLang = resolveLang(lang);
  const url = new URL(`${BASE_URL}/cgi/search.pl`);
  url.searchParams.set("search_terms", query);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page", String(page));
  url.searchParams.set("page_size", String(pageSize));
  url.searchParams.set("lc", offLang);
  url.searchParams.set(
    "fields",
    [
      "code",
      "product_name",
      "product_name_en",
      "product_name_nl",
      "product_name_de",
      "product_name_fr",
      "brands",
      "image_front_url",
      "image_url",
      "quantity",
      "nutriments",
      "nutriscore_grade",
      "ingredients_text",
      "ingredients_text_en",
      "ingredients_text_nl",
      "ingredients_text_de",
      "ingredients_text_fr",
    ].join(",")
  );

  const response = await fetchWithRetry(url, {
    headers: {
      "User-Agent": "FoodFinderDemo/1.0 (learning project)",
    },
  });

  if (!response.ok) {
    throw new Error(`Open Food Facts search failed: ${response.status}`);
  }

  const data = (await response.json()) as Record<string, any>;
  const products = (data.products || []).map((p: Record<string, any>) =>
    mapProduct(p, offLang)
  );

  return {
    products,
    page: data.page || page,
    pageCount: Math.ceil((data.count || 0) / pageSize),
    total: data.count || 0,
  };
}

export async function getProductByBarcode(
  code: string,
  lang: string
): Promise<Product | null> {
  const offLang = resolveLang(lang);
  const url = `${BASE_URL}/api/v2/product/${encodeURIComponent(
    code
  )}.json?lc=${offLang}`;

  const response = await fetchWithRetry(url, {
    headers: { "User-Agent": "FoodFinderDemo/1.0 (learning project)" },
  });

  if (!response.ok) {
    throw new Error(`Open Food Facts lookup failed: ${response.status}`);
  }

  const data = (await response.json()) as Record<string, any>;
  if (data.status !== 1 || !data.product) {
    return null;
  }

  return mapProduct(data.product, offLang);
}

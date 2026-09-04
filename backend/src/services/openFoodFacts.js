import fetch from "node-fetch";

// Open Food Facts supports per-country/language subdomains (world.openfoodfacts.org
// works for all locales and returns localized "product_name_<lang>" fields when
// available). We use the global "world" endpoint plus explicit lang params rather
// than switching subdomains, since that keeps a single stable integration point.
const BASE_URL = "https://world.openfoodfacts.org";

// Supported app languages -> Open Food Facts language codes (they match here,
// but kept as a map in case OFF ever diverges from our locale codes).
const LANG_MAP = {
  en: "en",
  nl: "nl",
  de: "de",
  fr: "fr",
};

function resolveLang(lang) {
  return LANG_MAP[lang] || "en";
}

/**
 * Pick the best available localized value from an OFF product object.
 * OFF stores localized fields as `${field}_${lang}`, with a generic
 * `${field}` fallback (usually in the product's original language) and
 * sometimes `${field}_en` as a secondary fallback.
 */
function localized(product, field, lang) {
  return (
    product[`${field}_${lang}`] ||
    product[`${field}_en`] ||
    product[field] ||
    ""
  );
}

/**
 * Shape a raw OFF product into the minimal, UI-friendly structure our
 * frontend consumes. Keeping this mapping in one place means the rest of
 * the app never has to know about OFF's raw field names.
 */
function mapProduct(product, lang) {
  return {
    id: product.code,
    name: localized(product, "product_name", lang) || "Unknown product",
    brand: product.brands || "",
    imageUrl: product.image_front_url || product.image_url || null,
    quantity: product.quantity || "",
    // Nutritional data is included here but the ROUTE layer decides whether
    // to strip it out for unauthenticated / non-subscribed users. Keeping
    // the gating in the route (not here) means this mapper stays a pure
    // data-shaping function and the access-control logic lives in one place.
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

export async function searchProducts(query, lang, page = 1, pageSize = 20) {
  const offLang = resolveLang(lang);
  const url = new URL(`${BASE_URL}/cgi/search.pl`);
  url.searchParams.set("search_terms", query);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page", String(page));
  url.searchParams.set("page_size", String(pageSize));
  url.searchParams.set("lc", offLang);
  // Limit fields returned to keep payloads small.
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

  const response = await fetch(url, {
    headers: {
      // OFF asks integrators to identify their app in the User-Agent.
      "User-Agent": "FoodFinderDemo/1.0 (learning project)",
    },
  });

  if (!response.ok) {
    throw new Error(`Open Food Facts search failed: ${response.status}`);
  }

  const data = await response.json();
  const products = (data.products || []).map((p) => mapProduct(p, offLang));

  return {
    products,
    page: data.page || page,
    pageCount: Math.ceil((data.count || 0) / pageSize),
    total: data.count || 0,
  };
}

export async function getProductByBarcode(code, lang) {
  const offLang = resolveLang(lang);
  const url = `${BASE_URL}/api/v2/product/${encodeURIComponent(
    code
  )}.json?lc=${offLang}`;

  const response = await fetch(url, {
    headers: { "User-Agent": "FoodFinderDemo/1.0 (learning project)" },
  });

  if (!response.ok) {
    throw new Error(`Open Food Facts lookup failed: ${response.status}`);
  }

  const data = await response.json();
  if (data.status !== 1 || !data.product) {
    return null;
  }

  return mapProduct(data.product, offLang);
}

import { describe, it, expect } from "vitest";
import { mapProduct, localized, resolveLang, sanitizeQuery, isCompleteProduct } from "../src/services/openFoodFacts.js";

describe("resolveLang (OFF language map)", () => {
  it("maps all supported languages and falls back to English", () => {
    expect(resolveLang("de")).toBe("de");
    expect(resolveLang("fr")).toBe("fr");
    expect(resolveLang("nl")).toBe("nl");
    expect(resolveLang("xx")).toBe("en");
  });
});

describe("localized", () => {
  it("picks the requested language field when present", () => {
    const product = {
      product_name_en: "Peanut Butter",
      product_name_de: "Erdnussbutter",
    };
    expect(localized(product, "product_name", "de")).toBe("Erdnussbutter");
  });

  it("falls back to English, then to the default field, then to empty string", () => {
    const product = {
      product_name_en: "Oats",
      product_name: "Whatever",
    };
    expect(localized(product, "product_name", "fr")).toBe("Oats");

    const bare = { product_name: "Only default" };
    expect(localized(bare, "product_name", "de")).toBe("Only default");

    expect(localized({}, "product_name", "nl")).toBe("");
  });
});

describe("mapProduct (missing / incomplete data handling)", () => {
  it("maps a complete product from Open Food Facts", () => {
    const product = mapProduct(
      {
        code: "1234",
        product_name_en: "Cola",
        product_name_fr: "Cola FR",
        brands: "Coca-Cola",
        image_front_url: "http://img/front.jpg",
        quantity: "33 cl",
        nutriments: { "energy-kcal_100g": 42, "fat_100g": 0.1, "sugars_100g": 10.6 },
        nutriscore_grade: "d",
        ingredients_text_fr: "Eau, sucre",
      },
      "fr"
    );

    expect(product).toEqual({
      id: "1234",
      name: "Cola FR",
      brand: "Coca-Cola",
      imageUrl: "http://img/front.jpg",
      quantity: "33 cl",
      nutriments: {
        energyKcal100g: 42,
        fat100g: 0.1,
        saturatedFat100g: null,
        carbohydrates100g: null,
        sugars100g: 10.6,
        fiber100g: null,
        proteins100g: null,
        salt100g: null,
      },
      nutriscoreGrade: "d",
      ingredientsText: "Eau, sucre",
    });
  });

  it("safely handles products with missing or partial fields", () => {
    const product = mapProduct({ code: "999" }, "en");

    expect(product.name).toBe("Unknown product");
    expect(product.brand).toBe("");
    expect(product.imageUrl).toBeNull();
    expect(product.quantity).toBe("");
    expect(product.nutriments).toBeNull();
    expect(product.nutriscoreGrade).toBeNull();
    expect(product.ingredientsText).toBe("");
  });

  it("falls back from image_front_url to image_url when only the latter exists", () => {
    const product = mapProduct(
      { code: "5", image_url: "http://img/backup.jpg" },
      "en"
    );
    expect(product.imageUrl).toBe("http://img/backup.jpg");
  });
});

describe("sanitizeQuery", () => {
  it("trims whitespace and collapses multiple spaces", () => {
    expect(sanitizeQuery("  brown rice   ")).toBe("brown rice");
    expect(sanitizeQuery("a   b    c")).toBe("a b c");
  });

  it("returns empty string for empty or whitespace-only input", () => {
    expect(sanitizeQuery("")).toBe("");
    expect(sanitizeQuery("   ")).toBe("");
  });

  it("strips angle brackets", () => {
    expect(sanitizeQuery('<script>alert("x")</script>')).toBe(
      'scriptalert("x")/script'
    );
  });
});

describe("isCompleteProduct", () => {
  it("accepts products with an id and a real name", () => {
    expect(isCompleteProduct({ id: "1", name: "Brown rice", brand: "", imageUrl: null, quantity: "", nutriments: null, nutriscoreGrade: null, ingredientsText: "" })).toBe(true);
  });

  it("rejects products with no id", () => {
    expect(isCompleteProduct({ id: "", name: "Brown rice", brand: "", imageUrl: null, quantity: "", nutriments: null, nutriscoreGrade: null, ingredientsText: "" })).toBe(false);
  });

  it("rejects products with an 'Unknown product' placeholder name", () => {
    expect(isCompleteProduct({ id: "1", name: "Unknown product", brand: "", imageUrl: null, quantity: "", nutriments: null, nutriscoreGrade: null, ingredientsText: "" })).toBe(false);
  });
});
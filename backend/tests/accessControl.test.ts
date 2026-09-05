import { describe, it, expect } from "vitest";
import { applyAccessControl, resolveLang } from "../src/routes/products.js";
import { Product } from "../src/types/index.js";

function sampleProduct(): Product {
  return {
    id: "3017620422003",
    name: "Nutella",
    brand: "Ferrero",
    imageUrl: "http://img.example.com/nutella.jpg",
    quantity: "350 g",
    nutriments: {
      energyKcal100g: 539,
      fat100g: 30.9,
      saturatedFat100g: null,
      carbohydrates100g: 57.5,
      sugars100g: 56.3,
      fiber100g: null,
      proteins100g: 6.3,
      salt100g: null,
    },
    nutriscoreGrade: "e",
    ingredientsText: "Sugar, palm oil, hazelnuts…",
  };
}

describe("applyAccessControl", () => {
  it("leaves nutrition data intact for a subscribed user", () => {
    const product = applyAccessControl(sampleProduct(), true);
    expect(product.nutriments?.energyKcal100g).toBe(539);
    expect(product.nutriscoreGrade).toBe("e");
    expect(product.locked).toBeUndefined();
  });

  it("strips nutrition and nutriscore for a non-subscribed user", () => {
    const product = applyAccessControl(sampleProduct(), false);
    expect(product.nutriments).toBeNull();
    expect(product.nutriscoreGrade).toBeNull();
    expect(product.locked).toBe(true);
    expect(product.name).toBe("Nutella");
    expect(product.brand).toBe("Ferrero");
  });

  it("never mutates the input product object", () => {
    const input = sampleProduct();
    applyAccessControl(input, false);
    expect(input.nutriments?.fat100g).toBe(30.9);
    expect(input.locked).toBeUndefined();
  });
});

describe("resolveLang", () => {
  it("defaults to English when no lang is provided", () => {
    expect(resolveLang({})).toBe("en");
  });

  it("accepts all four supported languages", () => {
    expect(resolveLang({ lang: "nl" })).toBe("nl");
    expect(resolveLang({ lang: "de" })).toBe("de");
    expect(resolveLang({ lang: "fr" })).toBe("fr");
  });

  it("falls back to English for unsupported languages", () => {
    expect(resolveLang({ lang: "es" })).toBe("en");
    expect(resolveLang({ lang: "EN " })).toBe("en");
  });
});
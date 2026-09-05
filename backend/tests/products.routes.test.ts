import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";

vi.mock("../src/services/openFoodFacts.js", () => ({
  searchProducts: vi.fn(),
  getProductByBarcode: vi.fn(),
  sanitizeQuery: vi.fn((raw: string) => raw.trim()),
}));
vi.mock("../src/services/stripeService.js", () => ({
  hasActiveSubscription: vi.fn(),
}));
vi.mock("../src/services/userService.js", () => ({
  getOrCreateDemoUser: vi.fn(),
}));
vi.mock("../src/services/searchService.js", () => ({
  recordSearch: vi.fn(),
}));

import app from "../src/app.js";
import {
  searchProducts,
  getProductByBarcode,
} from "../src/services/openFoodFacts.js";
import { hasActiveSubscription } from "../src/services/stripeService.js";
import { getOrCreateDemoUser } from "../src/services/userService.js";
import { recordSearch } from "../src/services/searchService.js";
import { Product } from "../src/types/index.js";

const demoUser = {
  id: "demo-user-1",
  email: "demo@larder.local",
  name: "Demo User",
  stripeCustomerId: null,
  subscriptionStatus: "inactive",
  subscriptionId: null,
};

function productWithNutrition(): Product {
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
    ingredientsText: "Sugar, palm oil…",
  };
}

beforeEach(() => {
  vi.mocked(getOrCreateDemoUser).mockResolvedValue({ ...demoUser });
  vi.mocked(hasActiveSubscription).mockResolvedValue(false);
  vi.mocked(recordSearch).mockResolvedValue(undefined);
});

describe("GET /api/products/search", () => {
  it("returns 400 when the query parameter is missing", async () => {
    const res = await request(app).get("/api/products/search");
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("q");
  });

  it("returns products and records the search term in the database", async () => {
    const product = productWithNutrition();
    vi.mocked(searchProducts).mockResolvedValue({
      products: [product],
      page: 1,
      pageCount: 1,
      total: 1,
    });

    const res = await request(app).get(
      "/api/products/search?q=nutella&lang=nl"
    );

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.unlocked).toBe(false);
    expect(res.body.products[0].name).toBe("Nutella");
    expect(recordSearch).toHaveBeenCalledWith("demo-user-1", "nutella");
    expect(searchProducts).toHaveBeenCalledWith("nutella", "nl", 1);
  });

  it("strips nutrition data for a non-subscribed demo user", async () => {
    vi.mocked(searchProducts).mockResolvedValue({
      products: [productWithNutrition()],
      page: 1,
      pageCount: 1,
      total: 1,
    });

    const res = await request(app).get("/api/products/search?q=nutella");

    expect(res.status).toBe(200);
    const [p] = res.body.products as Product[];
    expect(p.nutriments).toBeNull();
    expect(p.nutriscoreGrade).toBeNull();
    expect(p.locked).toBe(true);
    expect(p.name).toBe("Nutella");
  });

  it("keeps nutrition data when the user has an active subscription", async () => {
    vi.mocked(getOrCreateDemoUser).mockResolvedValue({
      ...demoUser,
      stripeCustomerId: "cus_123",
    });
    vi.mocked(hasActiveSubscription).mockResolvedValue(true);
    vi.mocked(searchProducts).mockResolvedValue({
      products: [productWithNutrition()],
      page: 1,
      pageCount: 1,
      total: 1,
    });

    const res = await request(app).get("/api/products/search?q=nutella");

    expect(res.status).toBe(200);
    expect(res.body.unlocked).toBe(true);
    expect(res.body.products[0].nutriments.energyKcal100g).toBe(539);
    expect(res.body.products[0].locked).toBeUndefined();
  });

  it("returns 502 when Open Food Facts is unreachable", async () => {
    vi.mocked(searchProducts).mockRejectedValue(new Error("OFF down"));
    const res = await request(app).get("/api/products/search?q=nutella");
    expect(res.status).toBe(502);
  });
});

describe("GET /api/products/:code", () => {
  it("returns 404 when the barcode is not found", async () => {
    vi.mocked(getProductByBarcode).mockResolvedValue(null);
    const res = await request(app).get("/api/products/0000000000000");
    expect(res.status).toBe(404);
  });

  it("returns the product, gated for a non-subscribed user", async () => {
    vi.mocked(getProductByBarcode).mockResolvedValue(productWithNutrition());
    const res = await request(app).get("/api/products/3017620422003");

    expect(res.status).toBe(200);
    expect(res.body.product.nutriments).toBeNull();
    expect(res.body.product.locked).toBe(true);
  });
});
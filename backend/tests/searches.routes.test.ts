import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";

vi.mock("../src/services/searchService.js", () => ({
  recentSearches: vi.fn(),
}));
vi.mock("../src/services/userService.js", () => ({
  getOrCreateDemoUser: vi.fn(),
  updateDemoUserStripeCustomerId: vi.fn(),
  updateDemoUserSubscription: vi.fn(),
}));

import app from "../src/app.js";
import { recentSearches } from "../src/services/searchService.js";
import { getOrCreateDemoUser } from "../src/services/userService.js";

const demoUser = {
  id: "demo-user-1",
  email: "demo@larder.local",
  name: "Demo User",
  stripeCustomerId: null,
  subscriptionStatus: "inactive",
  subscriptionId: null,
};

beforeEach(() => {
  vi.mocked(getOrCreateDemoUser).mockResolvedValue({ ...demoUser });
  vi.mocked(recentSearches).mockResolvedValue(["nutella", "coca-cola"]);
});

describe("GET /api/searches", () => {
  it("returns the demo user's most recent distinct search terms", async () => {
    const res = await request(app).get("/api/searches");

    expect(res.status).toBe(200);
    expect(res.body.terms).toEqual(["nutella", "coca-cola"]);
    expect(recentSearches).toHaveBeenCalledWith("demo-user-1", 10);
  });

  it("respects the requested limit and clamps it to the allowed range", async () => {
    await request(app).get("/api/searches?limit=3");
    expect(recentSearches).toHaveBeenCalledWith("demo-user-1", 3);

    await request(app).get("/api/searches?limit=999");
    expect(recentSearches).toHaveBeenCalledWith("demo-user-1", 20);
  });
});
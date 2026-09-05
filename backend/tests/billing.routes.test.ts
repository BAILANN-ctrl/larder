import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";

vi.mock("../src/services/stripeService.js", () => ({
  isStripeConfigured: vi.fn(),
  getStripeClient: vi.fn(),
  createCheckoutSession: vi.fn(),
  createBillingPortalSession: vi.fn(),
  hasActiveSubscription: vi.fn(),
}));
vi.mock("../src/services/userService.js", () => ({
  getOrCreateDemoUser: vi.fn(),
  updateDemoUserStripeCustomerId: vi.fn(),
  updateDemoUserSubscription: vi.fn(),
}));

import app from "../src/app.js";
import {
  isStripeConfigured,
  createCheckoutSession,
  createBillingPortalSession,
  hasActiveSubscription,
} from "../src/services/stripeService.js";
import {
  getOrCreateDemoUser,
  updateDemoUserStripeCustomerId,
} from "../src/services/userService.js";

const demoUser = {
  id: "demo-user-1",
  email: "demo@foodfinder.local",
  name: "Demo User",
  stripeCustomerId: null,
  subscriptionStatus: "inactive",
  subscriptionId: null,
};

beforeEach(() => {
  vi.mocked(getOrCreateDemoUser).mockResolvedValue({ ...demoUser });
  vi.mocked(isStripeConfigured).mockReturnValue(false);
  vi.mocked(updateDemoUserStripeCustomerId).mockResolvedValue(undefined);
});

describe("GET /api/billing/status", () => {
  it("reports not configured when Stripe keys are absent", async () => {
    const res = await request(app).get("/api/billing/status");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ configured: false, subscribed: false });
  });

  it("reports subscription state for a configured Stripe account", async () => {
    vi.mocked(isStripeConfigured).mockReturnValue(true);
    vi.mocked(getOrCreateDemoUser).mockResolvedValue({
      ...demoUser,
      stripeCustomerId: "cus_123",
    });
    vi.mocked(hasActiveSubscription).mockResolvedValue(true);

    const res = await request(app).get("/api/billing/status");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      configured: true,
      subscribed: true,
      customerId: "cus_123",
    });
  });

  it("returns false when there is no active subscription", async () => {
    vi.mocked(isStripeConfigured).mockReturnValue(true);
    vi.mocked(getOrCreateDemoUser).mockResolvedValue({
      ...demoUser,
      stripeCustomerId: null,
    });
    vi.mocked(hasActiveSubscription).mockResolvedValue(false);

    const res = await request(app).get("/api/billing/status");
    expect(res.body.subscribed).toBe(false);
    expect(hasActiveSubscription).toHaveBeenCalledWith(null);
  });
});

describe("POST /api/billing/checkout", () => {
  it("returns 503 when Stripe is not configured", async () => {
    const res = await request(app).post("/api/billing/checkout");
    expect(res.status).toBe(503);
    expect(createCheckoutSession).not.toHaveBeenCalled();
  });

  it("creates a checkout session and persists the Stripe customer id", async () => {
    vi.mocked(isStripeConfigured).mockReturnValue(true);
    vi.mocked(createCheckoutSession).mockResolvedValue({
      url: "https://checkout.stripe.com/c/pay_cs_123",
      customer: "cus_abc",
    } as any);

    const res = await request(app).post("/api/billing/checkout");

    expect(res.status).toBe(200);
    expect(res.body.url).toBe("https://checkout.stripe.com/c/pay_cs_123");
    expect(updateDemoUserStripeCustomerId).toHaveBeenCalledWith("cus_abc");
  });
});

describe("POST /api/billing/portal", () => {
  it("returns 400 when the demo user has no Stripe customer id", async () => {
    const res = await request(app).post("/api/billing/portal");
    expect(res.status).toBe(400);
    expect(createBillingPortalSession).not.toHaveBeenCalled();
  });

  it("opens the billing portal for an existing customer", async () => {
    vi.mocked(getOrCreateDemoUser).mockResolvedValue({
      ...demoUser,
      stripeCustomerId: "cus_123",
    });
    vi.mocked(createBillingPortalSession).mockResolvedValue({
      url: "https://billing.stripe.com/p/session",
    } as any);

    const res = await request(app).post("/api/billing/portal");
    expect(res.status).toBe(200);
    expect(res.body.url).toBe("https://billing.stripe.com/p/session");
    expect(createBillingPortalSession).toHaveBeenCalledWith("cus_123");
  });
});
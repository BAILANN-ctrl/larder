import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";

vi.mock("../src/services/stripeService.js", () => ({
  isStripeConfigured: vi.fn(),
  getStripeClient: vi.fn(),
  hasActiveSubscription: vi.fn(),
}));
vi.mock("../src/services/userService.js", () => ({
  getOrCreateDemoUser: vi.fn(),
  updateDemoUserStripeCustomerId: vi.fn(),
  updateDemoUserSubscription: vi.fn(),
}));

import app from "../src/app.js";
import { isStripeConfigured, getStripeClient } from "../src/services/stripeService.js";
import {
  updateDemoUserStripeCustomerId,
  updateDemoUserSubscription,
} from "../src/services/userService.js";

type StripeEvent = {
  type: string;
  data: { object: Record<string, any> };
};

const constructEvent = vi.fn((body: Buffer, sig: string, secret: string): StripeEvent => ({
  type: "checkout.session.completed",
  data: { object: {} },
}));

beforeEach(() => {
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  vi.mocked(isStripeConfigured).mockReturnValue(true);
  vi.mocked(getStripeClient).mockReturnValue({
    webhooks: { constructEvent },
  } as any);
  vi.mocked(updateDemoUserStripeCustomerId).mockResolvedValue(undefined);
  vi.mocked(updateDemoUserSubscription).mockResolvedValue(undefined);
});

function postWebhook(event: StripeEvent) {
  constructEvent.mockReturnValue(event);
  return request(app)
    .post("/api/webhook")
    .set("stripe-signature", "t=1,v1=signature")
    .send(JSON.stringify({ type: event.type, data: event.data }));
}

describe("POST /api/webhook", () => {
  it("returns 503 when Stripe is not configured", async () => {
    vi.mocked(isStripeConfigured).mockReturnValue(false);
    const res = await request(app).post("/api/webhook").send("{}");
    expect(res.status).toBe(503);
  });

  it("links the demo user to the Stripe customer on checkout.session.completed", async () => {
    const res = await postWebhook({
      type: "checkout.session.completed",
      data: { object: { id: "cs_1", customer: "cus_123" } },
    });

    expect(res.status).toBe(200);
    expect(updateDemoUserStripeCustomerId).toHaveBeenCalledWith("cus_123");
  });

  it("stores subscription status on customer.subscription.updated", async () => {
    const res = await postWebhook({
      type: "customer.subscription.updated",
      data: { object: { id: "sub_1", status: "active" } },
    });

    expect(res.status).toBe(200);
    expect(updateDemoUserSubscription).toHaveBeenCalledWith("sub_1", "active");
  });

  it("marks the subscription as canceled on customer.subscription.deleted", async () => {
    const res = await postWebhook({
      type: "customer.subscription.deleted",
      data: { object: { id: "sub_2", status: "canceled" } },
    });

    expect(res.status).toBe(200);
    expect(updateDemoUserSubscription).toHaveBeenCalledWith("sub_2", "canceled");
  });

  it("rejects requests with an invalid Stripe signature", async () => {
    constructEvent.mockImplementation(() => {
      throw new Error("No signatures found");
    });

    const res = await request(app)
      .post("/api/webhook")
      .set("stripe-signature", "t=1,v1=bogus")
      .send(JSON.stringify({ type: "checkout.session.completed", data: {} }));

    expect(res.status).toBe(400);
    expect(res.text).toContain("No signatures found");
  });
});
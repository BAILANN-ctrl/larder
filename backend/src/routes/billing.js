import { Router } from "express";
import {
  createCheckoutSession,
  createBillingPortalSession,
  hasActiveSubscription,
  isStripeConfigured,
} from "../services/stripeService.js";
import { getDemoUser, setDemoUserStripeCustomerId } from "../services/demoUserStore.js";

const router = Router();

// Current subscription status for the demo user. The frontend polls this
// after returning from Stripe Checkout to know whether to unlock nutrition.
router.get("/status", async (req, res) => {
  if (!isStripeConfigured()) {
    return res.json({ configured: false, subscribed: false });
  }
  const user = getDemoUser();
  const subscribed = await hasActiveSubscription(user.stripeCustomerId);
  res.json({ configured: true, subscribed, customerId: user.stripeCustomerId });
});

// Starts a Stripe Checkout session for the demo user's subscription.
router.post("/checkout", async (req, res) => {
  if (!isStripeConfigured()) {
    return res.status(503).json({ error: "Stripe is not configured on this server." });
  }
  try {
    const user = getDemoUser();
    const session = await createCheckoutSession(user.stripeCustomerId, user.email);
    // We only learn the real customer id once Checkout completes (webhook),
    // but Checkout also returns session.customer immediately for redirect-mode
    // flows; store it optimistically so /status can check it right away.
    if (session.customer) {
      setDemoUserStripeCustomerId(session.customer);
    }
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not start checkout session." });
  }
});

// Lets the demo user manage/cancel their subscription via Stripe's
// hosted billing portal.
router.post("/portal", async (req, res) => {
  const user = getDemoUser();
  if (!user.stripeCustomerId) {
    return res.status(400).json({ error: "No active Stripe customer for demo user." });
  }
  try {
    const session = await createBillingPortalSession(user.stripeCustomerId);
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not open billing portal." });
  }
});

export default router;

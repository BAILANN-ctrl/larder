import { Router, Request, Response } from "express";
import {
  createCheckoutSession,
  createBillingPortalSession,
  hasActiveSubscription,
  isStripeConfigured,
} from "../services/stripeService.js";
import {
  getOrCreateDemoUser,
  updateDemoUserStripeCustomerId,
} from "../services/userService.js";

const router = Router();

router.get("/status", async (req: Request, res: Response) => {
  if (!isStripeConfigured()) {
    return res.json({ configured: false, subscribed: false });
  }
  const user = await getOrCreateDemoUser();
  const subscribed = await hasActiveSubscription(user.stripeCustomerId);
  res.json({ configured: true, subscribed, customerId: user.stripeCustomerId });
});

router.post("/checkout", async (req: Request, res: Response) => {
  if (!isStripeConfigured()) {
    return res.status(503).json({ error: "Stripe is not configured on this server." });
  }
  try {
    const user = await getOrCreateDemoUser();
    const session = await createCheckoutSession(user.stripeCustomerId, user.email);
    if (session.customer) {
      await updateDemoUserStripeCustomerId(session.customer as string);
    }
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not start checkout session." });
  }
});

router.post("/portal", async (req: Request, res: Response) => {
  const user = await getOrCreateDemoUser();
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

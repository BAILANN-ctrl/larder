import { Router, Request, Response } from "express";
import { getStripeClient, isStripeConfigured } from "../services/stripeService.js";
import {
  getOrCreateDemoUser,
  updateDemoUserStripeCustomerId,
  updateDemoUserSubscription,
} from "../services/userService.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  if (!isStripeConfigured()) {
    return res.status(503).send("Stripe not configured");
  }

  const stripe = getStripeClient();
  const signature = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = webhookSecret
      ? stripe.webhooks.constructEvent(
          req.body,
          signature as string,
          webhookSecret
        )
      : JSON.parse(req.body.toString());
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.customer) {
        await updateDemoUserStripeCustomerId(session.customer);
        console.log(`Demo user linked to Stripe customer ${session.customer}`);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object;
      await updateDemoUserSubscription(
        subscription.id,
        subscription.status
      );
      console.log(
        `Subscription ${event.type}: ${subscription.id} status=${subscription.status}`
      );
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      await updateDemoUserSubscription(subscription.id, "canceled");
      console.log(`Subscription deleted: ${subscription.id}`);
      break;
    }
    default:
      break;
  }

  res.json({ received: true });
});

export default router;

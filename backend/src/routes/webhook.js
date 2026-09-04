import { Router } from "express";
import { getStripeClient, isStripeConfigured } from "../services/stripeService.js";
import { getDemoUser, setDemoUserStripeCustomerId } from "../services/demoUserStore.js";

const router = Router();

/**
 * Stripe webhook endpoint. Must receive the RAW request body (not JSON
 * parsed) so the signature can be verified — this router is mounted with
 * express.raw() in server.js BEFORE the global express.json() middleware
 * touches this specific path.
 *
 * We only handle the events needed to know "does the demo user now have
 * an active subscription", since that's all this demo's access control
 * depends on. A production app would also handle invoice/payment-failure
 * events, store data in a DB, etc.
 */
router.post("/", async (req, res) => {
  if (!isStripeConfigured()) {
    return res.status(503).send("Stripe not configured");
  }

  const stripe = getStripeClient();
  const signature = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = webhookSecret
      ? stripe.webhooks.constructEvent(req.body, signature, webhookSecret)
      : JSON.parse(req.body); // dev fallback when no webhook secret is set
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.customer) {
        setDemoUserStripeCustomerId(session.customer);
        console.log(`Demo user linked to Stripe customer ${session.customer}`);
      }
      break;
    }
    case "customer.subscription.deleted":
    case "customer.subscription.updated": {
      // No DB write needed here: /billing/status re-checks Stripe live.
      // In a real app you'd cache subscription status here instead.
      const user = getDemoUser();
      console.log(
        `Subscription event ${event.type} for customer ${event.data.object.customer} (demo user is ${user.stripeCustomerId})`
      );
      break;
    }
    default:
      break;
  }

  res.json({ received: true });
});

export default router;

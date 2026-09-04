import Stripe from "stripe";

// Guard against missing key so the app still boots (with subscriptions
// disabled) in environments where Stripe hasn't been configured yet.
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export function isStripeConfigured() {
  return Boolean(stripe);
}

export function getStripeClient() {
  if (!stripe) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY in backend/.env"
    );
  }
  return stripe;
}

/**
 * Create (or reuse) a Stripe Customer for the demo user and start a
 * Checkout Session for the subscription price.
 */
export async function createCheckoutSession(customerId, customerEmail) {
  const client = getStripeClient();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const session = await client.checkout.sessions.create({
    mode: "subscription",
    customer: customerId || undefined,
    customer_email: customerId ? undefined : customerEmail,
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${frontendUrl}/?checkout=success`,
    cancel_url: `${frontendUrl}/?checkout=cancelled`,
  });

  return session;
}

export async function createBillingPortalSession(customerId) {
  const client = getStripeClient();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const session = await client.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${frontendUrl}/`,
  });

  return session;
}

/**
 * Checks whether a given Stripe customer has any active (or trialing)
 * subscription. This is the single source of truth for "is premium".
 */
export async function hasActiveSubscription(customerId) {
  if (!customerId) return false;
  const client = getStripeClient();

  const subscriptions = await client.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 10,
  });

  return subscriptions.data.some((sub) =>
    ["active", "trialing"].includes(sub.status)
  );
}

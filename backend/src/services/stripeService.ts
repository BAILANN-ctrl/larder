import Stripe from "stripe";

const stripe: Stripe | null = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export function isStripeConfigured(): boolean {
  return Boolean(stripe);
}

export function getStripeClient(): Stripe {
  if (!stripe) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY in backend/.env"
    );
  }
  return stripe;
}

export async function createCheckoutSession(
  customerId: string | null,
  customerEmail: string
): Promise<Stripe.Checkout.Session> {
  const client = getStripeClient();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  const session = await client.checkout.sessions.create({
    mode: "subscription",
    customer: customerId || undefined,
    customer_email: customerId ? undefined : customerEmail,
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${frontendUrl}/?checkout=success`,
    cancel_url: `${frontendUrl}/?checkout=cancelled`,
  });

  return session;
}

export async function createBillingPortalSession(
  customerId: string
): Promise<Stripe.BillingPortal.Session> {
  const client = getStripeClient();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  const session = await client.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${frontendUrl}/`,
  });

  return session;
}

export async function hasActiveSubscription(
  customerId: string | null
): Promise<boolean> {
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

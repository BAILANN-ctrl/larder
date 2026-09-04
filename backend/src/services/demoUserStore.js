/**
 * SIMPLIFICATION: This is a demo/assignment app, so instead of a full
 * auth system (signup/login/JWT/db) we model a single hardcoded "demo
 * user" whose Stripe customer id is kept in memory on the server.
 *
 * In a real product this would be replaced by:
 *  - a users table with a stripe_customer_id column
 *  - real authentication (session or JWT) identifying "who is asking"
 *  - a webhook handler updating subscription status in the DB instead of
 *    calling the Stripe API live on every request
 *
 * The rest of the app (routes, frontend) is written so that swapping this
 * module out for a real user/session store would not require touching
 * the Stripe or Open Food Facts integrations.
 */

const demoUser = {
  id: "demo-user",
  email: "demo@foodfinder.local",
  stripeCustomerId: null, // set once the demo user starts a Checkout session
};

export function getDemoUser() {
  return demoUser;
}

export function setDemoUserStripeCustomerId(customerId) {
  demoUser.stripeCustomerId = customerId;
}

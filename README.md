# FoodFinder

A small full-stack app for searching packaged food products via [Open Food
Facts](https://world.openfoodfacts.org), with basic info (name, brand,
image) free for everyone, and detailed nutrition gated behind a Stripe
subscription. Interface and product data support English, Dutch, German,
and French via a manual language selector.

## Stack

- **Backend:** Node.js + Express (ESM), `node-fetch` for the Open Food
  Facts HTTP API, Stripe SDK for subscriptions.
- **Frontend:** React (Vite), plain CSS (no UI framework, to keep the
  bundle small and the styling transparent).
- **No database.** See "Simplifications" below.

## Project structure

```
foodfinder/
  backend/
    src/
      routes/         # products.js, billing.js, webhook.js
      services/        # openFoodFacts.js, stripeService.js, demoUserStore.js
      server.js
  frontend/
    src/
      components/      # SearchBar, ProductCard, ProductDetail, LanguageSelector, SubscriptionControl
      context/          # LanguageContext (i18n state)
      i18n/             # translations.js
      api.js            # fetch wrappers for the backend
      App.jsx
```

## Running locally

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Fill in `.env`:
- `STRIPE_SECRET_KEY` / `STRIPE_PRICE_ID` — from your Stripe **test mode**
  dashboard. Create one recurring Price for the demo subscription.
- `STRIPE_WEBHOOK_SECRET` — from `stripe listen --forward-to
  localhost:4000/api/webhook` (Stripe CLI) during local dev.
- If you skip Stripe entirely, the app still runs: search and basic info
  work, and the subscribe button is replaced with a disabled "Free plan"
  badge (see `isStripeConfigured()`).

Backend runs on `http://localhost:4000`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env   # points VITE_API_URL at the backend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

### 3. Try it

1. Search for a product (e.g. "Nutella", "Coca-Cola").
2. Switch languages with the selector top-right — both UI text and product
   name/ingredients (where OFF has that translation) update.
3. Click a product — nutrition table is locked.
4. Click "Subscribe" → completes a Stripe test Checkout (use card
   `4242 4242 4242 4242`) → redirected back → nutrition unlocks.
5. "Manage subscription" opens the Stripe customer portal to cancel.

## Key technical decisions

**Backend-mediated external API.** The frontend never calls Open Food
Facts directly. All requests go through `/api/products/*`, which lets the
backend: normalize/shape the response, decide access control server-side
(critical — nutrition-gating can't be done safely on the client), and
insulate the frontend from OFF's raw schema.

**Access control lives in one function.** `applyAccessControl()` in
`routes/products.js` is the single gate that strips `nutriments` /
`nutriscoreGrade` from a product unless the demo user has a verified
active Stripe subscription. Every route returning product data funnels
through it, so there's no route that can "forget" to check entitlement.
Subscription status is checked live against Stripe's API on each request
(fine for a demo's traffic volume) rather than cached — see below for the
production alternative.

**Server-side i18n coordination.** The frontend sends a `lang` query
param (`en`/`nl`/`de`/`fr`) with every product request. The backend maps
it to Open Food Facts's `lc` parameter and reads `product_name_<lang>` /
`ingredients_text_<lang>` fields with graceful fallback to English, then
the untranslated default. UI strings are a separate static dictionary
(`frontend/src/i18n/translations.js`) — the two localization concerns
(app UI vs. third-party product data) are deliberately decoupled since
they have different fallback behavior and data sources.

**Stripe integration is real, not mocked.** Uses actual Checkout
Sessions (redirect flow — no card data touches our servers), a webhook
endpoint for `checkout.session.completed`, and the Billing Portal for
self-service cancellation. The webhook route is mounted with
`express.raw()` before the global `express.json()` middleware, since
Stripe's signature verification needs the raw body bytes.

## Simplifications (and what a production version would change)

- **No database / no real auth.** There's a single hardcoded "demo user"
  (`services/demoUserStore.js`) held in server memory, whose Stripe
  customer ID gets set once they complete Checkout. This is enough to
  demonstrate the subscription-gating pattern without building a full
  auth system, but it means: state resets on server restart, and there's
  no multi-user support. A real app would have a `users` table with a
  `stripe_customer_id` column and session/JWT-based auth identifying the
  caller on each request.
- **Subscription status checked live against Stripe on every request**
  rather than cached in a DB and updated via webhook. This keeps the demo
  simpler (no DB) at the cost of an extra Stripe API round-trip per
  request and being non-functional if Stripe is briefly unreachable (in
  which case we fail closed — nutrition stays locked). Production apps
  typically store subscription status locally and treat the webhook as
  the write path, only falling back to a live Stripe check rarely.
  Failing closed on the Stripe check error rather than assuming a Stripe
  outage means letting users through the wall.
- **No caching/rate-limiting layer** in front of Open Food Facts. For a
  production app with real traffic you'd add a short-TTL cache (product
  detail pages rarely change) to reduce load on OFF's public API and
  improve latency.
- **No pagination UI**, though the backend already returns `page` /
  `pageCount` / `total` from OFF — wiring up "load more" / page controls
  was left out to keep the UI focused on the core search → detail flow.
- **No automated tests.** Given the scope, manual verification (search →
  detail → subscribe → unlock) was used instead of a test suite; a real
  project would add integration tests for the access-control gate
  specifically, since that's the security-critical path.
- **Localized product data depends on Open Food Facts's own translation
  coverage** — many products only have an English or original-language
  name/ingredients list, in which case the UI still shows something
  (via fallback) rather than an empty field, but it won't always be in
  the selected language. This is a property of the crowdsourced dataset,
  not something the app can fully solve.

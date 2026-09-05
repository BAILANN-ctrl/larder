# Larder

A full-stack app for searching packaged food products via [Open Food
Facts](https://world.openfoodfacts.org), with basic info (name, brand,
image) free for everyone, and detailed nutrition gated behind a Stripe
subscription. Interface and product data support English, Dutch, German,
and French via a manual language selector.

## Stack

- **Backend:** Node.js + Express + TypeScript, Prisma ORM + MySQL,
  `node-fetch` for the Open Food Facts HTTP API, Stripe SDK for subscriptions.
- **Frontend:** Next.js 14 + React 18 + TypeScript, Tailwind CSS.
- **Database:** MySQL via Prisma (stores the demo user, subscription status,
  and recent search history).

## Project structure

```
larder/
  backend/
    prisma/
      schema.prisma          # Database schema
    src/
      lib/
        prisma.ts            # Prisma client singleton
      routes/
        products.ts          # Product search & lookup routes
        billing.ts           # Stripe checkout, portal, and status routes
        webhook.ts           # Stripe webhook receiver
        searches.ts          # Recent searches route
      services/
        openFoodFacts.ts     # Open Food Facts API client
        searchService.ts     # Recent-search persistence
        stripeService.ts     # Stripe SDK wrapper
        userService.ts       # User database operations
      types/
        index.ts             # TypeScript type definitions
      app.ts                 # Express app (no listen, reusable in tests)
      server.ts              # App entry point
    tests/                   # Vitest + supertest automated tests
    tsconfig.json
  frontend/
    app/
      globals.css            # Tailwind CSS imports
      layout.tsx             # Root layout with LanguageProvider
      page.tsx               # Home/search page
    components/
      SearchBar.tsx
      ProductCard.tsx
      ProductDetail.tsx
      LanguageSelector.tsx
      SubscriptionControl.tsx
    context/
      LanguageContext.tsx     # React Context for i18n
    i18n/
      translations.ts        # Static translation dictionaries
    lib/
      api.ts                 # API client functions
    types.ts                 # Shared TypeScript types
    tailwind.config.ts
    next.config.js
    tsconfig.json
```

## Running locally

### 1. Database (MySQL)

Make sure MySQL is running, then update `DATABASE_URL` in `backend/.env`. If
the database named in `DATABASE_URL` doesn't exist yet (e.g. `larder`), create
it first:

```bash
mysql -u root -p -e "CREATE DATABASE larder;"
```

Then set up the schema:

```bash
cd backend
cp .env.example .env
npx prisma migrate dev   # runs the checked-in migration (users + searches tables)
```

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

Fill in `.env`:
- `DATABASE_URL` — MySQL connection string.
- `STRIPE_SECRET_KEY` / `STRIPE_PRICE_ID` — from your Stripe **test mode**
  dashboard. Create one recurring Price for the demo subscription.
- `STRIPE_WEBHOOK_SECRET` — from `stripe listen --forward-to
  localhost:4000/api/webhook` (Stripe CLI) during local dev.
- If you skip Stripe entirely, the app still runs: search and basic info
  work, and the subscribe button is replaced with a disabled "Free plan"
  badge (see `isStripeConfigured()`).

Backend runs on `http://localhost:4000`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env   # points NEXT_PUBLIC_API_URL at the backend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

### 4. Try it

1. Search for a product (e.g. "Nutella", "Coca-Cola").
2. Switch languages with the selector top-right — both UI text and product
   name/ingredients (where OFF has that translation) update.
3. Recent searches appear as clickable chips under the search bar (stored in
   MySQL and shared via `GET /api/searches`).
4. Click a product — nutrition table is locked.
5. Click "Subscribe" → completes a Stripe test Checkout (use card
   `4242 4242 4242 4242`) → redirected back → nutrition unlocks.
6. "Manage subscription" opens the Stripe customer portal to cancel.

### 5. Tests

```bash
cd backend
npm test            # vitest run
npm run test:watch  # vitest watch
```

37 tests cover the access-control gate, Open Food Facts data mapping
(missing/incomplete fields), search-history persistence, the product/search
routes, Stripe billing routes, and webhook handling. The Stripe API, Open
Food Facts, and the database are mocked — no external services needed.

## Key technical decisions

**Backend-mediated external API.** The frontend never calls Open Food
Facts directly. All requests go through `/api/products/*`, which lets the
backend: normalize/shape the response, decide access control server-side
(critical — nutrition-gating can't be done safely on the client), and
insulate the frontend from OFF's raw schema.

**Access control lives in one function.** `applyAccessControl()` in
`routes/products.ts` is the single gate that strips `nutriments` /
`nutriscoreGrade` from a product unless the user has a verified
active Stripe subscription. Every route returning product data funnels
through it, so there's no route that can "forget" to check entitlement.

**Database-backed subscription status.** Subscription status is stored in
the MySQL database and updated via Stripe webhooks. For access control the
backend still checks Stripe's subscription list on each request (the DB
column is the source of truth for what the webhook saw, keeping the manual
"subscription" state visible without an extra Stripe round-trip).

**Recent searches persisted in MySQL.** Every search in `GET
/api/products/search` writes a row to the `searches` table for the demo user
via `recordSearch()`. `GET /api/searches` returns the most recent **distinct**
terms (deduplicated in the service layer, so the DB stays a plain append-only
log). This keeps write path trivial — Prisma doesn't have to race on unique
constraints — while the read path still gives the user a useful "recent
searches" list. There is no user login/auth; all data hangs off the single
demo user, which is a deliberate simplification for this assignment.

**App is split from server for testability.** `app.ts` builds the Express
app without calling `listen()`, and `server.ts` starts it. Tests import the
app directly and drive it with supertest against mocked Stripe, Open Food
Facts, and Prisma modules — no live database or network calls required.

**Server-side i18n coordination.** The frontend sends a `lang` query
param (`en`/`nl`/`de`/`fr`) with every product request. The backend maps
it to Open Food Facts's `lc` parameter and reads `product_name_<lang>` /
`ingredients_text_<lang>` fields with graceful fallback to English, then
the untranslated default. UI strings are a separate static dictionary
(`frontend/i18n/translations.ts`) — the two localization concerns
(app UI vs. third-party product data) are deliberately decoupled since
they have different fallback behavior and data sources.

**Stripe integration is real, not mocked.** Uses actual Checkout
Sessions (redirect flow — no card data touches our servers), a webhook
endpoint for `checkout.session.completed`, and the Billing Portal for
self-service cancellation. The webhook route is mounted with
`express.raw()` before the global `express.json()` middleware, since
Stripe's signature verification needs the raw body bytes.

## Tech stack details

- **TypeScript** throughout (both frontend and backend)
- **Next.js 14** with App Router for the frontend
- **Tailwind CSS** for styling (replaces plain CSS)
- **Prisma ORM** for database access
- **MySQL** for persistent storage
- **Express** for the backend API server
- **React 18** for UI components
- **Open Food Facts API** for product data
- **Stripe SDK** for subscription management

## Known limitations

- **Single demo user, no authentication.** There is no login/signup; every
  request resolves to the one seeded demo user (`demo@larder.local`). All
  recent searches and subscription state are shared/single-tenant.
- **Nutrition gating trusts the demo user's Stripe customer.** A client that
  impersonates the demo user's Stripe customer ID would receive unlocked
  nutrition. With real per-user auth, access must be tied to the authenticated
  account, not a shared demo customer.
- **Access control is checked against Stripe per request.** The DB
  `subscriptionStatus` column records what the webhook observed but is not
  itself used for gating; each product request makes a Stripe call. This adds
  latency and a dependency on Stripe availability at request time.
- **Search pagination is minimal.** The UI shows only the first page of OFF
  results; there is no way to page deeper in the interface.
- **Open Food Facts data quality varies.** Products frequently lack images,
  ingredients, or nutrition for a given language; the app gracefully falls back
  (English → default → empty) but some products will show minimal data.
- **Stripe webhooks require a public URL in production.** The included local
  workflow relies on the Stripe CLI (`stripe listen --forward-to`) to deliver
  webhooks; a deployed backend needs an externally reachable endpoint.
- **No rate limiting or request throttling.** Repeated searches hit OFF and
  Prisma without protection, so abuse is unmitigated.

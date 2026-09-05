import { Router, Request, Response } from "express";
import { searchProducts, getProductByBarcode, sanitizeQuery } from "../services/openFoodFacts.js";
import { hasActiveSubscription } from "../services/stripeService.js";
import { getOrCreateDemoUser } from "../services/userService.js";
import { recordSearch } from "../services/searchService.js";
import { Product, DemoUser } from "../types/index.js";

const router = Router();
export const SUPPORTED_LANGS = ["en", "nl", "de", "fr"];

export function resolveLang(query: any): string {
  const lang = String(query.lang || "en").toLowerCase();
  return SUPPORTED_LANGS.includes(lang) ? lang : "en";
}

export function applyAccessControl(
  product: Product,
  canViewNutrition: boolean
): Product {
  if (canViewNutrition) return product;
  const { nutriments, nutriscoreGrade, ...rest } = product;
  return { ...rest, nutriments: null, nutriscoreGrade: null, locked: true };
}

async function getDemoAccess(): Promise<{ user: DemoUser; unlocked: boolean }> {
  const user = await getOrCreateDemoUser();
  if (!user.stripeCustomerId) return { user, unlocked: false };
  try {
    return {
      user,
      unlocked: await hasActiveSubscription(user.stripeCustomerId),
    };
  } catch (err: any) {
    console.error("Subscription check failed:", err.message);
    return { user, unlocked: false };
  }
}

router.get("/search", async (req: Request, res: Response) => {
  const query = sanitizeQuery(String(req.query.q || ""));
  if (!query) {
    return res.status(400).json({ error: "Query parameter 'q' is required." });
  }

  const lang = resolveLang(req.query);
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);

  try {
    const { user, unlocked } = await getDemoAccess();
    await recordSearch(user.id, query);
    const result = await searchProducts(query, lang, page);
    res.json({
      ...result,
      products: result.products.map((p) => applyAccessControl(p, unlocked)),
      unlocked,
    });
  } catch (err: any) {
    console.error(err);
    const message = err?.message || "Failed to fetch products from Open Food Facts.";
    if (message.includes("rate limit")) {
      return res.status(429).json({ error: "Open Food Facts is rate-limited right now. Try again shortly." });
    }
    if (message.includes("temporarily unavailable")) {
      return res.status(503).json({ error: "Open Food Facts is temporarily unavailable. Try again shortly." });
    }
    if (message.includes("invalid response")) {
      return res.status(502).json({ error: "Open Food Facts returned unreadable data. Try refining your search." });
    }
    res.status(502).json({ error: "Failed to fetch products from Open Food Facts." });
  }
});

router.get("/:code", async (req: Request, res: Response) => {
  const lang = resolveLang(req.query);

  try {
    const { unlocked } = await getDemoAccess();
    const product = await getProductByBarcode(req.params.code, lang);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }
    res.json({ product: applyAccessControl(product, unlocked), unlocked });
  } catch (err: any) {
    console.error(err);
    const message = err?.message || "";
    if (message.includes("rate limit")) {
      return res.status(429).json({ error: "Open Food Facts is rate-limited right now. Try again shortly." });
    }
    if (message.includes("temporarily unavailable")) {
      return res.status(503).json({ error: "Open Food Facts is temporarily unavailable. Try again shortly." });
    }
    if (message.includes("invalid response")) {
      return res.status(502).json({ error: "Open Food Facts returned unreadable data for this barcode." });
    }
    res.status(502).json({ error: "Failed to fetch product from Open Food Facts." });
  }
});

export default router;
import { Router } from "express";
import { searchProducts, getProductByBarcode } from "../services/openFoodFacts.js";
import { hasActiveSubscription } from "../services/stripeService.js";
import { getDemoUser } from "../services/demoUserStore.js";

const router = Router();
const SUPPORTED_LANGS = ["en", "nl", "de", "fr"];

function resolveLang(query) {
  const lang = String(query.lang || "en").toLowerCase();
  return SUPPORTED_LANGS.includes(lang) ? lang : "en";
}

/**
 * Strips premium (nutritional) fields from a product unless the caller is
 * entitled to see them. This is the single gate used by every route that
 * returns product data, so access control can't be forgotten in one place
 * and applied in another.
 */
function applyAccessControl(product, canViewNutrition) {
  if (canViewNutrition) return product;
  const { nutriments, nutriscoreGrade, ...rest } = product;
  return { ...rest, nutriments: null, nutriscoreGrade: null, locked: true };
}

async function canViewNutrition() {
  const user = getDemoUser();
  if (!user.stripeCustomerId) return false;
  try {
    return await hasActiveSubscription(user.stripeCustomerId);
  } catch (err) {
    // If Stripe is unreachable/misconfigured, fail closed (treat as no
    // subscription) rather than leaking premium data.
    console.error("Subscription check failed:", err.message);
    return false;
  }
}

router.get("/search", async (req, res) => {
  const query = String(req.query.q || "").trim();
  if (!query) {
    return res.status(400).json({ error: "Query parameter 'q' is required." });
  }

  const lang = resolveLang(req.query);
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);

  try {
    const unlocked = await canViewNutrition();
    const result = await searchProducts(query, lang, page);
    res.json({
      ...result,
      products: result.products.map((p) => applyAccessControl(p, unlocked)),
      unlocked,
    });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "Failed to fetch products from Open Food Facts." });
  }
});

router.get("/:code", async (req, res) => {
  const lang = resolveLang(req.query);

  try {
    const unlocked = await canViewNutrition();
    const product = await getProductByBarcode(req.params.code, lang);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }
    res.json({ product: applyAccessControl(product, unlocked), unlocked });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "Failed to fetch product from Open Food Facts." });
  }
});

export default router;

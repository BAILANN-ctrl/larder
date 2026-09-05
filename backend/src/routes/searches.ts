import { Router, Request, Response } from "express";
import { recentSearches } from "../services/searchService.js";
import { getOrCreateDemoUser } from "../services/userService.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const limit = Math.min(Math.max(parseInt(String(req.query.limit), 10) || 10, 1), 20);

  try {
    const user = await getOrCreateDemoUser();
    const terms = await recentSearches(user.id, limit);
    res.json({ terms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load recent searches." });
  }
});

export default router;
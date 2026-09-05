import "dotenv/config";
import express from "express";
import cors from "cors";

import productsRouter from "./routes/products.js";
import billingRouter from "./routes/billing.js";
import webhookRouter from "./routes/webhook.js";
import searchesRouter from "./routes/searches.js";

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(cors({ origin: FRONTEND_URL }));

// IMPORTANT: the Stripe webhook route needs the raw request body to verify
// the signature, so it's mounted with express.raw() BEFORE the global
// express.json() middleware below. Order matters here.
app.use("/api/webhook", express.raw({ type: "application/json" }), webhookRouter);

app.use(express.json());

app.use("/api/products", productsRouter);
app.use("/api/billing", billingRouter);
app.use("/api/searches", searchesRouter);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

export default app;
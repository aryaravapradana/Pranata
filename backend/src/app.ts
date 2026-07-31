import express, {
  Request,
  Response,
} from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import routes from "./routes";
import { verifyToken } from "./middlewares/auth.middleware";
import { globalErrorHandler } from "./middlewares/error.middleware";
import { getPrices } from "./controllers/hub.controller";
import {
  getSellerEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "./controllers/profile.controller";

const app = express();
app.set("trust proxy", 1);
app.set("etag", true);

// ── Bulletproof CORS & Preflight OPTIONS Handler ──
app.use(
  (req: Request, res: Response, next) => {
    const origin =
      req.headers.origin ||
      "https://pranata-frontend.vercel.app";
    res.setHeader(
      "Access-Control-Allow-Origin",
      origin,
    );
    res.setHeader(
      "Access-Control-Allow-Credentials",
      "true",
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-Token",
    );

    // Set no-cache for dynamic API GET requests so browser always gets fresh data after mutations
    if (req.method === "GET") {
      res.setHeader(
        "Cache-Control",
        "no-cache, private, must-revalidate",
      );
    }

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    next();
  },
);

// ── Security Headers (Vercel Edge automatically handles Gzip/Brotli compression) ──
app.use(helmet({ hidePoweredBy: true }));

// ── Body Parser ──
app.use(express.json({ limit: "5mb" }));

// ── Global Rate Limiter ──
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error:
      "Terlalu banyak request, coba lagi dalam 15 menit.",
  },
});
app.use(globalLimiter);

// ── Status Endpoint (public, Edge cached) ──
app.get(
  "/api/status",
  (req: Request, res: Response) => {
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=120",
    );
    res.json({
      status: "OK",
      service: "Pranata API",
      version: "2.0.0",
    });
  },
);

// ── Protected Standalone Routes ──
app.get(
  "/api/prices",
  verifyToken,
  getPrices,
);
app.get(
  "/api/events/:sellerId",
  verifyToken,
  getSellerEvents,
);
app.post(
  "/api/events",
  verifyToken,
  createEvent,
);
app.put(
  "/api/events/:id",
  verifyToken,
  updateEvent,
);
app.delete(
  "/api/events/:id",
  verifyToken,
  deleteEvent,
);

// ── Main Router (auth rate-limited at profile level) ──
app.use("/api", routes);

// ── Global Error Handler (must be last) ──
app.use(globalErrorHandler);

export default app;

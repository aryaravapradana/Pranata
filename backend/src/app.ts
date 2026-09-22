import express, {
  Request,
  Response,
} from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
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
app.set("etag", "strong");

// ── Ultra-Fast Gzip / Deflate Compression (70-85% smaller payloads) ──
app.use(
  compression({
    threshold: 512, // Compress any response > 512 bytes
    level: 6,       // Optimal balance of CPU speed vs compression ratio
  }),
);

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

    // Smart caching for maximum speed: SWR for public data, private for user mutations
    if (req.method === "GET") {
      const path = req.path;
      if (
        path === "/api/products" ||
        path.startsWith("/api/products/") ||
        path === "/api/prices" ||
        path === "/api/status" ||
        path === "/api/hub/overview"
      ) {
        res.setHeader(
          "Cache-Control",
          "public, max-age=15, stale-while-revalidate=60",
        );
      } else {
        res.setHeader(
          "Cache-Control",
          "no-cache, private, must-revalidate",
        );
      }
    }

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    next();
  },
);

// ── Security Headers ──
app.use(helmet({ hidePoweredBy: true }));

// ── Body Parser ──
app.use(express.json({ limit: "5mb" }));

// ── Global Rate Limiter ──
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: (req) => req.method === "OPTIONS" || req.path === "/api/status",
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

import { Request, Response } from "express";
import prisma from "../config/prisma";
import {
  getCache,
  getStaleCache,
  setCache,
} from "../utils/cache";
import { logger } from "../utils/logger";

export const FALLBACK_COMMODITY_PRICES = [
  {
    id: "fb-corn",
    commodity: "JAGUNG_PETERNAK",
    pricePerKg: 5400,
    region: "DI Yogyakarta & Jawa Tengah",
    recordedAt: new Date().toISOString(),
  },
  {
    id: "fb-broiler",
    commodity: "AYAM_BROILER",
    pricePerKg: 24500,
    region: "DI Yogyakarta & Jawa Tengah",
    recordedAt: new Date().toISOString(),
  },
  {
    id: "fb-egg",
    commodity: "TELUR_AYAM_RAS",
    pricePerKg: 28000,
    region: "DI Yogyakarta & Jawa Tengah",
    recordedAt: new Date().toISOString(),
  },
  {
    id: "fb-beef",
    commodity: "DAGING_SAPI",
    pricePerKg: 135000,
    region: "DI Yogyakarta & Jawa Tengah",
    recordedAt: new Date().toISOString(),
  },
  {
    id: "fb-soy",
    commodity: "KEDELAI_IMPOR",
    pricePerKg: 12200,
    region: "DI Yogyakarta & Jawa Tengah",
    recordedAt: new Date().toISOString(),
  },
  {
    id: "fb-ricebran",
    commodity: "BEKATUL_DEDAK",
    pricePerKg: 4300,
    region: "DI Yogyakarta & Jawa Tengah",
    recordedAt: new Date().toISOString(),
  },
];

export const getDashboardOverview = async (
  req: Request,
  res: Response,
) => {
  try {
    const cacheKey = "dashboard_overview";
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const cornPrice =
      await prisma.commodityPrice.findFirst({
        where: {
          commodity: { in: ["JAGUNG_PETERNAK", "CORN"] },
        },
        orderBy: { recordedAt: "desc" },
      });

    const result = {
      cornPrice: cornPrice?.pricePerKg || 5400,
      healthIndex: 98.8,
    };
    setCache(cacheKey, result, 300);
    return res.json(result);
  } catch (error) {
    logger.warn("[getDashboardOverview] DB unreachable, serving resilient fallback:", error);
    const stale = getStaleCache("dashboard_overview");
    if (stale) return res.json(stale);
    return res.json({
      cornPrice: 5400,
      healthIndex: 98.8,
    });
  }
};

export const getPrices = async (
  req: Request,
  res: Response,
) => {
  try {
    const cacheKey = "commodity_prices";
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const prices =
      await prisma.commodityPrice.findMany({
        orderBy: { recordedAt: "desc" },
        take: 50,
      });

    const latestUnique = Array.from(
      new Map(
        prices.map((item) => [
          item.commodity,
          item,
        ]),
      ).values(),
    );

    const result = latestUnique.length > 0 ? latestUnique : FALLBACK_COMMODITY_PRICES;
    setCache(cacheKey, result, 300);
    return res.json(result);
  } catch (error) {
    logger.warn("[getPrices] DB unreachable, serving resilient fallback prices:", error);
    const stale = getStaleCache("commodity_prices");
    if (stale) return res.json(stale);
    return res.json(FALLBACK_COMMODITY_PRICES);
  }
};

export const preloadPricesCache = async (): Promise<void> => {
  try {
    const prices = await prisma.commodityPrice.findMany({
      orderBy: { recordedAt: "desc" },
      take: 50,
    });

    const latestUnique = Array.from(
      new Map(
        prices.map((item) => [
          item.commodity,
          item,
        ]),
      ).values(),
    );

    const finalPrices = latestUnique.length > 0 ? latestUnique : FALLBACK_COMMODITY_PRICES;
    setCache("commodity_prices", finalPrices, 300);

    const cornPrice = finalPrices.find((p) => p.commodity === "JAGUNG_PETERNAK" || p.commodity === "CORN") || finalPrices[0];
    setCache(
      "dashboard_overview",
      {
        cornPrice: cornPrice?.pricePerKg || 5400,
        healthIndex: 98.8,
      },
      300,
    );

    console.log(`⚡ Commodity prices cache pre-warmed: ${finalPrices.length} commodities in RAM`);
  } catch (err) {
    console.warn("⚠️ Prices cache pre-warm warning (using RAM fallback):", err);
    setCache("commodity_prices", FALLBACK_COMMODITY_PRICES, 300);
    setCache(
      "dashboard_overview",
      {
        cornPrice: 5400,
        healthIndex: 98.8,
      },
      300,
    );
  }
};


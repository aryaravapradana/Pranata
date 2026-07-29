import { Request, Response } from "express";
import prisma from "../config/prisma";
import {
  getCache,
  setCache,
} from "../utils/cache";

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
          commodity: "JAGUNG_PETERNAK",
        },
        orderBy: { recordedAt: "desc" },
      });

    const result = {
      cornPrice: cornPrice?.pricePerKg || 0,
      healthIndex: 98.8,
    };
    setCache(cacheKey, result, 300);
    res.json(result);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error: "Internal Server Error",
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

    setCache(cacheKey, latestUnique, 300);
    res.json(latestUnique);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error: "Internal Server Error",
      });
  }
};

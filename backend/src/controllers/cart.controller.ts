import { Request, Response } from "express";
import prisma from "../config/prisma";
import { z } from "zod";
import { getCache, getStaleCache, setCache, delCache } from "../utils/cache";
import { logger } from "../utils/logger";

const updateCartSchema = z.object({
  productId: z
    .string()
    .min(1, "productId tidak valid"),
  quantity: z
    .number()
    .int()
    .min(1, "Quantity minimal 1"),
});

const getBuyerId = (req: Request): string =>
  String(req.params.buyerId);
const getProductId = (
  req: Request,
): string => String(req.params.productId);

export const getCart = async (
  req: Request,
  res: Response,
) => {
  const buyerId = getBuyerId(req);
  if (req.user?.id !== buyerId)
    return res
      .status(403)
      .json({ error: "Forbidden" });

  const cacheKey = `cart_${buyerId}`;
  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    const cart =
      await prisma.cartItem.findMany({
        where: { buyerId },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              stock: true,
              unit: true,
              minOrder: true,
              imageUrls: true,
              category: true,
              sellerId: true,
              isSponsored: true,
              grade: true,
            },
          },
        },
      });
    setCache(cacheKey, cart, 30);
    return res.json(cart);
  } catch (error) {
    logger.warn("[getCart] Database error, serving resilient fallback:", error);
    const stale = getStaleCache<any[]>(cacheKey);
    if (stale) return res.json(stale);
    return res.json([]);
  }
};

export const updateCartItem = async (
  req: Request,
  res: Response,
) => {
  const buyerId = getBuyerId(req);
  if (req.user?.id !== buyerId)
    return res
      .status(403)
      .json({ error: "Forbidden" });

  const parse = updateCartSchema.safeParse(
    req.body,
  );
  if (!parse.success)
    return res
      .status(400)
      .json({
        error: parse.error.issues[0].message,
      });

  const { productId, quantity } = parse.data;

  try {
    const product =
      await prisma.product.findUnique({
        where: { id: productId },
      });
    if (!product)
      return res
        .status(404)
        .json({
          error: "Produk tidak ditemukan",
        });
    if (product.sellerId === buyerId) {
      return res.status(400).json({
        error:
          "Anda tidak dapat membeli produk Anda sendiri",
      });
    }

    const cartItem =
      await prisma.cartItem.upsert({
        where: {
          buyerId_productId: {
            buyerId,
            productId,
          },
        },
        update: { quantity },
        create: {
          buyerId,
          productId,
          quantity,
        },
      });
    delCache(`cart_${buyerId}`);
    return res.json(cartItem);
  } catch (error) {
    console.error("[updateCartItem]", error);
    return res
      .status(500)
      .json({
        error: "Gagal memperbarui keranjang",
      });
  }
};

export const removeCartItem = async (
  req: Request,
  res: Response,
) => {
  const buyerId = getBuyerId(req);
  const productId = getProductId(req);
  if (req.user?.id !== buyerId)
    return res
      .status(403)
      .json({ error: "Forbidden" });

  try {
    await prisma.cartItem.delete({
      where: {
        buyerId_productId: {
          buyerId,
          productId,
        },
      },
    });
    delCache(`cart_${buyerId}`);
    return res.json({ success: true });
  } catch (error) {
    console.error("[removeCartItem]", error);
    return res
      .status(500)
      .json({
        error: "Gagal menghapus item",
      });
  }
};

export const clearCart = async (
  req: Request,
  res: Response,
) => {
  const buyerId = getBuyerId(req);
  if (req.user?.id !== buyerId)
    return res
      .status(403)
      .json({ error: "Forbidden" });

  try {
    await prisma.cartItem.deleteMany({
      where: { buyerId },
    });
    delCache(`cart_${buyerId}`);
    return res.json({ success: true });
  } catch (error) {
    console.error("[clearCart]", error);
    return res
      .status(500)
      .json({
        error:
          "Gagal membersihkan keranjang",
      });
  }
};

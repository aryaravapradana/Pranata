import { Request, Response } from "express";
import prisma from "../config/prisma";
import { z } from "zod";
import {
  getCache,
  getStaleCache,
  setCache,
  flushCache,
} from "../utils/cache";
import { logger } from "../utils/logger";
import { FALLBACK_PRODUCTS } from "../data/fallbackProducts";

const productSchema = z.object({
  title: z
    .string()
    .min(
      3,
      "Judul produk minimal 3 karakter",
    )
    .max(100),
  description: z
    .string()
    .max(2000)
    .optional(),
  category: z.string().default("Lainnya"),
  price: z
    .number()
    .positive("Harga harus lebih dari 0"),
  stock: z
    .number()
    .int()
    .min(0, "Stok tidak boleh negatif"),
  minOrder: z
    .number()
    .int()
    .min(1)
    .default(1),
  unit: z.string().default("kg"),
  imageUrls: z.array(z.string()).default([]),
  grade: z.string().optional(),
  aiAnalysis: z.string().optional(),
});

export const getAllProducts = async (
  req: Request,
  res: Response,
) => {
  try {
    const page = Math.max(
      1,
      parseInt(String(req.query.page)) || 1,
    );
    const limit = Math.min(
      50,
      parseInt(String(req.query.limit)) ||
        20,
    );

    // Check cache
    const cacheKey = `products_${page}_${limit}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const skip = (page - 1) * limit;

    const [products, total] =
      await Promise.all([
        prisma.product.findMany({
          where: { deletedAt: null },
          include: {
            seller: {
              select: {
                id: true,
                username: true,
                fullName: true,
                farmName: true,
                avatarUrl: true,
                location: true,
                subscriptionTier: true,
              },
            },
          },
          orderBy: [
            { isSponsored: "desc" },
            { createdAt: "desc" },
          ],
          take: limit,
          skip,
        }),
        prisma.product.count({
          where: { deletedAt: null },
        }),
      ]);

    const result = {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    // Set cache (30 seconds)
    setCache(cacheKey, result, 30);

    return res.json(result);
  } catch (error) {
    logger.warn(
      "Database unreachable, serving high-resilience stale cache or marketplace fallback products",
      error,
    );
    const page = Math.max(1, parseInt(String(req.query.page)) || 1);
    const limit = Math.min(50, parseInt(String(req.query.limit)) || 20);
    const search = (String(req.query.search || "")).toLowerCase().trim();
    const category = String(req.query.category || "ALL");
    const sortBy = String(req.query.sortBy || "latest");
    const featuredOnly = String(req.query.featured || "") === "true";
    const isSponsoredOnly = String(req.query.sponsored || "") === "true";
    const cacheKey = `products_${page}_${limit}_${search}_${category}_${sortBy}_${featuredOnly}_${isSponsoredOnly}`;
    const stale = getStaleCache<any>(cacheKey);
    if (stale) return res.json(stale);

    // Gracefully serve fallback catalog so Marketplace and AI Copilot never break
    const skip = (page - 1) * limit;
    const paginated = FALLBACK_PRODUCTS.slice(skip, skip + limit);

    return res.json({
      data: paginated,
      total: FALLBACK_PRODUCTS.length,
      page,
      limit,
      totalPages: Math.ceil(FALLBACK_PRODUCTS.length / limit),
    });
  }
};

export const toggleSponsoredProduct = async (
  req: Request,
  res: Response,
) => {
  try {
    const productId = String(req.params.id);
    const sellerId = req.user?.id;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.sellerId !== sellerId) {
      return res.status(403).json({ error: "Produk tidak ditemukan atau bukan milik Anda" });
    }

    const nextState = !product.isSponsored;

    if (nextState) {
      const user = await prisma.profile.findUnique({
        where: { id: sellerId },
        select: { subscriptionTier: true },
      });
      const isSellerPlus = user?.subscriptionTier === "SELLER_PLUS" || user?.subscriptionTier === "PLUS";
      if (!isSellerPlus) {
        return res.status(403).json({ error: "Fitur Promosi Produk Teratas hanya tersedia untuk Membership Seller Plus" });
      }

      // If activating sponsor, untoggle any other sponsored products for this seller (max 1 active sponsor)
      await prisma.product.updateMany({
        where: { sellerId, isSponsored: true },
        data: { isSponsored: false },
      });
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { isSponsored: nextState },
    });

    flushCache();

    return res.json({
      message: nextState
        ? "Produk berhasil dipromosikan ke posisi teratas (Sponsored)"
        : "Promosi produk dinonaktifkan",
      product: updated,
    });
  } catch (error) {
    logger.error("Failed to toggle sponsored product", error);
    return res.status(500).json({ error: "Gagal mengubah status promosi produk" });
  }
};


export const getSellerProducts = async (
  req: Request,
  res: Response,
) => {
  try {
    const sellerId = String(req.params.id);
    const page = Math.max(
      1,
      parseInt(String(req.query.page)) || 1,
    );
    const limit = Math.min(
      500,
      parseInt(String(req.query.limit)) ||
        20,
    );

    const cacheKey = `seller_products_${sellerId}_${page}_${limit}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const skip = (page - 1) * limit;

    const [products, total] =
      await Promise.all([
        prisma.product.findMany({
          where: {
            sellerId,
            deletedAt: null,
          },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip,
        }),
        prisma.product.count({
          where: {
            sellerId,
            deletedAt: null,
          },
        }),
      ]);

    const result = {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    setCache(cacheKey, result, 60);
    return res.json(result);
  } catch (error) {
    logger.warn(
      "[getSellerProducts] Database unreachable, checking stale cache or fallback:",
      error,
    );
    const sellerId = String(req.params.id);
    const page = Math.max(1, parseInt(String(req.query.page)) || 1);
    const limit = Math.min(500, parseInt(String(req.query.limit)) || 20);
    const cacheKey = `seller_products_${sellerId}_${page}_${limit}`;
    const stale = getStaleCache<any>(cacheKey);
    if (stale) return res.json(stale);

    // Fallback products filtered for seller or sample catalog
    const sellerFallback = FALLBACK_PRODUCTS.filter(
      (p) => p.sellerId === sellerId || p.seller?.id === sellerId
    );
    const fallbackList = sellerFallback.length > 0 ? sellerFallback : FALLBACK_PRODUCTS.slice(0, 4);

    return res.json({
      data: fallbackList,
      total: fallbackList.length,
      page,
      limit,
      totalPages: 1,
    });
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = String(req.params.id);
    const cacheKey = `product_detail_${id}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const product =
      await prisma.product.findUnique({
        where: {
          id,
          deletedAt: null,
        },
        select: {
          id: true,
          sellerId: true,
          title: true,
          description: true,
          category: true,
          price: true,
          stock: true,
          minOrder: true,
          unit: true,
          imageUrls: true,
          grade: true,
          aiAnalysis: true,
          createdAt: true,
          updatedAt: true,
          seller: {
            select: {
              id: true,
              username: true,
              fullName: true,
              farmName: true,
              avatarUrl: true,
              location: true,
              contact: true,
            },
          },
        },
      });
    if (!product)
      return res
        .status(404)
        .json({
          error: "Produk tidak ditemukan",
        });

    setCache(cacheKey, product, 60);
    return res.json(product);
  } catch (error) {
    logger.warn("[getProductById] DB error, checking stale cache or fallback catalog:", error);
    const id = String(req.params.id);
    const cacheKey = `product_detail_${id}`;
    const stale = getStaleCache<any>(cacheKey);
    if (stale) return res.json(stale);

    const fallbackProd = FALLBACK_PRODUCTS.find((p) => p.id === id) || FALLBACK_PRODUCTS[0];
    if (fallbackProd) {
      return res.json(fallbackProd);
    }
    return res
      .status(404)
      .json({
        error:
          "Produk tidak ditemukan",
      });
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
) => {
  const sellerId = req.user?.id;
  if (!sellerId)
    return res
      .status(401)
      .json({ error: "Unauthorized" });
  if (req.user?.role !== "PRODUCER")
    return res
      .status(403)
      .json({
        error:
          "Hanya PRODUCER yang bisa menambah produk",
      });

  const parse = productSchema.safeParse(
    req.body,
  );
  if (!parse.success)
    return res
      .status(400)
      .json({
        error: parse.error.issues[0].message,
      });

  try {
    const product =
      await prisma.product.create({
        data: { sellerId, ...parse.data },
      });
    flushCache();
    return res.status(201).json(product);
  } catch (error) {
    console.error("[createProduct]", error);
    return res
      .status(500)
      .json({
        error: "Gagal membuat produk",
      });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
) => {
  const id = String(req.params.id);

  const parse = productSchema
    .partial()
    .safeParse(req.body);
  if (!parse.success)
    return res
      .status(400)
      .json({
        error: parse.error.issues[0].message,
      });

  try {
    const existing =
      await prisma.product.findUnique({
        where: { id },
        select: { id: true, sellerId: true },
      });
    if (!existing)
      return res
        .status(404)
        .json({
          error: "Produk tidak ditemukan",
        });
    if (existing.sellerId !== req.user?.id)
      return res
        .status(403)
        .json({
          error:
            "Forbidden: bukan produk Anda",
        });

    const updatedProduct =
      await prisma.product.update({
        where: { id },
        data: parse.data,
      });
    flushCache();
    return res.json(updatedProduct);
  } catch (error) {
    console.error("[updateProduct]", error);
    return res
      .status(500)
      .json({
        error: "Gagal memperbarui produk",
      });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
) => {
  const id = String(req.params.id);

  try {
    const existing =
      await prisma.product.findUnique({
        where: { id },
        select: { id: true, sellerId: true },
      });
    if (!existing)
      return res
        .status(404)
        .json({
          error: "Produk tidak ditemukan",
        });
    if (existing.sellerId !== req.user?.id)
      return res
        .status(403)
        .json({
          error:
            "Forbidden: bukan produk Anda",
        });

    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    flushCache();
    return res.json({
      success: true,
      message: "Produk dihapus",
    });
  } catch (error) {
    console.error("[deleteProduct]", error);
    return res
      .status(500)
      .json({
        error: "Gagal menghapus produk",
      });
  }
};

export const preloadProductCache = async (): Promise<void> => {
  try {
    const page = 1;
    const limit = 20;
    const cacheKey = `products_${page}_${limit}`;
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { deletedAt: null },
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              fullName: true,
              farmName: true,
              avatarUrl: true,
              location: true,
              subscriptionTier: true,
            },
          },
        },
        orderBy: [
          { isSponsored: "desc" },
          { createdAt: "desc" },
        ],
        take: limit,
        skip: 0,
      }),
      prisma.product.count({
        where: { deletedAt: null },
      }),
    ]);

    const result = {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
    setCache(cacheKey, result, 60);
    console.log(`⚡ Product cache pre-warmed: ${products.length} items in RAM`);
  } catch (err) {
    console.warn("⚠️ Product cache pre-warm warning:", err);
  }
};

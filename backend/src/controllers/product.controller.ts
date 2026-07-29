import { Request, Response } from "express";
import prisma from "../config/prisma";
import { z } from "zod";
import {
  getCache,
  setCache,
  flushCache,
} from "../utils/cache";
import { logger } from "../utils/logger";

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
              },
            },
          },
          orderBy: { createdAt: "desc" },
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

    // Set cache (60 seconds)
    setCache(cacheKey, result, 60);

    return res.json(result);
  } catch (error) {
    logger.error(
      "Failed to get all products",
      error,
    );
    return res
      .status(500)
      .json({
        error: "Gagal mengambil produk",
      });
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
    console.error(
      "[getSellerProducts]",
      error,
    );
    return res
      .status(500)
      .json({
        error:
          "Gagal mengambil produk seller",
      });
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
) => {
  try {
    const product =
      await prisma.product.findUnique({
        where: {
          id: String(req.params.id),
          deletedAt: null,
        },
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              fullName: true,
              farmName: true,
              avatarUrl: true,
              location: true,
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
    return res.json(product);
  } catch (error) {
    console.error("[getProductById]", error);
    return res
      .status(500)
      .json({
        error:
          "Gagal mengambil detail produk",
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

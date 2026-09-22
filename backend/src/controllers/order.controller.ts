import { Request, Response } from "express";
import {
  getCache,
  getStaleCache,
  setCache,
  delCache,
  delCacheByPrefix,
  flushCache,
} from "../utils/cache";
import prisma from "../config/prisma";
import { z } from "zod";
import { JobQueue } from "../utils/queue";
import { logger } from "../utils/logger";

interface OrderNotificationJob {
  orderId: string;
  buyerId: string;
  sellerId: string;
}

const notificationQueue =
  new JobQueue<OrderNotificationJob>(
    async (job) => {
      // Simulate heavy notification/email processing
      await new Promise((resolve) =>
        setTimeout(resolve, 2000),
      );
      logger.info(
        "Notification sent for order",
        {
          orderId: job.orderId,
        },
      );
    },
  );

const checkoutSchema = z.object({
  buyerId: z.string().uuid(),
  sellerId: z.string().uuid(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1),
        price: z.number().positive(),
      }),
    )
    .min(1, "Minimal 1 item diperlukan"),
  shippingAddress: z
    .string()
    .min(5, "Alamat pengiriman wajib diisi"),
  shippingMethod: z.string().optional(),
  paymentMethod: z.string().optional(),
  shippingFee: z.number().min(0).default(0),
  platformFee: z.number().min(0).default(0),
  insuranceFee: z.number().min(0).default(0),
  coldChainFee: z.number().min(0).default(0),
  qcInspectionFee: z.number().min(0).default(0),
  requestedArrivalDate: z
    .string()
    .datetime()
    .optional(),
});

export const checkout = async (
  req: Request,
  res: Response,
) => {
  const parse = checkoutSchema.safeParse(
    req.body,
  );
  if (!parse.success)
    return res
      .status(400)
      .json({
        error: parse.error.issues[0].message,
      });

  const {
    buyerId,
    sellerId,
    items,
    shippingAddress,
    shippingMethod,
    paymentMethod,
    shippingFee,
    insuranceFee,
    coldChainFee,
    qcInspectionFee,
    requestedArrivalDate,
  } = parse.data;

  if (req.user?.id !== buyerId)
    return res
      .status(403)
      .json({ error: "Forbidden" });
  if (buyerId === sellerId)
    return res.status(400).json({
      error:
        "Anda tidak dapat membeli produk Anda sendiri",
    });

  const itemsSubtotal = items.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0,
  );

  // Take Rate: 3.5% from items subtotal
  const takeRateFee = Math.round(itemsSubtotal * 0.035);
  const sellerNetPayout = itemsSubtotal - takeRateFee;

  // Buyer protection fee: Rp 0 if paying with Pranata Pay (promo), otherwise Rp 2.500
  const isPranataPay = paymentMethod === "pranata_pay";
  const buyerProtectionFee = isPranataPay ? 0 : 2500;

  const totalAmount =
    itemsSubtotal +
    shippingFee +
    buyerProtectionFee +
    insuranceFee +
    coldChainFee +
    qcInspectionFee;

  try {
    const order = await prisma.$transaction(
      async (tx) => {
        // If Pranata Pay, verify and deduct buyer's wallet balance
        if (isPranataPay) {
          const buyerProfile = await tx.profile.findUnique({
            where: { id: buyerId },
            select: { walletBalance: true },
          });
          if (!buyerProfile || buyerProfile.walletBalance < totalAmount) {
            throw new Error("Saldo Pranata Pay tidak mencukupi untuk pembayaran ini");
          }
          await tx.profile.update({
            where: { id: buyerId },
            data: {
              walletBalance: {
                decrement: totalAmount,
              },
            },
          });
        }

        const productIds = items.map(
          (i) => i.productId,
        );
        const products =
          await tx.product.findMany({
            where: {
              id: { in: productIds },
            },
            select: {
              id: true,
              title: true,
              stock: true,
            },
          });

        const productMap = new Map(
          products.map((p) => [p.id, p]),
        );

        for (const item of items) {
          const product = productMap.get(
            item.productId,
          );
          if (!product)
            throw new Error(
              `Produk tidak ditemukan`,
            );
          if (product.stock < item.quantity)
            throw new Error(
              `Stok ${product.title} tidak mencukupi`,
            );
        }

        const newOrder =
          await tx.order.create({
            data: {
              buyerId,
              sellerId,
              totalAmount,
              shippingAddress,
              shippingMethod,
              paymentMethod,
              shippingFee,
              platformFee: buyerProtectionFee,
              takeRateFee,
              buyerProtectionFee,
              insuranceFee,
              coldChainFee,
              qcInspectionFee,
              sellerNetPayout,
              requestedArrivalDate:
                requestedArrivalDate
                  ? new Date(
                      requestedArrivalDate,
                    )
                  : undefined,
              status: "PAID",
              items: {
                create: items.map(
                  (item) => ({
                    productId:
                      item.productId,
                    quantity: item.quantity,
                    priceAtTime: item.price,
                  }),
                ),
              },
            },
            include: {
              items: {
                include: { product: true },
              },
            },
          });

        // Record wallet transaction if buyer used Pranata Pay
        if (isPranataPay) {
          await tx.walletTransaction.create({
            data: {
              profileId: buyerId,
              type: "PAYMENT",
              amount: totalAmount,
              fee: 0,
              netAmount: -totalAmount,
              description: `Pembayaran Pesanan #${newOrder.id.slice(0, 8)} via Pranata Pay`,
              referenceId: newOrder.id,
              paymentMethod: "pranata_pay",
              status: "SUCCESS",
            },
          });
        }

        await Promise.all(
          items.map((item) =>
            tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            }),
          ),
        );

        return newOrder;
      },
    );

    // Add notification job to queue (non-blocking)
    notificationQueue.add({
      orderId: order.id,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
    });

    // Invalidate order, wallet and product caches selectively
    delCache(`orders_BUYER_${order.buyerId}`);
    delCache(`orders_PRODUCER_${order.sellerId}`);
    delCache(`wallet_${order.buyerId}`);
    delCacheByPrefix("products_");
    delCacheByPrefix(`seller_products_${order.sellerId}`);

    return res.status(201).json(order);
  } catch (error: any) {
    logger.error("Checkout error", error);
    if (
      error.message?.includes(
        "tidak mencukupi",
      ) ||
      error.message?.includes(
        "tidak ditemukan",
      )
    ) {
      return res
        .status(400)
        .json({ error: error.message });
    }
    return res
      .status(500)
      .json({ error: "Checkout gagal" });
  }
};

export const getOrdersByRole = async (
  req: Request,
  res: Response,
) => {
  const role = String(req.params.role);
  const id = String(req.params.id);

  if (req.user?.id !== id)
    return res
      .status(403)
      .json({ error: "Forbidden" });
  if (!["PRODUCER", "BUYER"].includes(role))
    return res
      .status(400)
      .json({ error: "Role tidak valid" });

  const cacheKey = `orders_${role}_${id}`;
  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    const orders =
      await prisma.order.findMany({
        where:
          role === "PRODUCER"
            ? { sellerId: id }
            : { buyerId: id },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                  unit: true,
                  imageUrls: true,
                  category: true,
                  grade: true,
                },
              },
            },
          },
          buyer: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
            },
          },
          seller: {
            select: {
              id: true,
              username: true,
              fullName: true,
              farmName: true,
              subscriptionTier: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    setCache(cacheKey, orders, 30);
    return res.json(orders);
  } catch (error) {
    logger.warn(
      "[getOrdersByRole] Database error, serving stale fallback:",
      error,
    );
    const stale = getStaleCache(cacheKey);
    if (stale) return res.json(stale);
    return res
      .status(500)
      .json({
        error: "Gagal mengambil pesanan",
      });
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
) => {
  const id = String(req.params.id);
  const { status } = req.body;

  const validStatuses = [
    "PENDING",
    "PAID",
    "SHIPPED",
    "COMPLETED",
    "CANCELLED",
  ];
  if (!validStatuses.includes(status))
    return res
      .status(400)
      .json({ error: "Status tidak valid" });

  try {
    const order =
      await prisma.order.findUnique({
        where: { id },
      });
    if (!order)
      return res
        .status(404)
        .json({
          error: "Pesanan tidak ditemukan",
        });
    if (req.user?.id !== order.sellerId)
      return res
        .status(403)
        .json({ error: "Forbidden" });

    const previousStatus = order.status;

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: { status },
      });

      // If completing order and it was not previously completed, credit seller's wallet
      if (status === "COMPLETED" && previousStatus !== "COMPLETED") {
        const payoutAmount = order.sellerNetPayout > 0 ? order.sellerNetPayout : (order.totalAmount - order.takeRateFee);
        
        await tx.profile.update({
          where: { id: order.sellerId },
          data: {
            walletBalance: {
              increment: payoutAmount,
            },
          },
        });

        await tx.walletTransaction.create({
          data: {
            profileId: order.sellerId,
            type: "SALE_INCOME",
            amount: order.totalAmount,
            fee: order.takeRateFee,
            netAmount: payoutAmount,
            description: `Penerimaan Hasil Penjualan #${order.id.slice(0, 8)} (Net Take Rate 3.5%)`,
            referenceId: order.id,
            status: "SUCCESS",
          },
        });
      }

      return updated;
    });

    // Invalidate caches
    delCache(
      `orders_PRODUCER_${order.sellerId}`,
    );
    delCache(
      `orders_BUYER_${order.buyerId}`,
    );
    delCache(`wallet_${order.sellerId}`);

    return res.json(updatedOrder);
  } catch (error) {
    console.error(
      "[updateOrderStatus]",
      error,
    );
    return res
      .status(500)
      .json({
        error:
          "Gagal memperbarui status pesanan",
      });
  }
};


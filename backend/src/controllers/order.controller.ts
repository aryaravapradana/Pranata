import { Request, Response } from "express";
import {
  getCache,
  setCache,
  delCache,
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
    platformFee,
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
  const totalAmount =
    itemsSubtotal +
    shippingFee +
    platformFee;

  try {
    const order = await prisma.$transaction(
      async (tx) => {
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
              platformFee,
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
            include: { product: true },
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
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    setCache(cacheKey, orders, 30);
    return res.json(orders);
  } catch (error) {
    console.error(
      "[getOrdersByRole]",
      error,
    );
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

    const updatedOrder =
      await prisma.order.update({
        where: { id },
        data: { status },
      });

    // Invalidate caches
    delCache(
      `orders_PRODUCER_${order.sellerId}`,
    );
    delCache(
      `orders_BUYER_${order.buyerId}`,
    );

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

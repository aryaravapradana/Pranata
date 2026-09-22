import { Request, Response } from "express";
import prisma from "../config/prisma";
import { z } from "zod";
import { logger } from "../utils/logger";
import { getCache, getStaleCache, setCache, delCache } from "../utils/cache";

const upgradeSchema = z.object({
  paymentMethod: z.string().default("pranata_pay"),
  plan: z.string().default("SELLER_PLUS"),
});

export const upgradeToPlus = async (req: Request, res: Response) => {
  const profileId = req.user?.id;
  if (!profileId) return res.status(401).json({ error: "Unauthorized" });

  const parse = upgradeSchema.safeParse(req.body);
  const paymentMethod = parse.success ? parse.data.paymentMethod : "pranata_pay";
  const plan = parse.success ? parse.data.plan : "SELLER_PLUS";

  const isCustomer = plan === "CUSTOMER_PLUS" || plan === "CUSTOMER";
  const SUBSCRIPTION_PRICE = isCustomer ? 39000 : 79000;
  const tierCode = isCustomer ? "CUSTOMER_PLUS" : "SELLER_PLUS";
  const planTitle = isCustomer ? "Pranata Plus Customer" : "Pranata Plus Seller";
  const isPranataPay = paymentMethod === "pranata_pay";
  const adminFee = isPranataPay ? 0 : 2500;
  const DURATION_DAYS = 30;

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        walletBalance: true,
        subscriptionTier: true,
        subscriptionExpiresAt: true,
      },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profil tidak ditemukan" });
    }

    if (isPranataPay && profile.walletBalance < SUBSCRIPTION_PRICE) {
      return res.status(400).json({
        error: `Saldo Pranata Pay tidak mencukupi untuk berlangganan (Dibutuhkan Rp ${SUBSCRIPTION_PRICE.toLocaleString("id-ID")})`,
      });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + DURATION_DAYS);

    const result = await prisma.$transaction(async (tx) => {
      // 1. If paid with wallet, decrement balance
      if (isPranataPay) {
        await tx.profile.update({
          where: { id: profileId },
          data: {
            walletBalance: {
              decrement: SUBSCRIPTION_PRICE,
            },
          },
        });
      }

      // 2. Update profile subscription tier & expiry
      const updated = await tx.profile.update({
        where: { id: profileId },
        data: {
          subscriptionTier: tierCode,
          subscriptionExpiresAt: expiresAt,
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          walletBalance: true,
          subscriptionTier: true,
          subscriptionExpiresAt: true,
        },
      });

      // 3. Create Subscription record
      await tx.subscriptionRecord.create({
        data: {
          profileId,
          plan: tierCode,
          amount: SUBSCRIPTION_PRICE,
          durationDays: DURATION_DAYS,
        },
      });

      // 4. Create Wallet transaction record
      await tx.walletTransaction.create({
        data: {
          profileId,
          type: "SUBSCRIPTION_FEE",
          amount: SUBSCRIPTION_PRICE + adminFee,
          fee: adminFee,
          netAmount: -SUBSCRIPTION_PRICE,
          description: `Langganan ${planTitle} (30 Hari) via ${paymentMethod.toUpperCase()}`,
          paymentMethod,
          status: "SUCCESS",
        },
      });

      return updated;
    });

    delCache([`profile_${profileId}`, `wallet_${profileId}`, `subscription_${profileId}`]);

    return res.status(200).json({
      message: `Selamat! Akun Anda berhasil di-upgrade ke ${planTitle}`,
      profile: result,
      tier: tierCode,
    });
  } catch (error) {
    logger.error("Error upgrading to Plus", error);
    return res.status(500).json({ error: "Gagal memproses upgrade langganan" });
  }
};

export const getSubscriptionStatus = async (req: Request, res: Response) => {
  const profileId = String(req.params.profileId || req.user?.id);
  const cacheKey = `subscription_${profileId}`;
  const cached = getCache<any>(cacheKey);
  if (cached) return res.json(cached);

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        username: true,
        subscriptionTier: true,
        subscriptionExpiresAt: true,
      },
    });

    if (!profile) return res.status(404).json({ error: "Profil tidak ditemukan" });

    const isPlusActive =
      (profile.subscriptionTier === "PLUS" ||
        profile.subscriptionTier === "CUSTOMER_PLUS" ||
        profile.subscriptionTier === "SELLER_PLUS") &&
      (!profile.subscriptionExpiresAt || new Date(profile.subscriptionExpiresAt) > new Date());

    const result = {
      profileId: profile.id,
      tier: isPlusActive ? profile.subscriptionTier : "FREE",
      expiresAt: profile.subscriptionExpiresAt,
      isPlusActive,
    };

    setCache(cacheKey, result, 60);
    return res.json(result);
  } catch (error) {
    logger.warn("Error fetching subscription status, serving stale fallback:", error);
    const stale = getStaleCache<any>(cacheKey);
    if (stale) return res.json(stale);
    return res.json({
      profileId,
      tier: "FREE",
      expiresAt: null,
      isPlusActive: false,
    });
  }
};

export const cancelSubscription = async (req: Request, res: Response) => {
  const profileId = req.user?.id;
  if (!profileId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const profile = await tx.profile.update({
        where: { id: profileId },
        data: {
          subscriptionTier: "FREE",
          subscriptionExpiresAt: null,
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          walletBalance: true,
          subscriptionTier: true,
          subscriptionExpiresAt: true,
        },
      });

      await tx.subscriptionRecord.create({
        data: {
          profileId,
          plan: "FREE",
          amount: 0,
          durationDays: 0,
        },
      });

      return profile;
    });

    delCache([`profile_${profileId}`, `wallet_${profileId}`, `subscription_${profileId}`]);

    return res.status(200).json({
      message: "Langganan Pranata Plus berhasil dibatalkan. Akun Anda kembali ke Pranata Gratis.",
      profile: updated,
    });
  } catch (error) {
    logger.error("Error cancelling subscription", error);
    return res.status(500).json({ error: "Gagal membatalkan langganan" });
  }
};

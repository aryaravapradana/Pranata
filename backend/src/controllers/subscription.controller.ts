import { Request, Response } from "express";
import prisma from "../config/prisma";
import { z } from "zod";
import { logger } from "../utils/logger";

const upgradeSchema = z.object({
  paymentMethod: z.string().default("pranata_pay"),
});

export const upgradeToPlus = async (req: Request, res: Response) => {
  const profileId = req.user?.id;
  if (!profileId) return res.status(401).json({ error: "Unauthorized" });

  const parse = upgradeSchema.safeParse(req.body);
  const paymentMethod = parse.success ? parse.data.paymentMethod : "pranata_pay";

  const SUBSCRIPTION_PRICE = 79000;
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

    if (paymentMethod === "pranata_pay" && profile.walletBalance < SUBSCRIPTION_PRICE) {
      return res.status(400).json({
        error: "Saldo Pranata Pay tidak mencukupi untuk berlangganan (Dibutuhkan Rp 79.000)",
      });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + DURATION_DAYS);

    const result = await prisma.$transaction(async (tx) => {
      // 1. If paid with wallet, decrement balance
      if (paymentMethod === "pranata_pay") {
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
          subscriptionTier: "PLUS",
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
          plan: "PLUS",
          amount: SUBSCRIPTION_PRICE,
          durationDays: DURATION_DAYS,
        },
      });

      // 4. Create Wallet transaction record
      await tx.walletTransaction.create({
        data: {
          profileId,
          type: "SUBSCRIPTION_FEE",
          amount: SUBSCRIPTION_PRICE,
          fee: 0,
          netAmount: -SUBSCRIPTION_PRICE,
          description: `Langganan Pranata Plus (30 Hari) via ${paymentMethod.toUpperCase()}`,
          paymentMethod,
          status: "SUCCESS",
        },
      });

      return updated;
    });

    return res.status(200).json({
      message: "Selamat! Akun Anda berhasil di-upgrade ke Pranata Plus",
      profile: result,
    });
  } catch (error) {
    logger.error("Error upgrading to Plus", error);
    return res.status(500).json({ error: "Gagal memproses upgrade langganan" });
  }
};

export const getSubscriptionStatus = async (req: Request, res: Response) => {
  const profileId = String(req.params.profileId || req.user?.id);

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
      profile.subscriptionTier === "PLUS" &&
      (!profile.subscriptionExpiresAt || new Date(profile.subscriptionExpiresAt) > new Date());

    return res.json({
      profileId: profile.id,
      tier: isPlusActive ? "PLUS" : "FREE",
      expiresAt: profile.subscriptionExpiresAt,
      isPlusActive,
    });
  } catch (error) {
    logger.error("Error fetching subscription status", error);
    return res.status(500).json({ error: "Gagal mengambil status langganan" });
  }
};

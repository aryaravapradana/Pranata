import { Request, Response } from "express";
import prisma from "../config/prisma";
import { z } from "zod";
import { logger } from "../utils/logger";

const topUpSchema = z.object({
  amount: z.number().min(10000, "Minimal top-up adalah Rp 10.000"),
  paymentMethod: z.string().default("bca_va"),
});

const withdrawSchema = z.object({
  amount: z.number().min(20000, "Minimal penarikan adalah Rp 20.000"),
  bankName: z.string().min(2, "Nama bank wajib diisi"),
  accountNumber: z.string().min(5, "Nomor rekening wajib diisi"),
  accountHolder: z.string().min(2, "Nama pemilik rekening wajib diisi"),
});

export const getWallet = async (req: Request, res: Response) => {
  const profileId = String(req.params.profileId || req.user?.id);

  if (req.user?.id !== profileId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        username: true,
        fullName: true,
        walletBalance: true,
        subscriptionTier: true,
        subscriptionExpiresAt: true,
      },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profil tidak ditemukan" });
    }

    const transactions = await prisma.walletTransaction.findMany({
      where: { profileId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return res.json({
      profileId: profile.id,
      walletBalance: profile.walletBalance,
      subscriptionTier: profile.subscriptionTier,
      subscriptionExpiresAt: profile.subscriptionExpiresAt,
      transactions,
    });
  } catch (error) {
    logger.error("Error getting wallet", error);
    return res.status(500).json({ error: "Gagal mengambil data dompet" });
  }
};

export const topUpWallet = async (req: Request, res: Response) => {
  const parse = topUpSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.issues[0].message });
  }

  const { amount, paymentMethod } = parse.data;
  const profileId = req.user?.id;
  if (!profileId) return res.status(401).json({ error: "Unauthorized" });

  const TOPUP_FEE = 1500;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const updatedProfile = await tx.profile.update({
        where: { id: profileId },
        data: {
          walletBalance: {
            increment: amount,
          },
        },
        select: {
          id: true,
          walletBalance: true,
          subscriptionTier: true,
        },
      });

      const txRecord = await tx.walletTransaction.create({
        data: {
          profileId,
          type: "TOPUP",
          amount: amount + TOPUP_FEE,
          fee: TOPUP_FEE,
          netAmount: amount,
          description: `Isi Ulang Saldo Pranata Pay (${paymentMethod.toUpperCase()})`,
          paymentMethod,
          status: "SUCCESS",
        },
      });

      return { updatedProfile, txRecord };
    });

    return res.status(201).json({
      message: "Top-up saldo berhasil",
      walletBalance: result.updatedProfile.walletBalance,
      transaction: result.txRecord,
    });
  } catch (error) {
    logger.error("Error topping up wallet", error);
    return res.status(500).json({ error: "Gagal memproses top-up" });
  }
};

export const withdrawWallet = async (req: Request, res: Response) => {
  const parse = withdrawSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.issues[0].message });
  }

  const { amount, bankName, accountNumber, accountHolder } = parse.data;
  const profileId = req.user?.id;
  if (!profileId) return res.status(401).json({ error: "Unauthorized" });

  const WITHDRAWAL_FEE = 2500;
  const totalDeduction = amount; // User withdraws amount, receives amount - WITHDRAWAL_FEE or deduction includes fee

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      select: { walletBalance: true },
    });

    if (!profile || profile.walletBalance < totalDeduction) {
      return res.status(400).json({ error: "Saldo tidak mencukupi untuk penarikan" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedProfile = await tx.profile.update({
        where: { id: profileId },
        data: {
          walletBalance: {
            decrement: totalDeduction,
          },
        },
        select: {
          id: true,
          walletBalance: true,
        },
      });

      const txRecord = await tx.walletTransaction.create({
        data: {
          profileId,
          type: "WITHDRAWAL",
          amount: totalDeduction,
          fee: WITHDRAWAL_FEE,
          netAmount: totalDeduction - WITHDRAWAL_FEE,
          description: `Tarik Saldo ke ${bankName.toUpperCase()} a/n ${accountHolder} (${accountNumber})`,
          paymentMethod: bankName,
          status: "SUCCESS",
        },
      });

      return { updatedProfile, txRecord };
    });

    return res.status(200).json({
      message: "Penarikan saldo berhasil diproses",
      walletBalance: result.updatedProfile.walletBalance,
      transaction: result.txRecord,
    });
  } catch (error) {
    logger.error("Error withdrawing wallet", error);
    return res.status(500).json({ error: "Gagal memproses penarikan saldo" });
  }
};

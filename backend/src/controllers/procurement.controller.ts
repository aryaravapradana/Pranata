import { Request, Response } from "express";
import prisma from "../config/prisma";
import { z } from "zod";
import { logger } from "../utils/logger";
import { getCache, getStaleCache, setCache } from "../utils/cache";

export const FALLBACK_PROCUREMENT_REQUESTS = [
  {
    id: "proc-1",
    buyerName: "Resto Padang Sederhana Sleman",
    buyerContact: "0812-3456-7890 (Pak Rahmat)",
    category: "Ayam Broiler Karkas",
    quantity: "150 ekor / minggu (bobot 1.2 kg)",
    targetPrice: 34000,
    location: "Sleman, DI Yogyakarta",
    description: "Dibutuhkan pasokan rutin ayam karkas segar bersertifikat halal setiap hari Selasa & Jumat.",
    status: "OPEN",
    createdAt: new Date().toISOString(),
  },
  {
    id: "proc-2",
    buyerName: "Hotel Grand Merapi Yogyakarta",
    buyerContact: "0813-9876-5432 (Chef Adrian)",
    category: "Telur Ayam Negeri Grade A",
    quantity: "200 kg / minggu",
    targetPrice: 27500,
    location: "Kota Yogyakarta",
    description: "Kebutuhan breakfast hotel, telur bersih tanpa noda kotoran, grade A terverifikasi.",
    status: "OPEN",
    createdAt: new Date().toISOString(),
  },
  {
    id: "proc-3",
    buyerName: "Katering Berkah Mandiri",
    buyerContact: "0877-1122-3344 (Ibu Dewi)",
    category: "Daging Sapi Segar (Topside)",
    quantity: "50 kg / 2 minggu",
    targetPrice: 125000,
    location: "Bantul, DI Yogyakarta",
    description: "Daging sapi lokal segar untuk katering pesta pernikahan.",
    status: "OPEN",
    createdAt: new Date().toISOString(),
  },
];

const createProcurementSchema = z.object({
  buyerName: z.string().min(2, "Nama pembeli wajib diisi"),
  buyerContact: z.string().min(5, "Kontak pembeli wajib diisi"),
  category: z.string().min(2, "Kategori produk wajib diisi"),
  quantity: z.string().min(2, "Kuantitas pasokan wajib diisi"),
  targetPrice: z.number().optional(),
  location: z.string().min(2, "Lokasi pengiriman wajib diisi"),
  description: z.string().optional(),
});

export const getProcurementRequests = async (req: Request, res: Response) => {
  const cacheKey = "procurement_requests";
  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    const requests = await prisma.procurementRequest.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // If no data exists in DB, seed a few realistic B2B requests for the demo
    if (requests.length === 0) {
      try {
        await prisma.procurementRequest.createMany({
          data: FALLBACK_PROCUREMENT_REQUESTS.map(({ id, createdAt, ...rest }) => ({
            ...rest,
            status: "OPEN",
          })),
        });
        const freshRequests = await prisma.procurementRequest.findMany({
          where: { status: "OPEN" },
          orderBy: { createdAt: "desc" },
        });
        setCache(cacheKey, freshRequests, 120);
        return res.json(freshRequests);
      } catch {
        setCache(cacheKey, FALLBACK_PROCUREMENT_REQUESTS, 120);
        return res.json(FALLBACK_PROCUREMENT_REQUESTS);
      }
    }

    setCache(cacheKey, requests, 120);
    return res.json(requests);
  } catch (error) {
    logger.warn("[getProcurementRequests] DB unreachable, serving resilient fallback:", error);
    const stale = getStaleCache(cacheKey);
    if (stale) return res.json(stale);
    return res.json(FALLBACK_PROCUREMENT_REQUESTS);
  }
};

export const createProcurementRequest = async (req: Request, res: Response) => {
  const parse = createProcurementSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.issues[0].message });
  }

  try {
    const created = await prisma.procurementRequest.create({
      data: {
        ...parse.data,
        status: "OPEN",
      },
    });

    return res.status(201).json(created);
  } catch (error) {
    logger.error("Error creating procurement request", error);
    return res.status(500).json({ error: "Gagal membuat permintaan pasokan" });
  }
};

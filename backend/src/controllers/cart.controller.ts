import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { z } from 'zod';

const updateCartSchema = z.object({
  productId: z.string().uuid('productId tidak valid'),
  quantity: z.number().int().min(1, 'Quantity minimal 1'),
});

const getBuyerId = (req: Request): string => String(req.params.buyerId);
const getProductId = (req: Request): string => String(req.params.productId);

export const getCart = async (req: Request, res: Response) => {
  const buyerId = getBuyerId(req);
  if (req.user?.id !== buyerId) return res.status(403).json({ error: 'Forbidden' });

  try {
    const cart = await prisma.cartItem.findMany({
      where: { buyerId },
      include: { product: true }
    });
    return res.json(cart);
  } catch (error) {
    console.error('[getCart]', error);
    return res.status(500).json({ error: 'Gagal mengambil keranjang' });
  }
};

export const updateCartItem = async (req: Request, res: Response) => {
  const buyerId = getBuyerId(req);
  if (req.user?.id !== buyerId) return res.status(403).json({ error: 'Forbidden' });

  const parse = updateCartSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.issues[0].message });

  const { productId, quantity } = parse.data;

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Produk tidak ditemukan' });
    if (product.sellerId === buyerId) {
      return res.status(400).json({ error: 'Anda tidak dapat membeli produk Anda sendiri' });
    }

    const cartItem = await prisma.cartItem.upsert({
      where: { buyerId_productId: { buyerId, productId } },
      update: { quantity },
      create: { buyerId, productId, quantity }
    });
    return res.json(cartItem);
  } catch (error) {
    console.error('[updateCartItem]', error);
    return res.status(500).json({ error: 'Gagal memperbarui keranjang' });
  }
};

export const removeCartItem = async (req: Request, res: Response) => {
  const buyerId = getBuyerId(req);
  const productId = getProductId(req);
  if (req.user?.id !== buyerId) return res.status(403).json({ error: 'Forbidden' });

  try {
    await prisma.cartItem.delete({ where: { buyerId_productId: { buyerId, productId } } });
    return res.json({ success: true });
  } catch (error) {
    console.error('[removeCartItem]', error);
    return res.status(500).json({ error: 'Gagal menghapus item' });
  }
};

export const clearCart = async (req: Request, res: Response) => {
  const buyerId = getBuyerId(req);
  if (req.user?.id !== buyerId) return res.status(403).json({ error: 'Forbidden' });

  try {
    await prisma.cartItem.deleteMany({ where: { buyerId } });
    return res.json({ success: true });
  } catch (error) {
    console.error('[clearCart]', error);
    return res.status(500).json({ error: 'Gagal membersihkan keranjang' });
  }
};

import { Request, Response } from 'express';
import prisma from '../config/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const upgradeToSeller = async (req: Request, res: Response) => {
  const { userId, farmName, location, contact } = req.body;
  const targetId = userId || req.user?.id;
  if (!targetId) {
    return res.status(400).json({ error: 'User ID wajib diisi' });
  }
  if (!farmName || !farmName.trim()) {
    return res.status(400).json({ error: 'Nama peternakan / toko wajib diisi' });
  }

  try {
    const updated = await prisma.profile.update({
      where: { id: targetId },
      data: {
        role: 'PRODUCER',
        farmName: farmName.trim(),
        location: location ? location.trim() : null,
        contact: contact ? contact.trim() : null,
      }
    });

    const JWT_SECRET = process.env.JWT_SECRET || 'pranata-secret-key-2026-jwt';
    const token = jwt.sign(
      { id: updated.id, role: updated.role, username: updated.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeProfile } = updated;
    return res.json({ ...safeProfile, token });
  } catch (error: any) {
    console.error('[upgradeToSeller error]:', error);
    return res.status(500).json({ error: 'Gagal melakukan upgrade ke Penjual', details: error?.message });
  }
};

export const checkUsername = async (req: Request, res: Response) => {
  const { username } = req.query;
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username is required' });
  }
  
  try {
    const cleanUsername = username.trim().toLowerCase();
    const existing = await prisma.profile.findFirst({ 
      where: { 
        username: { equals: cleanUsername } 
      } 
    });
    if (existing) {
      return res.json({ available: false });
    }
    return res.json({ available: true });
  } catch (error: any) {
    console.error('[checkUsername Error]:', error);
    return res.status(500).json({ error: 'Gagal mengecek username', details: error?.message || String(error) });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const profile = await prisma.profile.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        fullName: true,
        farmName: true,
        location: true,
        contact: true,
        avatarUrl: true,
        bannerUrl: true,
        livestockTypes: true,
        createdAt: true,
        updatedAt: true
      }
    });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { username, fullName, farmName, location, contact, avatarUrl, bannerUrl, currentPassword, newPassword } = req.body;

  try {
    if (username) {
      const existing = await prisma.profile.findFirst({
        where: { username: username.toLowerCase(), NOT: { id } }
      });
      if (existing) {
        return res.status(409).json({ error: 'Username sudah dipakai oleh akun lain.' });
      }
    }

    if (newPassword) {
      const profile = await prisma.profile.findUnique({ where: { id } });
      if (!profile) return res.status(404).json({ error: 'User not found' });
      
      const isMatch = await bcrypt.compare(currentPassword, profile.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Password saat ini tidak sesuai.' });
      }
    }

    const updateData: Record<string, any> = {};
    if (username !== undefined)  updateData.username  = username.toLowerCase();
    if (fullName !== undefined)  updateData.fullName  = fullName;
    if (farmName !== undefined)  updateData.farmName  = farmName;
    if (location !== undefined)  updateData.location  = location;
    if (contact  !== undefined)  updateData.contact   = contact;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl;
    
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    const updated = await prisma.profile.update({ where: { id }, data: updateData });

    const { password: _, ...safeProfile } = updated;
    res.json(safeProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const getSellerEvents = async (req: Request, res: Response) => {
  try {
    const sellerId = req.params.sellerId as string;
    const events = await prisma.sellerEvent.findMany({
      where: { sellerId },
      orderBy: { eventDate: 'asc' }
    });
    res.json(events);
  } catch (error: any) {
    console.error('getSellerEvents error:', error?.code, error?.message);
    // Return empty array so frontend does not crash
    res.json([]);
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, description, eventDate, type, sellerId } = req.body;
    const event = await prisma.sellerEvent.create({
      data: { title, description, eventDate: new Date(eventDate), type, sellerId }
    });
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { title, description, eventDate, type } = req.body;
    const event = await prisma.sellerEvent.update({
      where: { id },
      data: { title, description, eventDate: new Date(eventDate), type }
    });
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.sellerEvent.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

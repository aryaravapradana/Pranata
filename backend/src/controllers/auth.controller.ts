import { Request, Response } from 'express';
import prisma from '../config/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'veternity-secret-key-2026-jwt';
const SALT_ROUNDS = 10;

const registerSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter').max(30).regex(/^[a-z0-9_]+$/, 'Username hanya boleh huruf kecil, angka, dan underscore'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  fullName: z.string().min(2).optional(),
  role: z.enum(['PRODUCER', 'BUYER']).default('BUYER'),
  livestockTypes: z.array(z.string()).default([]),
});

const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

const signToken = (profile: { id: string; role: string; username: string }) =>
  jwt.sign({ id: profile.id, role: profile.role, username: profile.username }, JWT_SECRET, { expiresIn: '7d' });

export const register = async (req: Request, res: Response) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.issues[0].message });
  }
  const { username, password, fullName, role, livestockTypes } = parse.data;

  try {
    const existing = await prisma.profile.findUnique({ where: { username } });
    if (existing) return res.status(400).json({ error: 'Username sudah digunakan' });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const profile = await prisma.profile.create({
      data: { username, password: hashedPassword, fullName, role, livestockTypes }
    });

    const token = signToken(profile);
    const { password: _, ...safeProfile } = profile;
    return res.status(201).json({ ...safeProfile, token });
  } catch (error: any) {
    console.error('[register error]:', error);
    return res.status(500).json({ error: 'Gagal membuat akun', details: error?.message || String(error) });
  }
};

export const login = async (req: Request, res: Response) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.issues[0].message });
  }
  const { username, password } = parse.data;

  try {
    const profile = await prisma.profile.findUnique({ where: { username } });
    if (!profile) return res.status(401).json({ error: 'Username atau password salah' });

    const isMatch = await bcrypt.compare(password, profile.password);
    if (!isMatch) return res.status(401).json({ error: 'Username atau password salah' });

    const token = signToken(profile);
    const { password: _, ...safeProfile } = profile;
    return res.json({ ...safeProfile, token });
  } catch (error) {
    console.error('[login]', error);
    return res.status(500).json({ error: 'Login gagal' });
  }
};

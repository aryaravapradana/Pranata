import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import zlib from 'zlib';
import routes from './routes';
import { verifyToken } from './middlewares/auth.middleware';
import { globalErrorHandler } from './middlewares/error.middleware';
import { getPrices } from './controllers/hub.controller';
import { getSellerEvents, createEvent, updateEvent, deleteEvent } from './controllers/profile.controller';

const app = express();
app.set('trust proxy', 1);

// ── Bulletproof CORS & Preflight OPTIONS Handler ──
app.use((req: Request, res: Response, next) => {
  const origin = req.headers.origin || 'https://veternity-frontend.vercel.app';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-Token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// ── Security Headers & Compression ──
app.use(helmet({ hidePoweredBy: true }));
app.use(compression({
  level: zlib.constants.Z_BEST_SPEED,
  threshold: 1024,
}));

// ── Body Parser ──
app.use(express.json({ limit: '5mb' }));

// ── Global Rate Limiter ──
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak request, coba lagi dalam 15 menit.' },
});
app.use(globalLimiter);

// ── Strict Rate Limiter for Auth endpoints (prevents brute-force) ──
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Terlalu banyak percobaan login, coba lagi dalam 15 menit.' },
});

// ── Status Endpoint (public) ──
app.get('/api/status', (req: Request, res: Response) => {
  res.json({ status: 'OK', service: 'Pranata API', version: '2.0.0' });
});

// ── Protected Standalone Routes ──
app.get('/api/prices', verifyToken, getPrices);
app.get('/api/events/:sellerId', verifyToken, getSellerEvents);
app.post('/api/events', verifyToken, createEvent);
app.put('/api/events/:id', verifyToken, updateEvent);
app.delete('/api/events/:id', verifyToken, deleteEvent);

// ── Main Router (auth rate-limited at profile level) ──
app.use('/api', routes);

// ── Global Error Handler (must be last) ──
app.use(globalErrorHandler);

export default app;

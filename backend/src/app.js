import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import boardRoutes from './routes/boards.js';
import listRoutes from './routes/lists.js';
import cardRoutes from './routes/cards.js';
// ✅ fix typo: 'activites.js' → 'activities.js'
import activityRoutes from './routes/activites.js';

const app = express();

// --- CORS ---
const origins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    // Allow server-to-server/no-origin (curl, Postman), and restrict browsers
    if (!origin) return cb(null, true);
    if (!origins.length) return cb(new Error('CORS blocked: no origins configured'));
    return cb(origins.includes(origin) ? null : new Error('CORS blocked'), true);
  },
  credentials: true,
}));

// --- Security headers ---
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.disable('x-powered-by');

// --- Body parsing (with sane limits) ---
app.use(express.json({ limit: '1mb' }));

// Handle bad JSON early (Express throws SyntaxError from express.json)
app.use((err, _req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  next(err);
});

// --- Logging ---
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// --- Health & root ---
app.get('/', (_req, res) => res.json({ ok: true, name: 'Trello Clone API' }));
app.get('/healthz', (_req, res) => res.status(200).send('ok'));

// --- Rate limit (light touch: mainly auth & writes) ---
const writeLimiter = rateLimit({ windowMs: 60_000, max: 300 });
app.use('/api/auth', rateLimit({ windowMs: 60_000, max: 60 }));

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/boards', writeLimiter, boardRoutes);
app.use('/api/lists', writeLimiter, listRoutes);
app.use('/api/cards', writeLimiter, cardRoutes);
app.use('/api/activities', writeLimiter, activityRoutes);

// --- 404 ---
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// --- Error handler ---
app.use((err, _req, res, _next) => {
  // Avoid leaking internals in prod
  const code = err.status || 500;
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
    return res.status(code).json({ error: err.message || 'Internal error' });
  }
  return res.status(code).json({ error: code === 500 ? 'Internal error' : err.message });
});

export default app;

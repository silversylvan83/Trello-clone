import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import boardRoutes from './routes/boards.js';
import listRoutes from './routes/lists.js';
import cardRoutes from './routes/cards.js';
import activityRoutes from './routes/activites.js';

const app = express();

// If behind a proxy (Docker/NGINX), uncomment:
// app.set('trust proxy', 1);

// --- CORS ---
const allowList = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const isDev = process.env.NODE_ENV !== 'production';

// Allow common localhost origins automatically in dev
if (isDev && allowList.length === 0) {
  allowList.push('http://localhost:5173', 'http://127.0.0.1:5173');
}

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Max-Age', '600');
    return res.sendStatus(204);
  }
  next();
});

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // curl/Postman/server-to-server
    if (allowList.includes(origin)) return cb(null, true);
    if (isDev && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/i.test(origin)) return cb(null, true);
    // Reject without throwing an error (avoids noisy stack traces)
    return cb(null, false);
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  maxAge: 600,
};

app.use(cors(corsOptions));
// Make sure preflights succeed
// Handle all CORS preflights without using a route pattern (no path-to-regexp)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Max-Age', '600');
    return res.sendStatus(204);
  }
  next();
});

// --- Security headers ---
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.disable('x-powered-by');

// --- Body parsing ---
app.use(express.json({ limit: '1mb' }));

// JSON parse error handler (must be before morgan/routes)
app.use((err, _req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  next(err);
});

// --- Logging ---
app.use(morgan(isDev ? 'dev' : 'combined'));

// --- Health & root ---
app.get('/', (_req, res) => res.json({ ok: true, name: 'Trello Clone API' }));
app.get('/healthz', (_req, res) => res.status(200).send('ok'));

// --- Rate limit (auth + writes) ---
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
  const code = err.status || 500;
  if (isDev) {
    console.error(err);
    return res.status(code).json({ error: err.message || 'Internal error' });
  }
  return res.status(code).json({ error: code === 500 ? 'Internal error' : err.message });
});

export default app;

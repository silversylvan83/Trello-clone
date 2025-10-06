import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/auth.js';
import boardRoutes from './routes/boards.js';
import listRoutes from './routes/lists.js';
import cardRoutes from './routes/cards.js';
import activityRoutes from './routes/activites.js';

const app = express();
const origins = (process.env.CORS_ORIGINS || '').split(',').map(s=>s.trim()).filter(Boolean);
app.use(cors({ origin: origins.length ? origins : true }));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV==='production'?'combined':'dev'));

app.get('/', (_req, res) => res.json({ ok: true, name: 'Trello Clone API' }));
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/activities', activityRoutes);

app.use((req,res)=>res.status(404).json({error:'Not found'}));
app.use((err,_req,res,_next)=>{ console.error(err); res.status(500).json({error: err.message}); });

export default app;

import { Router } from 'express';
import mongoose from 'mongoose';
import Activity from '../models/Activity.js';
import { auth } from '../middleware/auth.js';
import Board from '../models/Board.js';

const router = Router();

// Resolve a board identifier that might be an ObjectId or a slug.
// Returns the resolved ObjectId (as a string) or null if not found/invalid.
async function resolveBoardId(idOrSlug) {
  if (!idOrSlug) return null;
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) return idOrSlug;
  const board = await Board.findOne({ slug: idOrSlug }).select('_id').lean();
  return board?._id?.toString() || null;
}

// Parse and clamp the "limit" query param.
function parseLimit(value, fallback = 50, max = 200) {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n) || n <= 0) return fallback;
  return Math.min(n, max);
}

// GET /api/activities?boardId=<idOrSlug>&limit=50
router.get('/', auth(false), async (req, res, next) => {
  try {
    const { boardId, limit } = req.query;
    if (!boardId) return res.status(400).json({ error: 'Missing boardId' });

    const resolvedId = await resolveBoardId(boardId);
    if (!resolvedId) return res.status(404).json({ error: 'Board not found' });

    const size = parseLimit(limit);
    const activities = await Activity.find({ boardId: resolvedId })
      .sort({ createdAt: -1 })
      .limit(size)
      .lean();

    res.json(activities);
  } catch (err) {
    next(err);
  }
});

// POST /api/activities
// body: { boardId: <idOrSlug>, type: <string>, meta?: <object> }
router.post('/', auth(), async (req, res, next) => {
  try {
    const { boardId, type, meta } = req.body;
    if (!boardId || !type) {
      return res
        .status(400)
        .json({ error: 'boardId and type are required' });
    }

    const resolvedId = await resolveBoardId(boardId);
    if (!resolvedId) return res.status(404).json({ error: 'Board not found' });

    const actor = req.user
      ? { id: req.user._id, name: req.user.name }
      : { id: 'system', name: 'System' };

    const act = await Activity.create({
      boardId: resolvedId,
      type,
      by: actor,
      meta: typeof meta === 'object' && meta !== null ? meta : {},
    });

    // Broadcast new activity to the board room (socket.io)
    try {
      global.__boardEmit?.(resolvedId, 'activity:created', act);
    } catch {
      // Non-fatal: broadcasting shouldn't break the request
    }

    res.status(201).json(act);
  } catch (err) {
    next(err);
  }
});

export default router;

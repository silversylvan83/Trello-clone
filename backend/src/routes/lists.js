import { Router } from 'express';
import mongoose from 'mongoose';
import List from '../models/List.js';
import { auth } from '../middleware/auth.js';
import Board from '../models/Board.js';

const router = Router();

// Helper: resolve _id or slug -> ObjectId (as string)
async function resolveBoardId(idOrSlug) {
  if (!idOrSlug) return null;
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) return idOrSlug;
  const board = await Board.findOne({ slug: idOrSlug }).select('_id').lean();
  return board?._id?.toString() || null;
}

// Helper: tiny assert for ObjectId params
function assertObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/lists?boardId=<idOrSlug>
router.get('/', auth(false), async (req, res, next) => {
  try {
    const { boardId } = req.query;
    if (!boardId) return res.status(400).json({ error: 'boardId is required' });

    const resolved = await resolveBoardId(boardId);
    if (!resolved) return res.status(404).json({ error: 'Board not found' });

    const items = await List.find({ boardId: resolved })
      .sort({ order: 1 })
      .lean();

    res.json(items);
  } catch (e) {
    next(e);
  }
});

// POST /api/lists  { boardId: <idOrSlug>, title: string }
router.post('/', auth(), async (req, res, next) => {
  try {
    const { boardId, title } = req.body;
    if (!boardId || !title?.trim())
      return res.status(400).json({ error: 'boardId and title are required' });

    const resolved = await resolveBoardId(boardId);
    if (!resolved) return res.status(404).json({ error: 'Board not found' });

    // Find current max order (lean + select for speed)
    const last = await List.findOne({ boardId: resolved })
      .sort({ order: -1 })
      .select('order')
      .lean();

    const order = last ? (Number(last.order) || 0) + 1 : 1;

    const list = await List.create({
      boardId: resolved,
      title: title.trim(),
      order,
    });

    // Fire-and-forget: broadcasting shouldn't break the request
    try { global.__boardEmit?.(resolved, 'list:created', list); } catch {}

    res.status(201).json(list);
  } catch (e) {
    next(e);
  }
});

// PATCH /api/lists/:id
router.patch('/:id', auth(), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!assertObjectId(id)) return res.status(400).json({ error: 'Invalid list id' });

    // Optional: forbid changing boardId via PATCH (safer). If you do want to allow it,
    // resolve it first like above and replace req.body.boardId with the resolved value.
    if (typeof req.body.boardId !== 'undefined') delete req.body.boardId;

    const update = {};
    if (typeof req.body.title === 'string') update.title = req.body.title.trim();
    if (typeof req.body.order !== 'undefined') update.order = req.body.order;

    const list = await List.findByIdAndUpdate(
      id,
      update,
      { new: true, runValidators: true }
    );

    if (!list) return res.status(404).json({ error: 'List not found' });

    try { global.__boardEmit?.(list.boardId.toString(), 'list:updated', list); } catch {}

    res.json(list);
  } catch (e) {
    next(e);
  }
});

export default router;

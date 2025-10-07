import { Router } from 'express';
import mongoose from 'mongoose';
import Card from '../models/Card.js';
import List from '../models/List.js';
import Board from '../models/Board.js';
import { auth } from '../middleware/auth.js';

const router = Router();

function isObjectId(v) {
  return mongoose.Types.ObjectId.isValid(v);
}

// Resolve a board identifier that might be an ObjectId or a slug.
// Returns ObjectId string or null if not found.
async function resolveBoardId(idOrSlug) {
  if (!idOrSlug) return null;
  if (isObjectId(idOrSlug)) return idOrSlug;
  const board = await Board.findOne({ slug: idOrSlug }).select('_id').lean();
  return board?._id?.toString() || null;
}

// ---------- list cards by board ----------
router.get('/', auth(false), async (req, res, next) => {
  try {
    const { boardId } = req.query;
    if (!boardId) return res.status(400).json({ error: 'boardId is required' });

    const resolved = await resolveBoardId(boardId);
    if (!resolved) return res.status(404).json({ error: 'Board not found' });

    const items = await Card.find({ boardId: resolved })
      .sort({ order: 1 })
      .lean();

    res.json(items);
  } catch (e) {
    next(e);
  }
});

// ---------- create card ----------
router.post('/', auth(), async (req, res, next) => {
  try {
    const { boardId, listId, title } = req.body;
    if (!boardId || !listId || !title?.trim())
      return res.status(400).json({ error: 'boardId, listId, and title are required' });

    const resolvedBoardId = await resolveBoardId(boardId);
    if (!resolvedBoardId) return res.status(404).json({ error: 'Board not found' });

    if (!isObjectId(listId)) return res.status(400).json({ error: 'Invalid listId' });

    // Ensure list belongs to the same board
    const list = await List.findOne({ _id: listId, boardId: resolvedBoardId }).select('_id').lean();
    if (!list) return res.status(404).json({ error: 'List not found on this board' });

    // Find current max order within the list
    const last = await Card.findOne({ boardId: resolvedBoardId, listId })
      .sort({ order: -1 })
      .select('order')
      .lean();
    const order = last ? (Number(last.order) || 0) + 1 : 1;

    const card = await Card.create({
      boardId: resolvedBoardId,
      listId,
      title: title.trim(),
      order,
    });

    try { global.__boardEmit?.(resolvedBoardId, 'card:created', card); } catch {}

    res.status(201).json(card);
  } catch (e) {
    next(e);
  }
});

// ---------- move card (reorder / cross-list) ----------
router.patch('/:id/move', auth(), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { toListId, toOrder } = req.body; // toOrder can be float or int
    if (!isObjectId(id)) return res.status(400).json({ error: 'Invalid card id' });
    if (!isObjectId(toListId)) return res.status(400).json({ error: 'Invalid toListId' });

    const targetOrder = Number(toOrder);
    if (!Number.isFinite(targetOrder) || targetOrder < 0)
      return res.status(400).json({ error: 'toOrder must be a non-negative number' });

    const card = await Card.findById(id);
    if (!card) return res.status(404).json({ error: 'Card not found' });

    // Ensure destination list exists and is on the same board
    const destList = await List.findOne({ _id: toListId }).select('boardId').lean();
    if (!destList) return res.status(404).json({ error: 'Destination list not found' });
    if (destList.boardId.toString() !== card.boardId.toString())
      return res.status(400).json({ error: 'Cannot move card across boards' });

    // If list changes or order changes, adjust neighbors.
    const sameList = toListId.toString() === card.listId.toString();
    const ops = [];

    if (sameList) {
      // Reorder within the same list
      if (targetOrder === card.order) {
        return res.json({ ok: true, card }); // no-op
      }
      if (targetOrder > card.order) {
        // shift down: decrement those between (card.order, targetOrder]
        ops.push({
          updateMany: {
            filter: {
              boardId: card.boardId,
              listId: card.listId,
              order: { $gt: card.order, $lte: targetOrder },
              _id: { $ne: card._id },
            },
            update: { $inc: { order: -1 } },
          },
        });
      } else {
        // shift up: increment those between [targetOrder, card.order)
        ops.push({
          updateMany: {
            filter: {
              boardId: card.boardId,
              listId: card.listId,
              order: { $gte: targetOrder, $lt: card.order },
              _id: { $ne: card._id },
            },
            update: { $inc: { order: 1 } },
          },
        });
      }
      // Finally set this card’s order
      ops.push({
        updateOne: {
          filter: { _id: card._id },
          update: { $set: { order: targetOrder } },
        },
      });
    } else {
      // Cross-list move
      // 1) Close the gap in the source list
      ops.push({
        updateMany: {
          filter: {
            boardId: card.boardId,
            listId: card.listId,
            order: { $gt: card.order },
          },
          update: { $inc: { order: -1 } },
        },
      });
      // 2) Open a slot in the destination list
      ops.push({
        updateMany: {
          filter: {
            boardId: card.boardId,
            listId: toListId,
            order: { $gte: targetOrder },
          },
          update: { $inc: { order: 1 } },
        },
      });
      // 3) Move the card
      ops.push({
        updateOne: {
          filter: { _id: card._id },
          update: { $set: { listId: toListId, order: targetOrder } },
        },
      });
    }

    await Card.bulkWrite(ops);

    const updated = await Card.findById(card._id).lean();
    const payload = { _id: updated._id, listId: updated.listId, order: updated.order };
    try { global.__boardEmit?.(updated.boardId, 'card:moved', payload); } catch {}

    res.json({ ok: true, card: updated });
  } catch (e) {
    next(e);
  }
});

export default router;

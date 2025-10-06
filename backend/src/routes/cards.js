import { Router } from 'express';
import Card from '../models/Card.js';
import List from '../models/List.js';
import { auth } from '../middleware/auth.js';
const router = Router();

// list cards by board
router.get('/', auth(false), async (req,res,next)=>{ try{
  const { boardId } = req.query;
  const items = await Card.find({ boardId }).sort({ order:1 });
  res.json(items);
}catch(e){next(e)}});

// create card
router.post('/', auth(), async (req,res,next)=>{ try{
  const { boardId, listId, title } = req.body;
  const max = await Card.find({ boardId, listId }).sort({ order:-1 }).limit(1);
  const order = max[0]?.order ? max[0].order + 1 : 1;
  const card = await Card.create({ boardId, listId, title, order });
  global.__boardEmit?.(boardId, 'card:created', card);
  res.status(201).json(card);
}catch(e){next(e)}});

// move card (reorder / cross-list)
router.patch('/:id/move', auth(), async (req,res,next)=>{ try{
  const { toListId, toOrder } = req.body; // toOrder = float or int
  const card = await Card.findById(req.params.id);
  if (!card) return res.status(404).json({ error: 'Not found' });

  // Compact reindex strategy: bump others >= toOrder
  await Card.updateMany(
    { boardId: card.boardId, listId: toListId, order: { $gte: toOrder } },
    { $inc: { order: 1 } }
  );

  card.listId = toListId;
  card.order  = toOrder;
  await card.save();

  const payload = { _id: card._id, listId: card.listId, order: card.order };
  global.__boardEmit?.(card.boardId, 'card:moved', payload);
  res.json({ ok: true, card });
}catch(e){next(e)}});

export default router;

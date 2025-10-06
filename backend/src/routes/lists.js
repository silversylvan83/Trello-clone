import { Router } from 'express';
import List from '../models/List.js';
import { auth } from '../middleware/auth.js';
const router = Router();

router.get('/', auth(false), async (req,res,next)=>{ try{
  const { boardId } = req.query;
  const items = await List.find({ boardId }).sort({ order:1 });
  res.json(items);
}catch(e){next(e)}});

router.post('/', auth(), async (req,res,next)=>{ try{
  const { boardId, title } = req.body;
  const max = await List.find({ boardId }).sort({ order:-1 }).limit(1);
  const order = max[0]?.order ? max[0].order + 1 : 1;
  const list = await List.create({ boardId, title, order });
  global.__boardEmit?.(boardId, 'list:created', list);
  res.status(201).json(list);
}catch(e){next(e)}});

router.patch('/:id', auth(), async (req,res,next)=>{ try{
  const list = await List.findByIdAndUpdate(req.params.id, req.body, { new:true });
  global.__boardEmit?.(list.boardId, 'list:updated', list);
  res.json(list);
}catch(e){next(e)}});

export default router;

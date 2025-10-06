import { Router } from 'express';
import Board from '../models/Board.js';
import { auth } from '../middleware/auth.js';
const router = Router();

router.get('/', auth(false), async (_req,res,next)=>{ try{
  res.json(await Board.find({}).sort({ createdAt:1 }));
}catch(e){next(e)}});

router.post('/', auth(), async (req,res,next)=>{ try{
  const b = await Board.create({ title: req.body.title || 'Untitled', members:[req.user?._id], bg: req.body.bg });
  res.status(201).json(b);
}catch(e){next(e)}});

export default router;

import { Router } from 'express'
import Activity from '../models/Activity.js'
import { auth } from '../middleware/auth.js'

const router = Router()

// Get all activities for a board
router.get('/', auth(false), async (req, res, next) => {
  try {
    const { boardId, limit = 50 } = req.query
    if (!boardId) return res.status(400).json({ error: 'Missing boardId' })

    const activities = await Activity.find({ boardId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))

    res.json(activities)
  } catch (err) {
    next(err)
  }
})

// Add an activity log (e.g., when card moved)
router.post('/', auth(), async (req, res, next) => {
  try {
    const { boardId, type, meta } = req.body
    if (!boardId || !type)
      return res.status(400).json({ error: 'boardId and type are required' })

    const act = await Activity.create({
      boardId,
      type,
      by: req.user
        ? { id: req.user._id, name: req.user.name }
        : { id: 'system', name: 'System' },
      meta: meta || {},
    })

    // Broadcast new activity to board room (socket.io)
    global.__boardEmit?.(boardId, 'activity:created', act)

    res.status(201).json(act)
  } catch (err) {
    next(err)
  }
})

export default router

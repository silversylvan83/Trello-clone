// backend/src/routes/auth.js
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = Router();

function sign(user, expiresIn = '2h') {
  const payload = { _id: String(user._id), name: user.name, email: user.email };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

/**
 * POST /api/auth/register
 * body: { name, email, password }
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name = '', email = '', password = '' } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email & password required' });

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim() || email.split('@')[0],
      email: email.toLowerCase().trim(),
      passwordHash,
    });

    const token = sign(user);
    res.status(201).json({ token, user: { _id: String(user._id), name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 * body: { email, password }
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email = '', password = '' } = req.body || {};
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash || '');
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = sign(user);
    res.json({ token, user: { _id: String(user._id), name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 * header: Authorization: Bearer <token>
 */
router.get('/me', auth(), async (req, res) => {
  // req.user is set by middleware (decoded JWT)
  res.json({ user: req.user });
});

/**
 * POST /api/auth/refresh
 * header: Authorization: Bearer <token>
 * returns a new short-lived token (optional)
 */
router.post('/refresh', auth(), async (req, res) => {
  const token = sign(req.user, '2h');
  res.json({ token, user: req.user });
});

/**
 * POST /api/auth/logout
 * (JWT is stateless—client should delete token. Kept for symmetry.)
 */
router.post('/logout', (_req, res) => {
  res.json({ ok: true });
});

export default router;

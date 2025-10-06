import jwt from 'jsonwebtoken';
export function auth(required = true) {
  return (req, res, next) => {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/,'');
    if (!token) return required ? res.status(401).json({ error: 'Unauthorized' }) : next();
    try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
    catch { res.status(401).json({ error: 'Invalid token' }); }
  };
}

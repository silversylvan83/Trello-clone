import jwt from 'jsonwebtoken';

export function auth(required = true) {
  return (req, res, next) => {
    try {
      const header = req.headers.authorization;
      if (!header) {
        if (required) return res.status(401).json({ error: 'Missing Authorization header' });
        return next();
      }

      const [, token] = header.split(' ');
      if (!token) {
        if (required) return res.status(401).json({ error: 'Malformed Authorization header' });
        return next();
      }

      // Verify and attach user payload
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      return next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      // Unexpected failure
      console.error('JWT verification error:', err);
      return res.status(500).json({ error: 'Authentication check failed' });
    }
  };
}

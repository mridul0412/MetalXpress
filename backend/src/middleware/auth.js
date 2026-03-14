const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function adminMiddleware(req, res, next) {
  const password = req.headers['x-admin-password'] || req.body?.adminPassword;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Admin access denied' });
  }
  next();
}

module.exports = { authMiddleware, adminMiddleware };

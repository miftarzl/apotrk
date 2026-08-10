module.exports = function adminAuth(req, res, next) {
  const key = req.headers['x-admin-key'] || req.headers['authorization'];
  if (!key) return res.status(401).json({ error: 'Missing admin key' });
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) return res.status(500).json({ error: 'Server misconfigured' });
  if (key !== expected) return res.status(403).json({ error: 'Invalid admin key' });
  next();
}

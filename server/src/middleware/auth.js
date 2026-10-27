const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { httpError } = require('../util');

function secret() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set');
  return process.env.JWT_SECRET;
}

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, secret(), { expiresIn: '7d' });
}

async function loadUser(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, secret());
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, leo_club, leo_id, role, status FROM users WHERE id = ?',
      [payload.sub]
    );
    const user = rows[0];
    return user && user.status === 'active' ? user : null;
  } catch {
    return null;
  }
}

async function optionalAuth(req, res, next) {
  req.user = await loadUser(req);
  next();
}

async function requireAuth(req, res, next) {
  req.user = await loadUser(req);
  if (!req.user) return next(httpError(401, 'Please sign in'));
  next();
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    if (req.user.role !== 'admin') return next(httpError(403, 'Admins only'));
    next();
  });
}

module.exports = { signToken, optionalAuth, requireAuth, requireAdmin };

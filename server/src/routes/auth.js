const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { signToken, requireAuth } = require('../middleware/auth');
const { httpError, wrap, pick } = require('../util');

// Small in-memory limiter: 10 login attempts per IP per 15 minutes.
const attempts = new Map();
function limitLogin(req, res, next) {
  const now = Date.now();
  const entry = attempts.get(req.ip) || { count: 0, reset: now + 15 * 60 * 1000 };
  if (now > entry.reset) Object.assign(entry, { count: 0, reset: now + 15 * 60 * 1000 });
  entry.count += 1;
  attempts.set(req.ip, entry);
  if (entry.count > 10) return next(httpError(429, 'Too many attempts. Try again in a few minutes.'));
  next();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/register', limitLogin, wrap(async (req, res) => {
  const data = pick(req.body, ['name', 'email', 'password', 'phone', 'leo_club', 'leo_id']);
  if (!data.name || !data.email || !data.password || !data.leo_club) {
    throw httpError(400, 'Name, email, password and Leo club are required');
  }
  if (!EMAIL_RE.test(data.email)) throw httpError(400, 'Enter a valid email address');
  if (String(data.password).length < 8) throw httpError(400, 'Password must be at least 8 characters');

  const email = data.email.toLowerCase();
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length) throw httpError(409, 'An account with this email already exists');

  const hash = await bcrypt.hash(String(data.password), 10);
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash, phone, leo_club, leo_id) VALUES (?, ?, ?, ?, ?, ?)',
    [data.name, email, hash, data.phone, data.leo_club, data.leo_id]
  );
  const user = { id: result.insertId, name: data.name, email, phone: data.phone, leo_club: data.leo_club, leo_id: data.leo_id, role: 'leo', status: 'active' };
  res.status(201).json({ token: signToken(user), user });
}));

router.post('/login', limitLogin, wrap(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) throw httpError(400, 'Email and password are required');
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [String(email).toLowerCase().trim()]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(String(password), user.password_hash))) {
    throw httpError(401, 'Incorrect email or password');
  }
  if (user.status !== 'active') throw httpError(403, 'This account has been suspended');
  attempts.delete(req.ip);
  delete user.password_hash;
  res.json({ token: signToken(user), user });
}));

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

router.put('/me', requireAuth, wrap(async (req, res) => {
  const data = pick(req.body, ['name', 'phone', 'leo_club', 'leo_id']);
  if (data.name === null || data.leo_club === null) throw httpError(400, 'Name and Leo club cannot be empty');
  if (Object.keys(data).length) {
    await pool.query('UPDATE users SET ? WHERE id = ?', [data, req.user.id]);
  }
  if (req.body.new_password) {
    if (String(req.body.new_password).length < 8) throw httpError(400, 'Password must be at least 8 characters');
    const [[row]] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (!(await bcrypt.compare(String(req.body.current_password || ''), row.password_hash))) {
      throw httpError(400, 'Current password is incorrect');
    }
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [await bcrypt.hash(String(req.body.new_password), 10), req.user.id]);
  }
  const [[user]] = await pool.query('SELECT id, name, email, phone, leo_club, leo_id, role, status FROM users WHERE id = ?', [req.user.id]);
  res.json({ user });
}));

module.exports = router;

const router = require('express').Router();
const pool = require('../db/pool');
const { requireAdmin } = require('../middleware/auth');
const { httpError, wrap, slugify } = require('../util');

router.use(requireAdmin);

router.get('/overview', wrap(async (req, res) => {
  const [[row]] = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM businesses WHERE status = 'pending') AS pending,
       (SELECT COUNT(*) FROM businesses WHERE status = 'approved') AS approved,
       (SELECT COUNT(*) FROM businesses WHERE status = 'rejected') AS rejected,
       (SELECT COUNT(*) FROM users WHERE role = 'leo') AS leos,
       (SELECT COALESCE(SUM(views), 0) FROM businesses) AS views`
  );
  res.json(row);
}));

router.get('/businesses', wrap(async (req, res) => {
  const status = ['pending', 'approved', 'rejected'].includes(req.query.status) ? req.query.status : 'pending';
  const [items] = await pool.query(
    `SELECT b.id, b.name, b.slug, b.tagline, b.status, b.review_note, b.featured, b.district, b.city,
       b.logo_url, b.views, b.created_at, b.updated_at, c.name AS category,
       u.name AS owner_name, u.email AS owner_email, u.leo_club AS owner_club, u.leo_id AS owner_leo_id
     FROM businesses b LEFT JOIN categories c ON c.id = b.category_id JOIN users u ON u.id = b.owner_id
     WHERE b.status = ? ORDER BY b.updated_at DESC`,
    [status]
  );
  res.json({ items });
}));

router.patch('/businesses/:id', wrap(async (req, res) => {
  const updates = {};
  const { status, review_note, featured } = req.body || {};
  if (status !== undefined) {
    if (!['pending', 'approved', 'rejected'].includes(status)) throw httpError(400, 'Invalid status');
    updates.status = status;
    updates.review_note = status === 'rejected' ? (review_note || null) : null;
  }
  if (featured !== undefined) updates.featured = featured ? 1 : 0;
  if (!Object.keys(updates).length) throw httpError(400, 'Nothing to update');
  const [result] = await pool.query('UPDATE businesses SET ? WHERE id = ?', [updates, req.params.id]);
  if (!result.affectedRows) throw httpError(404, 'Business not found');
  res.json({ ok: true });
}));

router.get('/users', wrap(async (req, res) => {
  const [items] = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.leo_club, u.leo_id, u.role, u.status, u.created_at,
       (SELECT COUNT(*) FROM businesses b WHERE b.owner_id = u.id) AS business_count
     FROM users u ORDER BY u.created_at DESC`
  );
  res.json({ items });
}));

router.patch('/users/:id', wrap(async (req, res) => {
  const { status, role } = req.body || {};
  const updates = {};
  if (status !== undefined) {
    if (!['active', 'suspended'].includes(status)) throw httpError(400, 'Invalid status');
    updates.status = status;
  }
  if (role !== undefined) {
    if (!['leo', 'admin'].includes(role)) throw httpError(400, 'Invalid role');
    updates.role = role;
  }
  if (Number(req.params.id) === req.user.id) throw httpError(400, 'You cannot change your own account here');
  if (!Object.keys(updates).length) throw httpError(400, 'Nothing to update');
  await pool.query('UPDATE users SET ? WHERE id = ?', [updates, req.params.id]);
  res.json({ ok: true });
}));

router.post('/categories', wrap(async (req, res) => {
  const name = String(req.body?.name || '').trim();
  if (!name) throw httpError(400, 'Category name is required');
  const icon = String(req.body?.icon || 'sparkles').trim();
  const [[{ next }]] = await pool.query('SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM categories');
  try {
    const [result] = await pool.query('INSERT INTO categories (name, slug, icon, sort_order) VALUES (?, ?, ?, ?)', [name, slugify(name), icon, next]);
    res.status(201).json({ category: { id: result.insertId, name, slug: slugify(name), icon } });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') throw httpError(409, 'That category already exists');
    throw e;
  }
}));

router.delete('/categories/:id', wrap(async (req, res) => {
  await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
}));

module.exports = router;

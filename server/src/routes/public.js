const router = require('express').Router();
const pool = require('../db/pool');
const { optionalAuth } = require('../middleware/auth');
const { DISTRICTS } = require('../constants');
const { httpError, wrap } = require('../util');

const LIST_FIELDS = `b.id, b.name, b.slug, b.tagline, b.district, b.city, b.logo_url, b.cover_url,
  b.featured, b.views, b.created_at, c.name AS category, c.slug AS category_slug, c.icon AS category_icon,
  u.leo_club AS owner_club`;

router.get('/meta', wrap(async (req, res) => {
  const [categories] = await pool.query(
    `SELECT c.id, c.name, c.slug, c.icon,
       (SELECT COUNT(*) FROM businesses b WHERE b.category_id = c.id AND b.status = 'approved') AS count
     FROM categories c ORDER BY c.sort_order, c.name`
  );
  res.json({ categories, districts: DISTRICTS });
}));

router.get('/stats', wrap(async (req, res) => {
  const [[row]] = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM businesses WHERE status = 'approved') AS businesses,
       (SELECT COUNT(*) FROM offerings o JOIN businesses b ON b.id = o.business_id WHERE b.status = 'approved') AS offerings,
       (SELECT COUNT(DISTINCT owner_id) FROM businesses WHERE status = 'approved') AS entrepreneurs,
       (SELECT COUNT(DISTINCT district) FROM businesses WHERE status = 'approved' AND district IS NOT NULL) AS districts`
  );
  res.json(row);
}));

router.get('/businesses', wrap(async (req, res) => {
  const { q, category, district, type, featured } = req.query;
  const sort = req.query.sort || 'newest';
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(48, Math.max(1, parseInt(req.query.limit, 10) || 12));

  const where = ["b.status = 'approved'"];
  const params = [];
  if (q) {
    const like = `%${String(q).trim()}%`;
    where.push(`(b.name LIKE ? OR b.tagline LIKE ? OR b.description LIKE ? OR b.city LIKE ?
      OR EXISTS (SELECT 1 FROM offerings o WHERE o.business_id = b.id AND o.title LIKE ?))`);
    params.push(like, like, like, like, like);
  }
  if (category) { where.push('c.slug = ?'); params.push(category); }
  if (district) { where.push('b.district = ?'); params.push(district); }
  if (type === 'product' || type === 'service') {
    where.push('EXISTS (SELECT 1 FROM offerings o WHERE o.business_id = b.id AND o.type = ?)');
    params.push(type);
  }
  if (featured === '1') where.push('b.featured = 1');

  const order = {
    newest: 'b.created_at DESC',
    popular: 'b.views DESC',
    name: 'b.name ASC',
  }[sort] || 'b.created_at DESC';

  const from = `FROM businesses b
    LEFT JOIN categories c ON c.id = b.category_id
    JOIN users u ON u.id = b.owner_id
    WHERE ${where.join(' AND ')}`;

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${from}`, params);
  const [items] = await pool.query(
    `SELECT ${LIST_FIELDS},
       (SELECT COUNT(*) FROM offerings o WHERE o.business_id = b.id) AS offering_count
     ${from} ORDER BY b.featured DESC, ${order} LIMIT ? OFFSET ?`,
    [...params, limit, (page - 1) * limit]
  );
  res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
}));

router.get('/businesses/:slug', optionalAuth, wrap(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT b.*, c.name AS category, c.slug AS category_slug, c.icon AS category_icon,
       u.name AS owner_name, u.leo_club AS owner_club
     FROM businesses b
     LEFT JOIN categories c ON c.id = b.category_id
     JOIN users u ON u.id = b.owner_id
     WHERE b.slug = ?`,
    [req.params.slug]
  );
  const business = rows[0];
  const canPreview = req.user && (req.user.role === 'admin' || req.user.id === business?.owner_id);
  if (!business || (business.status !== 'approved' && !canPreview)) throw httpError(404, 'Business not found');

  if (business.status === 'approved' && !canPreview) {
    await pool.query('UPDATE businesses SET views = views + 1 WHERE id = ?', [business.id]);
  }
  const [offerings] = await pool.query(
    'SELECT id, type, title, description, price, image_url FROM offerings WHERE business_id = ? ORDER BY sort_order, id',
    [business.id]
  );
  const [related] = await pool.query(
    `SELECT ${LIST_FIELDS} FROM businesses b LEFT JOIN categories c ON c.id = b.category_id JOIN users u ON u.id = b.owner_id
     WHERE b.status = 'approved' AND b.id <> ? AND b.category_id <=> ? ORDER BY RAND() LIMIT 3`,
    [business.id, business.category_id]
  );
  if (!canPreview) delete business.review_note;
  res.json({ business, offerings, related });
}));

module.exports = router;

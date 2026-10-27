// Routes for a signed-in Leo to manage their own listings.
const router = require('express').Router();
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');
const { DISTRICTS } = require('../constants');
const { httpError, wrap, pick, slugify, cleanUrl } = require('../util');

router.use(requireAuth);

const BUSINESS_FIELDS = ['name', 'tagline', 'description', 'category_id', 'district', 'city', 'address',
  'phone', 'whatsapp', 'email', 'website', 'facebook', 'instagram', 'logo_url', 'cover_url'];
const OFFERING_FIELDS = ['type', 'title', 'description', 'price', 'image_url', 'sort_order'];

function validateBusiness(data, creating) {
  if (creating && !data.name) throw httpError(400, 'Business name is required');
  if (data.name === null) throw httpError(400, 'Business name is required');
  if (data.district && !DISTRICTS.includes(data.district)) throw httpError(400, 'Choose a valid district');
  if (data.category_id) data.category_id = Number(data.category_id) || null;
  for (const k of ['website', 'facebook', 'instagram']) if (data[k]) data[k] = cleanUrl(data[k]);
  if (data.tagline && data.tagline.length > 200) throw httpError(400, 'Tagline is too long (200 characters max)');
}

async function uniqueSlug(name, excludeId = 0) {
  const base = slugify(name);
  let slug = base;
  for (let i = 2; ; i++) {
    const [rows] = await pool.query('SELECT id FROM businesses WHERE slug = ? AND id <> ?', [slug, excludeId]);
    if (!rows.length) return slug;
    slug = `${base}-${i}`;
  }
}

async function ownBusiness(req, id) {
  const [rows] = await pool.query('SELECT * FROM businesses WHERE id = ?', [id]);
  const b = rows[0];
  if (!b || (b.owner_id !== req.user.id && req.user.role !== 'admin')) throw httpError(404, 'Business not found');
  return b;
}

router.get('/businesses', wrap(async (req, res) => {
  const [items] = await pool.query(
    `SELECT b.id, b.name, b.slug, b.tagline, b.status, b.review_note, b.logo_url, b.cover_url, b.views,
       b.featured, b.updated_at, c.name AS category,
       (SELECT COUNT(*) FROM offerings o WHERE o.business_id = b.id) AS offering_count
     FROM businesses b LEFT JOIN categories c ON c.id = b.category_id
     WHERE b.owner_id = ? ORDER BY b.updated_at DESC`,
    [req.user.id]
  );
  res.json({ items });
}));

router.get('/businesses/:id', wrap(async (req, res) => {
  const business = await ownBusiness(req, req.params.id);
  const [offerings] = await pool.query('SELECT * FROM offerings WHERE business_id = ? ORDER BY sort_order, id', [business.id]);
  res.json({ business, offerings });
}));

router.post('/businesses', wrap(async (req, res) => {
  const data = pick(req.body, BUSINESS_FIELDS);
  validateBusiness(data, true);
  data.slug = await uniqueSlug(data.name);
  data.owner_id = req.user.id;
  data.status = 'pending';
  const [result] = await pool.query('INSERT INTO businesses SET ?', [data]);
  const [[business]] = await pool.query('SELECT * FROM businesses WHERE id = ?', [result.insertId]);
  res.status(201).json({ business });
}));

router.put('/businesses/:id', wrap(async (req, res) => {
  const existing = await ownBusiness(req, req.params.id);
  const data = pick(req.body, BUSINESS_FIELDS);
  validateBusiness(data, false);
  if (data.name && data.name !== existing.name) data.slug = await uniqueSlug(data.name, existing.id);
  // A rejected listing goes back into the review queue once the owner edits it.
  if (existing.status === 'rejected') data.status = 'pending';
  if (Object.keys(data).length) await pool.query('UPDATE businesses SET ? WHERE id = ?', [data, existing.id]);
  const [[business]] = await pool.query('SELECT * FROM businesses WHERE id = ?', [existing.id]);
  res.json({ business });
}));

router.delete('/businesses/:id', wrap(async (req, res) => {
  const existing = await ownBusiness(req, req.params.id);
  await pool.query('DELETE FROM businesses WHERE id = ?', [existing.id]);
  res.json({ ok: true });
}));

function validateOffering(data, creating) {
  if (creating && !data.title) throw httpError(400, 'Title is required');
  if (data.title === null) throw httpError(400, 'Title is required');
  if (data.type && !['product', 'service'].includes(data.type)) throw httpError(400, 'Type must be product or service');
}

router.post('/businesses/:id/offerings', wrap(async (req, res) => {
  const business = await ownBusiness(req, req.params.id);
  const data = pick(req.body, OFFERING_FIELDS);
  validateOffering(data, true);
  data.business_id = business.id;
  const [result] = await pool.query('INSERT INTO offerings SET ?', [data]);
  const [[offering]] = await pool.query('SELECT * FROM offerings WHERE id = ?', [result.insertId]);
  res.status(201).json({ offering });
}));

async function ownOffering(req, id) {
  const [rows] = await pool.query('SELECT * FROM offerings WHERE id = ?', [id]);
  if (!rows[0]) throw httpError(404, 'Item not found');
  await ownBusiness(req, rows[0].business_id);
  return rows[0];
}

router.put('/offerings/:id', wrap(async (req, res) => {
  const existing = await ownOffering(req, req.params.id);
  const data = pick(req.body, OFFERING_FIELDS);
  validateOffering(data, false);
  if (Object.keys(data).length) await pool.query('UPDATE offerings SET ? WHERE id = ?', [data, existing.id]);
  const [[offering]] = await pool.query('SELECT * FROM offerings WHERE id = ?', [existing.id]);
  res.json({ offering });
}));

router.delete('/offerings/:id', wrap(async (req, res) => {
  const existing = await ownOffering(req, req.params.id);
  await pool.query('DELETE FROM offerings WHERE id = ?', [existing.id]);
  res.json({ ok: true });
}));

module.exports = router;
